export default function SimpleTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>If you can see this, routing is working!</p>
      <button onClick={() => alert('Button clicked!')}>Click Me</button>
    </div>
  );
}
