export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>WhatsApp SaaS</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Welcome to WhatsApp Automation Platform</p>
        <div>
          <a href="/login" style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', marginRight: '1rem', textDecoration: 'none' }}>
            Login
          </a>
          <a href="/register" style={{ display: 'inline-block', background: '#4b5563', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
