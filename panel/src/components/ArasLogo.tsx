export default function ArasLogo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: Math.max(8, size * 0.22), background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)' }}>
      <img src="/aras-logo.png" alt="Aras Metal" style={{ width: '88%', height: 'auto', display: 'block' }} />
    </span>
  )
}
