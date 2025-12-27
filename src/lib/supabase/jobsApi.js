import { supabase } from "./client";

/** jobs 목록 가져오기 */
export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id, job_slug, name, one_liner,
      job_categories ( major, middle, minor, tags )
    `)
    .order("name", { ascending: true });

  if (error) throw error;

  // job_categories가 배열로 오니까 major 하나만 쓰는 경우 평탄화
  return (data ?? []).map(j => ({
    ...j,
    category: j.job_categories?.[0]?.major ?? null,
  }));
}


/** job_slug로 상세 JSON 가져오기 (RPC) */
export async function fetchJobDetail(job_slug) {
  const { data, error } = await supabase.rpc("get_job_detail", { p_job_slug: job_slug });
  if (error) throw error;
  return data;
}

/** job_edges 가져오기 */
export async function fetchJobEdges() {
  return await supabase
    .from("job_edges")
    .select("from_job_slug, to_job_slug, relation_type, weight");
}