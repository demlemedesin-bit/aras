/** Sayfa başına bir kez render edilen SVG sprite. */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <symbol id="i-arr" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M14 6l6 6-6 6" /></symbol>
      <symbol id="i-ne" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" /></symbol>
      <symbol id="i-down" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M6 14l6 6 6-6" /></symbol>
      <symbol id="i-globe" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z" /></g></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></symbol>
      <symbol id="i-ok" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 10 17.5 19 7" /></symbol>
    </svg>
  );
}

export type IconName = 'arr' | 'ne' | 'down' | 'globe' | 'lock' | 'x' | 'ok';

export function Icon({ n, rotate }: { n: IconName; rotate?: number }) {
  return (
    <svg aria-hidden="true" style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}>
      <use href={`#i-${n}`} />
    </svg>
  );
}
