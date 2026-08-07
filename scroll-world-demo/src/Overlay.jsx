const sections = [
  {
    id: 'discovery',
    eyebrow: '01 — DISCOVERY',
    title: 'Enter a New World',
    body: 'Scroll to begin your journey through an immersive 3D universe where every pixel tells a story.',
    accent: '#6b5ce7',
  },
  {
    id: 'journey',
    eyebrow: '02 — JOURNEY',
    title: 'The Path Unfolds',
    body: 'Glide through floating islands and cosmic rings as the world responds to your every scroll.',
    accent: '#e75c8a',
  },
  {
    id: 'creation',
    eyebrow: '03 — CREATION',
    title: 'Where Ideas Take Shape',
    body: 'Watch as geometry and light converge, sculpted by the same scroll that guides your way.',
    accent: '#5ce7a0',
  },
  {
    id: 'summit',
    eyebrow: '04 — SUMMIT',
    title: 'Built with Scroll World',
    body: 'Three.js + React Three Fiber + GSAP ScrollTrigger — seamless 3D scroll experiences.',
    accent: '#e7c05c',
  },
]

export function Overlay() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      color: '#fff',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      pointerEvents: 'none',
    }}>
      {sections.map((s, i) => (
        <section
          key={s.id}
          className="scroll-world-section"
          data-section={i}
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 clamp(2rem, 8vw, 8rem)',
            maxWidth: 640,
          }}
        >
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: s.accent,
            marginBottom: 12,
          }}>
            {s.eyebrow}
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            {s.title}
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
            lineHeight: 1.6,
            opacity: 0.7,
            maxWidth: 420,
          }}>
            {s.body}
          </p>
        </section>
      ))}
      <div style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ opacity: 0.3, fontSize: '0.85rem' }}>scroll-world · powered by Three.js + R3F + GSAP</span>
      </div>
    </div>
  )
}
