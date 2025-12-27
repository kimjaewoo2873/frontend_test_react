import { useEffect, useState } from "react";
import { fetchJobDetail } from "../../lib/supabase/jobsApi";

export default function JobDetailPanel({ jobSlug }) {
  const [job, setJob] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobSlug) return;

    (async () => {
      setLoading(true);
      setErr(null);
      setJob(null);

      const { data, error } = await fetchJobDetail(jobSlug);

      if (error) setErr(error.message);
      else setJob(data);

      setLoading(false);
    })();
  }, [jobSlug]);

  if (!jobSlug) return <div style={{ padding: 16 }}>왼쪽에서 직업을 선택하세요.</div>;
  if (loading) return <div style={{ padding: 16 }}>상세 불러오는 중...</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>RPC 에러: {err}</div>;
  if (!job) return <div style={{ padding: 16 }}>데이터 없음</div>;

  const evidences = job.one_liner?.evidences ?? [];
  const edges = job.edges ?? [];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{job.name}</h2>

      {job.one_liner?.text ? (
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>{job.one_liner.text}</p>
      ) : (
        <p style={{ opacity: 0.7 }}>one_liner 없음</p>
      )}

      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: "pointer" }}>근거(evidence) 보기</summary>
        {evidences.length === 0 ? (
          <div style={{ marginTop: 8, opacity: 0.7 }}>연결된 근거가 없습니다.</div>
        ) : (
          <ul style={{ marginTop: 8 }}>
            {evidences.map((ev) => (
              <li key={ev.evidence_key} style={{ marginBottom: 10 }}>
                <div>
                  <strong>{ev.evidence_key}</strong>{" "}
                  {ev.source_url && (
                    <a href={ev.source_url} target="_blank" rel="noreferrer">
                      (source)
                    </a>
                  )}
                </div>
                {ev.quote && <div style={{ opacity: 0.85 }}>{ev.quote}</div>}
              </li>
            ))}
          </ul>
        )}
      </details>

      <h3 style={{ marginTop: 18 }}>연결된 직업(edges)</h3>
      {edges.length === 0 ? (
        <div style={{ opacity: 0.7 }}>연결된 직업이 없습니다.</div>
      ) : (
        <ul>
          {edges.map((e, idx) => (
            <li key={`${e.to_job_slug}-${idx}`} style={{ marginBottom: 6 }}>
              <strong>{e.to_job_name}</strong>{" "}
              <span style={{ opacity: 0.7 }}>({e.to_job_slug})</span>
              <div style={{ opacity: 0.8, fontSize: 13 }}>
                type: {e.relation_type} · weight: {e.weight}
              </div>
            </li>
          ))}
        </ul>
      )}

      <details style={{ marginTop: 18 }}>
        <summary style={{ cursor: "pointer" }}>RAW JSON</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(job, null, 2)}</pre>
      </details>
    </div>
  );
}
