import { describe, it, expect } from "vitest";
import { r5, rU, calcHoistGear, parseMarkoutCSV } from "../wyp-assist.jsx";

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
