export default function JobCard({ job, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #3333",
        background: selected ? "#f1f1f1" : "white",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600 }}>{job.name}</div>
      <div style={{ opacity: 0.6, fontSize: 12 }}>{job.job_slug}</div>
    </button>
  );
}
