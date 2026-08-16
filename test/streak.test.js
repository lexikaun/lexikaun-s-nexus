import { calculateStreak } from '../src/utils/streak.ts';
import assert from 'assert';

describe("Phase 2.9 — Streak Calculation Unit Tests", () => {
  const refDate = "2026-08-18"; // Tuesday

  it("Case 1: 5 consecutive days completed including today -> streak 5", () => {
    const history = {
      "2026-08-14": true,
      "2026-08-15": true,
      "2026-08-16": true,
      "2026-08-17": true,
      "2026-08-18": true,
    };
    const streak = calculateStreak(history, refDate);
    console.log("  [Streak Test] 5 consecutive days -> got:", streak);
    assert.strictEqual(streak, 5);
  });

  it("Case 2: Yesterday completed, today not yet completed (active grace) -> streak 3", () => {
    const history = {
      "2026-08-15": true,
      "2026-08-16": true,
      "2026-08-17": true,
      "2026-08-18": false,
    };
    const streak = calculateStreak(history, refDate);
    console.log("  [Streak Test] Yesterday completed, today pending -> got:", streak);
    assert.strictEqual(streak, 3);
  });

  it("Case 3: Broken streak (missed yesterday and today) -> streak 0", () => {
    const history = {
      "2026-08-14": true,
      "2026-08-15": true,
      "2026-08-16": true,
      // 2026-08-17 missing (missed)
      "2026-08-18": false,
    };
    const streak = calculateStreak(history, refDate);
    console.log("  [Streak Test] Broken streak -> got:", streak);
    assert.strictEqual(streak, 0);
  });

  it("Case 4: Single day completed today -> streak 1", () => {
    const history = {
      "2026-08-18": true,
    };
    const streak = calculateStreak(history, refDate);
    console.log("  [Streak Test] Single day today -> got:", streak);
    assert.strictEqual(streak, 1);
  });

  it("Case 5: Empty history -> streak 0", () => {
    const streak = calculateStreak({}, refDate);
    console.log("  [Streak Test] Empty history -> got:", streak);
    assert.strictEqual(streak, 0);
  });
});
