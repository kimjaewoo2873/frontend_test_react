import { useEffect, useState } from "react";
import { fetchJobs } from "../../lib/supabase/jobsApi";
import JobCard from "./JobCard";

export default function JobList({ selectedSlug, onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data, error } = await fetchJobs();
      if (error) setErr(error.message);
      else setJobs(data ?? []);

      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>직업 목록</h3>

      {loading && <div>불러오는 중...</div>}
      {err && <div style={{ color: "crimson" }}>에러: {err}</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {jobs.map((j) => (
          <JobCard
            key={j.job_slug}
            job={j}
            selected={selectedSlug === j.job_slug}
            onClick={() => onSelect(j.job_slug)}
          />
        ))}
      </div>
    </div>
  );
}
