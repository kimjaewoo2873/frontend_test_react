export default function Page({ left, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: "100vh" }}>
      <aside style={{ borderRight: "1px solid #ddd", overflow: "auto" }}>{left}</aside>
      <main style={{ overflow: "auto" }}>{right}</main>
    </div>
  );
}
