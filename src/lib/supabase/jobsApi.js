import { supabase } from "./client";

/**
 * jobs 목록 가져오기
 */
export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id, job_slug, name, one_liner,
      job_categories ( major, middle, minor, tags )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchJobs error:", error);
    return { data: null, error };
  }

  const normalized = (data ?? []).map((j) => {
    const firstCategory = j.job_categories?.[0];
    
    return {
      id: j.id,
      job_slug: j.job_slug,
      name: j.name,
      one_liner: j.one_liner,
      category: firstCategory ? {
        major: firstCategory.major || '미분류',
        middle: firstCategory.middle || null,
        minor: firstCategory.minor || null,
        tags: firstCategory.tags || []
      } : null
    };
  });

  console.log("Normalized jobs:", normalized);
  return { data: normalized, error: null };
}

/**
 * 직업 그래프 데이터 가져오기 (노드 + 엣지)
 */
export async function fetchJobGraph() {
  try {
    // 1. 모든 직업 가져오기
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(
        `
        id, job_slug, name,
        job_categories ( major, middle, minor, tags )
      `
      )
      .order("name", { ascending: true });

    if (jobsError) {
      console.error("fetchJobGraph jobs error:", jobsError);
      return { nodes: [], edges: [], error: jobsError };
    }

    if (!jobsData || jobsData.length === 0) {
      console.warn("No jobs found in database");
      return { nodes: [], edges: [], error: null };
    }

    // 2. 모든 엣지 가져오기
    const { data: edgesData, error: edgesError } = await supabase
      .from("job_edges")
      .select(
        `
        id,
        from_job_id,
        to_job_id,
        relation_type,
        weight
      `
      );

    if (edgesError) {
      console.error("fetchJobGraph edges error:", edgesError);
      return { nodes: [], edges: [], error: edgesError };
    }

    // 3. job_id를 job_slug로 매핑하는 맵 생성
    const jobIdToSlug = {};
    const jobIdToData = {};
    jobsData.forEach(job => {
      jobIdToSlug[job.id] = job.job_slug;
      jobIdToData[job.id] = job;
    });

    // 4. 노드 데이터 생성 (직업 목록)
    const nodes = jobsData.map((job, index) => ({
      id: job.job_slug,
      type: 'default',
      data: { 
        label: job.name,
        jobId: job.id,
        category: job.job_categories?.[0]
      },
      position: {
        x: (index % 4) * 280 + 50,
        y: Math.floor(index / 4) * 220 + 50
      },
      style: {
        background: '#fff',
        border: '2px solid #3b82f6',
        borderRadius: 8,
        padding: 12,
        fontSize: 13,
        fontWeight: 500,
        minWidth: 150
      }
    }));

    // 5. 엣지 데이터 생성 (직업 간 연결)
    const edges = (edgesData || [])
      .filter(edge => {
        // from_job_id와 to_job_id가 모두 존재하는 경우만
        const hasFrom = jobIdToSlug[edge.from_job_id];
        const hasTo = jobIdToSlug[edge.to_job_id];
        
        if (!hasFrom || !hasTo) {
          console.warn(`Edge skipped: from=${edge.from_job_id}, to=${edge.to_job_id}`);
        }
        
        return hasFrom && hasTo;
      })
      .map(edge => {
        const edgeColors = {
          similar: '#3b82f6',
          transition: '#8b5cf6',
          prerequisite: '#10b981',
          expansion: '#f59e0b'
        };

        return {
          id: `edge-${edge.id}`,
          source: jobIdToSlug[edge.from_job_id],
          target: jobIdToSlug[edge.to_job_id],
          label: edge.relation_type,
          type: 'smoothstep',
          animated: edge.relation_type === 'similar',
          markerEnd: { type: 'ArrowClosed' },
          style: { 
            stroke: edgeColors[edge.relation_type] || '#3b82f6',
            strokeWidth: Math.max(1, edge.weight * 3)
          },
          data: {
            relationType: edge.relation_type,
            weight: edge.weight
          }
        };
      });

    console.log("Graph loaded:", { 
      nodeCount: nodes.length, 
      edgeCount: edges.length,
      sampleNodes: nodes.slice(0, 2),
      sampleEdges: edges.slice(0, 2)
    });

    return { nodes, edges, error: null };
  } catch (err) {
    console.error("fetchJobGraph unexpected error:", err);
    return { nodes: [], edges: [], error: { message: err.message } };
  }
}

/**
 * 직업 상세(RPC) 가져오기
 */
export async function fetchJobDetail(job_slug) {
  try {
    const result = await supabase.rpc("get_job_detail", { job_slug });
    
    if (result.error) {
      console.error("fetchJobDetail error:", result.error);
    } else {
      console.log("Job detail for", job_slug, ":", result.data);
    }
    
    return result;
  } catch (err) {
    console.error("fetchJobDetail unexpected error:", err);
    return { data: null, error: { message: err.message } };
  }
}

/**
 * 특정 직업의 연결된 엣지들 가져오기
 */
export async function fetchJobEdges(job_slug) {
  try {
    // 먼저 job_slug로 job_id 찾기
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, name")
      .eq("job_slug", job_slug)
      .single();

    if (jobError || !jobData) {
      console.error("fetchJobEdges job lookup error:", jobError);
      return { data: null, error: jobError };
    }

    const job_id = jobData.id;

    // 해당 직업의 모든 엣지 가져오기 (출발/도착 모두)
    const { data, error } = await supabase
      .from("job_edges")
      .select(
        `
        id,
        from_job_id,
        to_job_id,
        relation_type,
        weight
      `
      )
      .or(`from_job_id.eq.${job_id},to_job_id.eq.${job_id}`);

    if (error) {
      console.error("fetchJobEdges error:", error);
      return { data: null, error };
    }

    // 연결된 직업 정보도 함께 가져오기
    const connectedJobIds = new Set();
    (data || []).forEach(edge => {
      if (edge.from_job_id !== job_id) connectedJobIds.add(edge.from_job_id);
      if (edge.to_job_id !== job_id) connectedJobIds.add(edge.to_job_id);
    });

    const { data: connectedJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, job_slug, name")
      .in("id", Array.from(connectedJobIds));

    if (jobsError) {
      console.error("fetchJobEdges connected jobs error:", jobsError);
    }

    // 결과 조합
    const jobMap = {};
    (connectedJobs || []).forEach(job => {
      jobMap[job.id] = job;
    });

    const enrichedData = (data || []).map(edge => ({
      ...edge,
      from_job: edge.from_job_id === job_id 
        ? { job_slug, name: jobData.name }
        : jobMap[edge.from_job_id],
      to_job: edge.to_job_id === job_id
        ? { job_slug, name: jobData.name }
        : jobMap[edge.to_job_id]
    }));

    return { data: enrichedData, error: null };
  } catch (err) {
    console.error("fetchJobEdges unexpected error:", err);
    return { data: null, error: { message: err.message } };
  }
}