import { supabase } from "./client";

/**
 * jobs 목록 가져오기
 * - Supabase 스타일({ data, error }) 그대로 맞춰서 리턴
 * - job_categories는 배열로 오므로 첫 번째 카테고리만 category로 평탄화
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

  if (error) return { data: null, error };

  const normalized = (data ?? []).map((j) => ({
    ...j,
    category: j.job_categories?.[0] ?? null,
  }));

  return { data: normalized, error: null };
}

/**
 * 직업 상세(RPC) 가져오기
 * - get_job_detail(job_slug) RPC가 jsonb를 리턴한다고 가정
 * - Supabase 스타일({ data, error }) 그대로 리턴
 */
export async function fetchJobDetail(job_slug) {
  return await supabase.rpc("get_job_detail", { job_slug });
}

/**
 * (선택) edges를 직접 테이블로 조회하는 경우
 */
export async function fetchJobEdges(from_job_id) {
  return await supabase
    .from("job_edges")
    .select("from_job_id, to_job_id, relation_type, weight")
    .eq("from_job_id", from_job_id);
}
