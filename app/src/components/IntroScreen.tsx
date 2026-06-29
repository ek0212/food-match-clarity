/**
 * Landing page: dark teal hero with animated flavor-map visualization.
 */

interface IntroScreenProps {
  onStart: () => void;
  hasFriendProfile: boolean;
}

// Deterministic seeded random (same as original Epicure viz)
function sr(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface Dot { x: number; y: number; s: number; color: string }

function buildCluster(ci: number, color: string): Dot[] {
  return Array.from({ length: 120 }, (_, i) => {
    const angle  = sr(i * 9  + ci) * Math.PI * 2;
    const rx     = Math.pow(sr(i * 17 + 4), 0.55) * 105;
    const ry     = Math.pow(sr(i * 21 + 8), 0.65) * 65;
    return {
      x: 105 + Math.cos(angle) * rx,
      y:  65 + Math.sin(angle) * ry,
      s: 3 + sr(i * 31 + ci) * 11,
      color,
    };
  });
}

const CLUSTERS = [
  { x: 145, y: 225, color: '#ffe3b7' },
  { x: 265, y:  68, color: '#a8f6b0' },
  { x: 560, y:  78, color: '#58f1df' },
  { x: 845, y: 138, color: '#39e8d3' },
  { x: 650, y: 225, color: '#f1ffd2' },
];

const LABELS = [
  { cls: 'l1', text: 'M1 · Sweet\nConfectionery',      right: false },
  { cls: 'l2', text: 'M4 · Mediterranean\nCheese & Oil', right: false },
  { cls: 'l3', text: 'M2 · Chinese\nWok Essentials',    right: false },
  { cls: 'l4', text: 'M0 · Chinese\nFermented Pantry',  right: true  },
  { cls: 'l5', text: 'M3 · East Asian\nStir-Fry',       right: true  },
];

export function IntroScreen({ onStart, hasFriendProfile }: IntroScreenProps) {
  return (
    <div className="intro-screen">

      {/* ── Flavor map ── */}
      <div className="flavor-map" aria-label="Ingredient flavor map">
        <div className="flavor-dust" />
        {CLUSTERS.map((c, ci) => (
          <div key={ci} className="flavor-cluster" style={{ left: c.x, top: c.y }}>
            {buildCluster(ci, c.color).map((d, i) => (
              <span key={i} style={{
                position: 'absolute',
                left: d.x, top: d.y,
                width: d.s, height: d.s,
                borderRadius: '999px',
                background: d.color,
                boxShadow: `0 0 14px ${d.color}b0`,
              }} />
            ))}
          </div>
        ))}
        {LABELS.map((l) => (
          <div key={l.cls} className={`flavor-label ${l.cls}${l.right ? ' right' : ''}`}>
            {l.right && <i />}
            <span style={{ whiteSpace: 'pre-line' }}>{l.text}</span>
            {!l.right && <i />}
          </div>
        ))}
      </div>

      <h1>Food Match</h1>
      <p className="subtitle">Find your palate. Find what to eat together.</p>

      {hasFriendProfile && (
        <div className="friend-cta">
          <p><strong>A friend shared their taste profile with you!</strong></p>
          <p>Take the quiz to see what you have in common and what to eat together.</p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="intro-stats">
        <div className="intro-stat"><strong>📖 4M+</strong><span>RECIPES</span></div>
        <div className="intro-stat"><strong>🌱 1,790</strong><span>INGREDIENTS</span></div>
        <div className="intro-stat"><strong>🌐 7</strong><span>LANGUAGES</span></div>
        <div className="intro-stat"><strong>✣ 1 MAP</strong><span>OF FLAVOR</span></div>
      </div>

      {/* ── How it works ── */}
      <div className="how-it-works">
        <h2>✦ How it works</h2>
        <div className="how-step">
          <div className="how-icon">⌬</div>
          <p>A research project called <b>Epicure</b> scanned over <b>4 million recipes</b> across <b>7 languages</b> and mapped how <b>1,790 ingredients</b> actually relate to each other.</p>
        </div>
        <div className="how-step">
          <div className="how-icon">♡</div>
          <p>This quiz uses that map to figure out your palate in about <b>5 minutes</b>. Rate <b>50 ingredients</b> and see your cuisine matches, dish ideas, and flavor profile.</p>
        </div>
        <div className="how-step">
          <div className="how-icon">👥</div>
          <p>Share your results with a friend. See what you both love, where you differ, and what to <b>eat together tonight</b>.</p>
        </div>
      </div>

      <button className="start-button" onClick={onStart}>
        🌱 {hasFriendProfile ? "TAKE THE QUIZ & COMPARE" : "START THE QUIZ"}
      </button>

      <div className="intro-ingredients" aria-hidden="true">
        <span>🌶</span><span>🌿</span><span>🧀</span><span>🧄</span><span>🍋</span><span>✺</span><span>🍜</span>
      </div>

      <footer className="intro-footer">
        Powered by{' '}
        <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noopener noreferrer">
          <b>Epicure (CC-BY-4.0)</b>
        </a>.
        {' '}Inspired by{' '}
        <a href="https://x.com/josefchen/status/2059350978109874677/photo/1" target="_blank" rel="noopener noreferrer">
          this post ↗
        </a>
      </footer>
    </div>
  );
}
