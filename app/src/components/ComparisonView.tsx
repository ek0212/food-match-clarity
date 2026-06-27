/**
 * Comparison view: shows compatibility between two profiles.
 */

import type { Comparison } from "../engine/types";

interface ComparisonViewProps {
  comparison: Comparison;
  friendName?: string;
}

export function ComparisonView({ comparison }: ComparisonViewProps) {
  const { sharedGround, conflicts, bridges, eatTogether } = comparison;

  return (
    <div className="comparison-view">
      <h2>Your Food Compatibility</h2>

      <section className="shared-section">
        <h3>What You Both Love</h3>
        <p className="summary">{sharedGround.summary}</p>

        {sharedGround.cuisines.length > 0 && (
          <div className="shared-cuisines">
            <h4>Shared cuisines</h4>
            {sharedGround.cuisines.map((c) => (
              <div key={c.direction} className="shared-item">
                <strong>{c.label}</strong>
                {c.topContributors.length > 0 && (
                  <span> — {c.topContributors.slice(0, 3).join(", ")}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {sharedGround.modes.length > 0 && (
          <div className="shared-modes">
            <h4>Shared flavor neighborhoods</h4>
            {sharedGround.modes.map((m) => (
              <div key={m.modeIndex} className="shared-item">
                <strong>{m.label}</strong>
                <span> — {m.examples.slice(0, 3).join(", ")}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {conflicts.length > 0 && (
        <section className="conflicts-section">
          <h3>Where You Differ</h3>
          {conflicts.map((conflict, i) => (
            <div key={i} className="conflict-item">
              <p>{conflict.summary}</p>
            </div>
          ))}
        </section>
      )}

      {bridges.length > 0 && (
        <section className="bridges-section">
          <h3>Something New to Try Together</h3>
          {bridges.map((bridge, i) => (
            <div key={i} className="bridge-item">
              <p>{bridge.summary}</p>
            </div>
          ))}
        </section>
      )}

      <section className="eat-together-section">
        <h3>Tonight's Suggestion</h3>
        <p className="eat-together">{eatTogether}</p>
      </section>
    </div>
  );
}
