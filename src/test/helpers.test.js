import { describe, it, expect } from "vitest";
import {
  r5,
  rU,
  calcHoistGear,
  parseMarkoutCSV,
  solveBeamReactions,
  generateEvenLoads,
} from "../wyp-assist.jsx";

describe("r5 — round up to nearest 5", () => {
  it("rounds 1 up to 5", () => expect(r5(1)).toBe(5));
  it("rounds 6 up to 10", () => expect(r5(6)).toBe(10));
  it("keeps 10 as 10", () => expect(r5(10)).toBe(10));
  it("rounds 0 to 0", () => expect(r5(0)).toBe(0));
  it("rounds 14 up to 15", () => expect(r5(14)).toBe(15));
  it("rounds 21 up to 25", () => expect(r5(21)).toBe(25));
});

describe("rU — round up (ceil)", () => {
  it("rounds 1.1 up to 2", () => expect(rU(1.1)).toBe(2));
  it("keeps 3 as 3", () => expect(rU(3)).toBe(3));
  it("rounds 2.5 up to 3", () => expect(rU(2.5)).toBe(3));
  it("rounds 0.1 up to 1", () => expect(rU(0.1)).toBe(1));
});

describe("calcHoistGear", () => {
  it("returns light gear for .25 Ton motors", () => {
    const items = calcHoistGear(".25 Ton", 2);
    expect(items.length).toBeGreaterThan(0);
    // Light gear uses 5/8" shackles (RIG10-00)
    const shackle = items.find((i) => i.catId === "RIG10-00");
    expect(shackle).toBeDefined();
    expect(shackle.name).toContain('Shackle 5/8"');
    // 7 per motor * 2 motors = 14, rounded to nearest 5 = 15
    expect(shackle.qty).toBe(15);
  });

  it("returns light gear for 1 Ton motors", () => {
    const items = calcHoistGear("1 Ton", 1);
    const shackle = items.find((i) => i.catId === "RIG10-00");
    expect(shackle).toBeDefined();
    // 7 per motor * 1 = 7, rounded to nearest 5 = 10
    expect(shackle.qty).toBe(10);
  });

  it("returns heavy gear for 2 Ton motors", () => {
    const items = calcHoistGear("2 Ton", 3);
    // Heavy gear uses 3/4" shackles (RIG17-10)
    const shackle = items.find((i) => i.catId === "RIG17-10");
    expect(shackle).toBeDefined();
    expect(shackle.name).toContain('Shackle 3/4"');
    // 7 per motor * 3 = 21, rounded to nearest 5 = 25
    expect(shackle.qty).toBe(25);
  });

  it("applies roundUp for burlap", () => {
    const items = calcHoistGear(".5 Ton", 3);
    const burlap = items.find((i) => i.catId === "RIG11-30");
    expect(burlap).toBeDefined();
    // 2.5 per motor * 3 = 7.5, ceil = 8
    expect(burlap.qty).toBe(8);
  });

  it("returns correct number of item types", () => {
    const lightItems = calcHoistGear(".5 Ton", 1);
    const heavyItems = calcHoistGear("2 Ton", 1);
    // Both templates have 8 entries
    expect(lightItems.length).toBe(8);
    expect(heavyItems.length).toBe(8);
  });
});

describe("parseMarkoutCSV", () => {
  const sampleCSV = `#,POINT LABEL,Y [m],X [m],Y [ft],X [ft],TYPE,Load [lbs],Load [kgs],NOTES,TRIM [ft],TRIM [m],CABLE [ft],CABLE [m]
1,STAGE,13.41,12.19,44.00,40.00,Stage,0,0,,,,,
2,V12,9.14,10.97,30.00,36.00,1 Ton Video,2012,913,,,,,
3,LX-6-5,8.53,11.58,28.00,38.00,1 Ton Lights,593,269,some note,,,,
,TOTAL (3 points),,,,,,2605,1182,,,,,`;

  it("parses valid CSV and returns correct number of points", () => {
    const { points, errors } = parseMarkoutCSV(sampleCSV);
    expect(points.length).toBe(3);
    expect(errors.length).toBe(0);
  });

  it("parses point coordinates correctly", () => {
    const { points } = parseMarkoutCSV(sampleCSV);
    expect(points[0].ym).toBe(13.41);
    expect(points[0].xm).toBe(12.19);
    expect(points[0].yft).toBe(44);
    expect(points[0].xft).toBe(40);
  });

  it("parses point labels and types", () => {
    const { points } = parseMarkoutCSV(sampleCSV);
    expect(points[0].label).toBe("STAGE");
    expect(points[0].type).toBe("Stage");
    expect(points[1].label).toBe("V12");
    expect(points[1].type).toBe("1 Ton Video");
  });

  it("parses load values", () => {
    const { points } = parseMarkoutCSV(sampleCSV);
    expect(points[1].lbs).toBe(2012);
    expect(points[1].kgs).toBe(913);
  });

  it("parses notes field", () => {
    const { points } = parseMarkoutCSV(sampleCSV);
    expect(points[2].notes).toBe("some note");
  });

  it("skips summary/total rows", () => {
    const { points } = parseMarkoutCSV(sampleCSV);
    // The TOTAL row should be skipped (no valid # number)
    expect(points.every((p) => typeof p.num === "number" && !isNaN(p.num))).toBe(true);
  });

  it("handles empty input", () => {
    const { points, errors } = parseMarkoutCSV("");
    expect(points.length).toBe(0);
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ─── Beam Solver Tests ───────────────────────────────────────────────────────

describe("solveBeamReactions", () => {
  const approx = (val, expected, tol = 0.01) =>
    Math.abs(val - expected) < tol;

  it("returns empty for 0 supports", () => {
    const { reactions, moments, maxReaction } = solveBeamReactions([], []);
    expect(reactions.length).toBe(0);
    expect(moments.length).toBe(0);
    expect(maxReaction).toBe(0);
  });

  it("single support receives total load", () => {
    const loads = [
      { position: 2, weight: 100 },
      { position: 5, weight: 200 },
    ];
    const { reactions, maxReaction } = solveBeamReactions([3], loads);
    expect(reactions.length).toBe(1);
    expect(reactions[0]).toBeCloseTo(300, 1);
    expect(maxReaction).toBeCloseTo(300, 1);
  });

  it("two supports — centered load splits evenly", () => {
    const { reactions } = solveBeamReactions(
      [0, 10],
      [{ position: 5, weight: 100 }]
    );
    expect(reactions[0]).toBeCloseTo(50, 1);
    expect(reactions[1]).toBeCloseTo(50, 1);
  });

  it("two supports — off-center load", () => {
    // Load at 2 on a 0–10 span: R0 = 100*8/10 = 80, R1 = 100*2/10 = 20
    const { reactions } = solveBeamReactions(
      [0, 10],
      [{ position: 2, weight: 100 }]
    );
    expect(reactions[0]).toBeCloseTo(80, 1);
    expect(reactions[1]).toBeCloseTo(20, 1);
  });

  it("three supports — load directly on middle support", () => {
    const { reactions } = solveBeamReactions(
      [0, 5, 10],
      [{ position: 5, weight: 100 }]
    );
    // Load at support → that support takes the full load
    expect(reactions[1]).toBeCloseTo(100, 0);
    // End supports should be ~0
    expect(Math.abs(reactions[0])).toBeLessThan(1);
    expect(Math.abs(reactions[2])).toBeLessThan(1);
  });

  it("three supports — load in first span", () => {
    // 3 supports at 0, 10, 20; load at 5 (center of first span)
    const { reactions } = solveBeamReactions(
      [0, 10, 20],
      [{ position: 5, weight: 100 }]
    );
    // Sum must equal total load
    const sum = reactions.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 1);
    // Continuous beam: middle support picks up more than simple-beam share
    expect(reactions[0]).toBeGreaterThan(0);
    expect(reactions[1]).toBeGreaterThan(0);
    // Third support gets small negative or near-zero uplift from continuity
    expect(Math.abs(reactions[2])).toBeLessThan(10);
  });

  it("multiple loads — sum of reactions equals total load", () => {
    const loads = [
      { position: 3, weight: 150 },
      { position: 7, weight: 250 },
      { position: 12, weight: 100 },
      { position: 18, weight: 200 },
    ];
    const totalLoad = loads.reduce((s, l) => s + l.weight, 0);
    const { reactions } = solveBeamReactions([0, 5, 10, 15, 20], loads);
    const sumReactions = reactions.reduce((s, r) => s + r, 0);
    expect(sumReactions).toBeCloseTo(totalLoad, 1);
  });

  it("zero loads returns all-zero reactions", () => {
    const { reactions, maxReaction } = solveBeamReactions([0, 5, 10], []);
    expect(reactions.every((r) => r === 0)).toBe(true);
    expect(maxReaction).toBe(0);
  });

  it("symmetric loads produce symmetric reactions", () => {
    // Symmetric: supports 0,10,20; loads at 5 and 15, equal weight
    const { reactions } = solveBeamReactions(
      [0, 10, 20],
      [
        { position: 5, weight: 100 },
        { position: 15, weight: 100 },
      ]
    );
    expect(reactions[0]).toBeCloseTo(reactions[2], 1);
  });

  it("returns moments array matching support count", () => {
    const { moments } = solveBeamReactions(
      [0, 10, 20, 30],
      [{ position: 15, weight: 500 }]
    );
    expect(moments.length).toBe(4);
    // Boundary moments are zero (simply supported ends)
    expect(moments[0]).toBeCloseTo(0, 5);
    expect(moments[3]).toBeCloseTo(0, 5);
  });

  it("maxReaction is the largest reaction value", () => {
    const { reactions, maxReaction } = solveBeamReactions(
      [0, 10],
      [{ position: 2, weight: 100 }]
    );
    expect(maxReaction).toBeCloseTo(Math.max(...reactions), 1);
  });

  it("load outside span is clamped to nearest support", () => {
    // Load at -5 should be treated as at position 0
    const { reactions } = solveBeamReactions(
      [0, 10],
      [{ position: -5, weight: 100 }]
    );
    const sum = reactions.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 1);
    // Clamped to 0 → all load on first support
    expect(reactions[0]).toBeCloseTo(100, 1);
  });
});

describe("generateEvenLoads", () => {
  it("creates correct number of load points", () => {
    const loads = generateEvenLoads(1000, 10, 20);
    expect(loads.length).toBe(10);
  });

  it("each load has equal weight summing to total", () => {
    const loads = generateEvenLoads(600, 6, 30);
    loads.forEach((l) => expect(l.weight).toBeCloseTo(100, 5));
    const sum = loads.reduce((s, l) => s + l.weight, 0);
    expect(sum).toBeCloseTo(600, 5);
  });

  it("positions span from 0 to spanLength", () => {
    const loads = generateEvenLoads(100, 5, 20);
    expect(loads[0].position).toBeCloseTo(0, 5);
    expect(loads[loads.length - 1].position).toBeCloseTo(20, 5);
  });

  it("single point is at mid-span", () => {
    const loads = generateEvenLoads(100, 1, 20);
    expect(loads.length).toBe(1);
    expect(loads[0].position).toBeCloseTo(10, 5);
    expect(loads[0].weight).toBeCloseTo(100, 5);
  });

  it("returns empty for 0 points", () => {
    expect(generateEvenLoads(100, 0, 10)).toEqual([]);
  });

  it("returns empty for 0 span", () => {
    expect(generateEvenLoads(100, 5, 0)).toEqual([]);
  });
});
