export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#1f2937'
        }}>
          🚀 Career Explorer
        </div>
        <div style={{
          padding: '4px 8px',
          background: '#dbeafe',
          color: '#1e40af',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600
        }}>
          Beta
        </div>
      </div>
    </header>
  );
}