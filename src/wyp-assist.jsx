import { useState, useMemo, useEffect, useRef, createContext, useContext, useCallback, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "./auth-context.jsx";
import { supabase } from "./supabase.js";
import kbGettingStarted from "./kb/getting-started.md?raw";
import kbPointLoad from "./kb/point-load.md?raw";
import kbPullSheet from "./kb/pull-sheet.md?raw";
import kbBridleCalc from "./kb/bridle-calc.md?raw";
import kbMarkout from "./kb/markout.md?raw";
const AdminPanel = lazy(() => import("./admin-panel.jsx"));

// Get auth headers for API calls
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { "Content-Type": "application/json" };
  return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
export const CAT = {
  // ── Shackles & Pear Rings ──
  "RIG10-00": { name: 'Shackle 5/8"', cat: "shackle" },
  "RIG15-10": { name: 'Shackle 1/2"', cat: "shackle" },
  "RIG17-10": { name: 'Shackle 3/4"', cat: "shackle" },
  "RIG10-05": { name: 'Pear Ring 5/8" Crosby', cat: "pearring" },
  "RIG17-20": { name: 'Pear Ring 3/4"', cat: "pearring" },
  // ── Steel Cable 3/8" ──
  "RIG10-50": { name: 'Steel 3/8" Cable 2\'', cat: "steel38" },
  "RIG10-55": { name: 'Steel 3/8" Cable 5\'', cat: "steel38" },
  "RIG10-60": { name: 'Steel 3/8" Cable 10\'', cat: "steel38" },
  "RIG10-65": { name: 'Steel 3/8" Cable 20\'', cat: "steel38" },
  "RIG10-70": { name: 'Steel 3/8" Cable 30\'', cat: "steel38" },
  "RIG10-75": { name: 'Steel 3/8" Cable 50\'', cat: "steel38" },
  // ── Steel Cable 1/2" ──
  "RIG17-25": { name: 'Steel 1/2" Cable 2\'', cat: "steel12" },
  "RIG17-30": { name: 'Steel 1/2" Cable 5\'', cat: "steel12" },
  "RIG17-40": { name: 'Steel 1/2" Cable 10\'', cat: "steel12" },
  "RIG17-50": { name: 'Steel 1/2" Cable 20\'', cat: "steel12" },
  "RIG17-60": { name: 'Steel 1/2" Cable 30\'', cat: "steel12" },
  "RIG17-70": { name: 'Steel 1/2" Cable 50\'', cat: "steel12" },
  // ── Chain & Burlap ──
  "RIG11-20": { name: "S.T.A.C. Chain 3'", cat: "chain" },
  "RIG11-30": { name: "Burlap", cat: "burlap" },
  // ── Spansets ──
  "RIG10-10": { name: "Spanset Black 3'", cat: "spanset" },
  "RIG10-20": { name: "Spanset Black 4'", cat: "spanset" },
  "RIG10-30": { name: "Spanset Black 6'", cat: "spanset" },
  "RIG10-35": { name: "Spanset Black 8'", cat: "spanset" },
  // ── GAC Flex ──
  "RIG10-40": { name: "GAC FLEX - 3'", cat: "gacflex" },
  "RIG10-45": { name: "GAC FLEX - 4'", cat: "gacflex" },
  "RIG10-48": { name: "GAC FLEX - 6'", cat: "gacflex" },
  "RIG10-80": { name: "GAC FLEX - 9'", cat: "gacflex" },
  // ── Cheeseboroughs ──
  "RIG14-10": { name: "Cheeseborough Swivel", cat: "cheese" },
  "RIG14-20": { name: "Cheeseborough 90° Fixed", cat: "cheese" },
  "RIG14-30": { name: "Cheeseborough 1/2 to Eyebolt", cat: "cheese" },
  // ── Beam Clamps ──
  "RIG15-20": { name: "Beam Clamp 2 Ton", cat: "beamclamp" },
  // ── Lifting Brackets ──
  "RIG16-10": { name: 'Lifting Bracket 12" Truss', cat: "bracket" },
  "RIG16-20": { name: 'Lifting Bracket 16" Truss', cat: "bracket" },
  "RIG16-30": { name: 'Lifting Bracket 20" Truss', cat: "bracket" },
  "RIG16-40": { name: 'Lifting Bracket 24" Truss', cat: "bracket" },
  "RIG16-70": { name: "Lifting Bracket H Type Truss - 3\" Pipe, 2 Ton", cat: "bracket" },
  // ── Pipe & Fittings ──
  "RIGZZ-J1": { name: 'Pipe Flange 2" (npt 1.5")', cat: "pipe" },
  "GROPI-01": { name: 'Pipe 2" (npt 1.5") Steel 1\'', cat: "pipe" },
  "GROPI-02": { name: 'Pipe 2" (npt 1.5") Steel 2\'', cat: "pipe" },
  "GROPI-03": { name: 'Pipe 2" (npt 1.5") Steel 3\'', cat: "pipe" },
  "GROPI-04": { name: 'Pipe 2" (npt 1.5") Steel 4\'', cat: "pipe" },
  "GROPI-06": { name: 'Pipe 2" (npt 1.5") Steel 6\'', cat: "pipe" },
  "GROPI-08": { name: 'Pipe 2" (npt 1.5") Steel 8\'', cat: "pipe" },
  "GROPI-10": { name: 'Pipe 2" (npt 1.5") Steel 10\'', cat: "pipe" },
  "GROPI-12": { name: 'Pipe 2" (npt 1.5") Steel 12\'', cat: "pipe" },
  "GROPI-16": { name: 'Pipe 2" (npt 1.5") Steel 16\'', cat: "pipe" },
  // ── Side Arms CL Style ──
  "RIG13-10": { name: 'Side Arm 12" CL Style', cat: "sidearm" },
  "RIG13-20": { name: 'Side Arm 18" CL Style', cat: "sidearm" },
  "RIG13-30": { name: 'Side Arm 24" CL Style', cat: "sidearm" },
  "RIG13-40": { name: 'Side Arm 42" CL Style', cat: "sidearm" },
  "RIG13-50": { name: 'Side Arm 84" CL Style', cat: "sidearm" },
  // ── Misc Hardware ──
  "RIG19-10": { name: "3 Level Cable Hanger", cat: "misc" },
  "RIGZZ-G1": { name: 'Ratchet Strap 2" - Endless', cat: "misc" },
  "RIGZZ-I1": { name: "Hand Line 100'", cat: "misc" },
  "RIGZZ-I2": { name: "Sheave", cat: "misc" },
  "RIGZZ-I3": { name: "Carabiner Locking", cat: "misc" },
  "GROPI-A2": { name: "Sandbag", cat: "misc" },
  // ── A Type (12") Truss ──
  "TRUA0-01": { name: 'A Type (12") Blk 8\' Truss', cat: "truss12" },
  "TRUA0-02": { name: 'A Type (12") Blk 6\' Truss', cat: "truss12" },
  "TRUA0-03": { name: 'A Type (12") Blk 4\' Truss', cat: "truss12" },
  "TRUA0-04": { name: 'A Type (12") Blk 3\' Truss', cat: "truss12" },
  "TRUA0-05": { name: 'A Type (12") Blk 2\' Truss', cat: "truss12" },
  "TRUA0-06": { name: 'A Type (12") Blk 1\' Truss', cat: "truss12" },
  "TRUAA-22": { name: 'A Type (12") Corner 22.5 Deg', cat: "truss12" },
  "TRUAA-30": { name: 'A Type (12") Corner 30 Deg', cat: "truss12" },
  "TRUAA-45": { name: 'A Type (12") Corner 45 Deg', cat: "truss12" },
  "TRUAA-90": { name: 'A Type (12") Corner 90 Deg 6-Way', cat: "truss12" },
  "TRUAA-H6": { name: 'A Type (12") Hub 6-Way', cat: "truss12" },
  "TRUAA-PH": { name: 'A Type (12") Plate Hinge', cat: "truss12" },
  "TRUAC-45": { name: 'A Type Curve Truss 45Deg, 18\' 3/4" Diam (8Pc)', cat: "truss12" },
  "TRUAC-90": { name: 'A Type Curve Truss 90Deg, 12\' 3/4" Diam (4Pc)', cat: "truss12" },
  // ── B Type (16") Truss ──
  "TRUB0-01": { name: 'B Type (16") Blk 8\' Truss w/Pinblocks', cat: "truss16" },
  "TRUB0-02": { name: 'B Type (16") Blk 6\' Truss w/Pinblocks', cat: "truss16" },
  "TRUB0-03": { name: 'B Type (16") Blk 4\' Truss w/Pinblocks', cat: "truss16" },
  "TRUB0-04": { name: 'B Type (16") Blk 2\' Truss w/Pinblocks', cat: "truss16" },
  "TRUB0-06": { name: 'B Type (16") Blk 14" Truss w/Pinblocks', cat: "truss16" },
  "TRUB0-08": { name: 'B Type (16") Blk 34" Truss w/Pinblocks', cat: "truss16" },
  "TRUBA-07": { name: 'B Type (16") Single Brace 7.5 Deg w/2x4" Bolt Sets', cat: "truss16" },
  "TRUBA-15": { name: 'B Type (16") Single Brace 15 Deg', cat: "truss16" },
  "TRUBA-22": { name: 'B Type (16") Single Brace 22.5 Deg', cat: "truss16" },
  "TRUBA-30": { name: 'B Type (16") Single Brace 30 Deg', cat: "truss16" },
  "TRUBA-45": { name: 'B Type (16") Single Brace 45 Deg', cat: "truss16" },
  "TRUBA-60": { name: 'B Type (16") Single Brace 60 Deg', cat: "truss16" },
  "TRUBA-90": { name: 'B Type (16") Single Brace 90 Deg', cat: "truss16" },
  "TRUBA-C6": { name: 'B Type (16") Blk Corner 6-Way', cat: "truss16" },
  "TRUBA-FP": { name: 'B Type (16") Blk Face Plate w/(4") Truss Bolt Set', cat: "truss16" },
  "TRUBC-30": { name: 'B Type Curve Truss 30Deg, 32\' 2 1/4" Diam (12Pc)', cat: "truss16" },
  "TRUBC-31": { name: 'B Type Curve Truss 30Deg, 24\' 2 1/4" Diam (12Pc)', cat: "truss16" },
  // ── C Type (20.5") Truss ──
  "TRUC0-01": { name: 'C Type (20") Blk 8\' Truss', cat: "truss20" },
  "TRUC0-03": { name: 'C Type (20") Blk 4\' Truss', cat: "truss20" },
  "TRUC0-04": { name: 'C Type (20") Blk 2\' Truss', cat: "truss20" },
  "TRUCA-45": { name: 'C Type (20") Corner 45 Deg', cat: "truss20" },
  "TRUCA-90": { name: 'C Type (20") Corner 90 Deg 6-Way', cat: "truss20" },
  "TRUCA-PH": { name: 'C Type (20") Plate Hinge', cat: "truss20" },
  "TRUCC-22": { name: 'C Type Curve Truss 22.5Deg, 39\' 5 3/4" Diam (16Pc)', cat: "truss20" },
  // ── H Type (24"x36") Super Duty Truss ──
  "TRUH0-01": { name: 'H Type (24"x36") Blk 8\' Truss', cat: "trussH" },
  "TRUH0-02": { name: 'H Type (24"x36") Blk 4\' Truss', cat: "trussH" },
  "TRUHA-02": { name: 'H Type (24"x36") Blk Corner 4-Way', cat: "trussH" },
  "TRUHA-03": { name: 'H Type (24"x36") Blk Face Plate', cat: "trussH" },
  // ── G Type (24") Heavy Duty Truss ──
  "TRUG0-01": { name: 'G Type (24") Blk 8\' Truss', cat: "trussG" },
  "TRUG0-02": { name: 'G Type (24") Blk 4\' Truss', cat: "trussG" },
  "TRUG0-03": { name: 'G Type (24") Blk 1\' Truss', cat: "trussG" },
  "TRUG0-04": { name: 'G Type (24") Blk Corner 6-Way', cat: "trussG" },
  "TRUG0-05": { name: 'G Type (24") Blk Face Plate', cat: "trussG" },
  // ── Socapex Motor Cable 14/7 ──
  "XS140-08": { name: "Socapex 7 Pin Motor Cable 14/7 8'", cat: "socapex" },
  "XS140-16": { name: "Socapex 7 Pin Motor Cable 14/7 16'", cat: "socapex" },
  "XS140-24": { name: "Socapex 7 Pin Motor Cable 14/7 24'", cat: "socapex" },
  "XS140-32": { name: "Socapex 7 Pin Motor Cable 14/7 32'", cat: "socapex" },
  "XS140-40": { name: "Socapex 7 Pin Motor Cable 14/7 40'", cat: "socapex" },
  "XS140-48": { name: "Socapex 7 Pin Motor Cable 14/7 48'", cat: "socapex" },
  "XS140-56": { name: "Socapex 7 Pin Motor Cable 14/7 56'", cat: "socapex" },
  "XS140-64": { name: "Socapex 7 Pin Motor Cable 14/7 64'", cat: "socapex" },
  "XS140-72": { name: "Socapex 7 Pin Motor Cable 14/7 72'", cat: "socapex" },
  "XS140-80": { name: "Socapex 7 Pin Motor Cable 14/7 80'", cat: "socapex" },
  "XS140-88": { name: "Socapex 7 Pin Motor Cable 14/7 88'", cat: "socapex" },
  "XS140-96": { name: "Socapex 7 Pin Motor Cable 14/7 96'", cat: "socapex" },
  "XS141-44": { name: "Socapex 7 Pin Motor Cable 14/7 144'", cat: "socapex" },
  // ── Tajimi Motor Control ──
  "XTAJ0-24": { name: "Tajimi Motor Control 24'", cat: "tajimi" },
  "XTAJ0-48": { name: "Tajimi Motor Control 48'", cat: "tajimi" },
  "XTAJ0-96": { name: "Tajimi Motor Control 96'", cat: "tajimi" },
  "XTAJ1-44": { name: "Tajimi Motor Control 144'", cat: "tajimi" },
  "XTAJE-XT": { name: "Tajimi Inline Extender", cat: "tajimi" },
  // ── Motor Distro & Remote Control ──
  "MOTDI-S0": { name: "Motor Distro 8-Way CS-800", cat: "motordistro" },
  "MOTDI-S3": { name: "Remote Control Motor 16 Way", cat: "motordistro" },
  "MOTDI-S4": { name: "Remote Control Motor 24 Way", cat: "motordistro" },
};

// Per-hoist auto-calculated items (keyed by catalog ID)
// For ≤1 Ton: 5/8" shackle & pear ring, 3/8" steel
// For >1 Ton: 3/4" shackle & pear ring, 1/2" steel
export const HOIST_GEAR_LIGHT = {
  "RIG10-00": { per: 10, round5: true, label: 'Shackle 5/8"' },
  "RIG10-05": { per: 1, label: 'Pear Ring 5/8" Crosby' },
  "RIG11-20": { per: 2, label: "S.T.A.C. Chain 3'" },
  "RIG10-50": { per: 2, label: 'Steel 3/8" Cable 2\'' },
  "RIG10-55": { per: 5, label: 'Steel 3/8" Cable 5\'' },
  "RIG10-60": { per: 5, label: 'Steel 3/8" Cable 10\'' },
  "RIG10-65": { per: 2, label: 'Steel 3/8" Cable 20\'' },
  "RIG11-30": { per: 2.5, roundUp: true, label: "Burlap" },
};
export const HOIST_GEAR_HEAVY = {
  "RIG17-10": { per: 10, round5: true, label: 'Shackle 3/4"' },
  "RIG17-20": { per: 1, label: 'Pear Ring 3/4"' },
  "RIG11-20": { per: 2, label: "S.T.A.C. Chain 3'" },
  "RIG17-25": { per: 2, label: 'Steel 1/2" Cable 2\'' },
  "RIG17-30": { per: 5, label: 'Steel 1/2" Cable 5\'' },
  "RIG17-40": { per: 5, label: 'Steel 1/2" Cable 10\'' },
  "RIG17-50": { per: 2, label: 'Steel 1/2" Cable 20\'' },
  "RIG11-30": { per: 2.5, roundUp: true, label: "Burlap" },
};

// Requestable add-on groups
const ADDON_GROUPS = [
  {
    key: "spanset", titleEN: "Spansets", titleES: "Spansets",
    items: [
      { id: "RIG10-10", label: "3'" }, { id: "RIG10-20", label: "4'" },
      { id: "RIG10-30", label: "6'" }, { id: "RIG10-35", label: "8'" },
    ],
  },
  {
    key: "gacflex", titleEN: "GAC Flex", titleES: "GAC Flex",
    items: [
      { id: "RIG10-40", label: "3'" }, { id: "RIG10-45", label: "4'" },
      { id: "RIG10-48", label: "6'" }, { id: "RIG10-80", label: "9'" },
    ],
  },
  {
    key: "cheese", titleEN: "Cheeseboroughs", titleES: "Cheeseboroughs",
    items: [
      { id: "RIG14-10", label: "Swivel" }, { id: "RIG14-20", label: "90° Fixed" },
      { id: "RIG14-30", label: "1/2 to Eyebolt" },
    ],
  },
  {
    key: "clamp", titleEN: "Beam Clamps & Brackets", titleES: "Abrazaderas y Soportes",
    items: [
      { id: "RIG15-20", label: "Beam Clamp 2T" },
      { id: "RIG16-10", label: 'Bracket 12"' }, { id: "RIG16-20", label: 'Bracket 16"' },
      { id: "RIG16-30", label: 'Bracket 20"' }, { id: "RIG16-40", label: 'Bracket 24"' },
      { id: "RIG16-70", label: "Bracket H-Type" },
    ],
  },
  {
    key: "pipe", titleEN: "Pipe & Side Arms", titleES: "Tubería y Brazos Laterales",
    items: [
      { id: "RIGZZ-J1", label: 'Pipe Flange 2"' },
      { id: "GROPI-01", label: "Pipe 1'" }, { id: "GROPI-02", label: "Pipe 2'" },
      { id: "GROPI-03", label: "Pipe 3'" }, { id: "GROPI-04", label: "Pipe 4'" },
      { id: "GROPI-06", label: "Pipe 6'" }, { id: "GROPI-08", label: "Pipe 8'" },
      { id: "GROPI-10", label: "Pipe 10'" }, { id: "GROPI-12", label: "Pipe 12'" },
      { id: "GROPI-16", label: "Pipe 16'" },
      { id: "RIG13-10", label: 'Side Arm 12"' }, { id: "RIG13-20", label: 'Side Arm 18"' },
      { id: "RIG13-30", label: 'Side Arm 24"' }, { id: "RIG13-40", label: 'Side Arm 42"' },
      { id: "RIG13-50", label: 'Side Arm 84"' },
    ],
  },
  {
    key: "misc", titleEN: "Misc Hardware", titleES: "Hardware Misceláneo",
    items: [
      { id: "RIG19-10", label: "Cable Hanger" },
      { id: "RIGZZ-G1", label: "Ratchet Strap" }, { id: "RIGZZ-I1", label: "Hand Line 100'" },
      { id: "RIGZZ-I2", label: "Sheave" }, { id: "RIGZZ-I3", label: "Carabiner" },
      { id: "GROPI-A2", label: "Sandbag" },
    ],
  },
  {
    key: "truss12", titleEN: 'A Type (12") Truss', titleES: 'Truss Tipo A (12")',
    items: [
      { id: "TRUA0-01", label: "8'" }, { id: "TRUA0-02", label: "6'" },
      { id: "TRUA0-03", label: "4'" }, { id: "TRUA0-04", label: "3'" },
      { id: "TRUA0-05", label: "2'" }, { id: "TRUA0-06", label: "1'" },
      { id: "TRUAA-22", label: "Corner 22.5°" }, { id: "TRUAA-30", label: "Corner 30°" },
      { id: "TRUAA-45", label: "Corner 45°" }, { id: "TRUAA-90", label: "Corner 90° 6-Way" },
      { id: "TRUAA-H6", label: "Hub 6-Way" }, { id: "TRUAA-PH", label: "Plate Hinge" },
      { id: "TRUAC-45", label: "Curve 45°" }, { id: "TRUAC-90", label: "Curve 90°" },
    ],
  },
  {
    key: "truss16", titleEN: 'B Type (16") Truss', titleES: 'Truss Tipo B (16")',
    items: [
      { id: "TRUB0-01", label: "8'" }, { id: "TRUB0-02", label: "6'" },
      { id: "TRUB0-03", label: "4'" }, { id: "TRUB0-04", label: "2'" },
      { id: "TRUB0-06", label: '14"' }, { id: "TRUB0-08", label: '34"' },
      { id: "TRUBA-07", label: "Brace 7.5°" }, { id: "TRUBA-15", label: "Brace 15°" },
      { id: "TRUBA-22", label: "Brace 22.5°" }, { id: "TRUBA-30", label: "Brace 30°" },
      { id: "TRUBA-45", label: "Brace 45°" }, { id: "TRUBA-60", label: "Brace 60°" },
      { id: "TRUBA-90", label: "Brace 90°" }, { id: "TRUBA-C6", label: "Corner 6-Way" },
      { id: "TRUBA-FP", label: "Face Plate" },
      { id: "TRUBC-30", label: 'Curve 30° 32"D' }, { id: "TRUBC-31", label: 'Curve 30° 24"D' },
    ],
  },
  {
    key: "truss20", titleEN: 'C Type (20.5") Truss', titleES: 'Truss Tipo C (20.5")',
    items: [
      { id: "TRUC0-01", label: "8'" }, { id: "TRUC0-03", label: "4'" },
      { id: "TRUC0-04", label: "2'" },
      { id: "TRUCA-45", label: "Corner 45°" }, { id: "TRUCA-90", label: "Corner 90° 6-Way" },
      { id: "TRUCA-PH", label: "Plate Hinge" },
      { id: "TRUCC-22", label: "Curve 22.5°" },
    ],
  },
  {
    key: "trussH", titleEN: 'H Type (24"x36") Super Duty Truss', titleES: 'Truss Super Duty Tipo H (24"x36")',
    items: [
      { id: "TRUH0-01", label: "8'" }, { id: "TRUH0-02", label: "4'" },
      { id: "TRUHA-02", label: "Corner 4-Way" }, { id: "TRUHA-03", label: "Face Plate" },
    ],
  },
  {
    key: "trussG", titleEN: 'G Type (24") Heavy Duty Truss', titleES: 'Truss Heavy Duty Tipo G (24")',
    items: [
      { id: "TRUG0-01", label: "8'" }, { id: "TRUG0-02", label: "4'" },
      { id: "TRUG0-03", label: "1'" },
      { id: "TRUG0-04", label: "Corner 6-Way" }, { id: "TRUG0-05", label: "Face Plate" },
    ],
  },
  {
    key: "socapex", titleEN: "Socapex Motor Cable", titleES: "Cable de Motor Socapex",
    items: [
      { id: "XS140-08", label: "8'" }, { id: "XS140-16", label: "16'" },
      { id: "XS140-24", label: "24'" }, { id: "XS140-32", label: "32'" },
      { id: "XS140-40", label: "40'" }, { id: "XS140-48", label: "48'" },
      { id: "XS140-56", label: "56'" }, { id: "XS140-64", label: "64'" },
      { id: "XS140-72", label: "72'" }, { id: "XS140-80", label: "80'" },
      { id: "XS140-88", label: "88'" }, { id: "XS140-96", label: "96'" },
      { id: "XS141-44", label: "144'" },
    ],
  },
  {
    key: "tajimi", titleEN: "Tajimi Motor Control", titleES: "Control de Motor Tajimi",
    items: [
      { id: "XTAJ0-24", label: "24'" }, { id: "XTAJ0-48", label: "48'" },
      { id: "XTAJ0-96", label: "96'" }, { id: "XTAJ1-44", label: "144'" },
      { id: "XTAJE-XT", label: "Extender" },
    ],
  },
  {
    key: "motordistro", titleEN: "Motor Distro & Control", titleES: "Distro y Control de Motor",
    items: [
      { id: "MOTDI-S0", label: "8-Way CS-800" },
      { id: "MOTDI-S3", label: "Remote 16 Way" }, { id: "MOTDI-S4", label: "Remote 24 Way" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════════════════════
const THEMES = {
  usa: { accent: "#ED0000", accentLight: "#FF2B2B", secondary: "#002868", bg: "#0C0C0C", surface: "#1A1A1A", surfaceLight: "#242424", border: "#3A3A3A", textPrimary: "#F5F5F5", textSecondary: "#9A9A9A", headerGradient: "linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 50%, #1A1A1A 100%)", cardGlow: "0 0 40px rgba(237,0,0,0.06)", accentGradient: "linear-gradient(135deg, #ED0000 0%, #FF2B2B 100%)" },
  pr: { accent: "#ED0000", accentLight: "#FF2B2B", secondary: "#0050F0", bg: "#0A0A0E", surface: "#16161C", surfaceLight: "#202028", border: "#36364A", textPrimary: "#F5F5F5", textSecondary: "#9A9AAA", headerGradient: "linear-gradient(135deg, #16161C 0%, #0E0E14 50%, #16161C 100%)", cardGlow: "0 0 40px rgba(237,0,0,0.06)", accentGradient: "linear-gradient(135deg, #ED0000 0%, #FF2B2B 100%)" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// i18n (abbreviated keys shared across tabs)
// ═══════════════════════════════════════════════════════════════════════════════
const i18n = {
  usa: {
    appName:"WYP ASSIST",appSub:"Entertainment Rigging Tools",tabLoad:"Point Load",tabPull:"Pull Sheet",tabBridle:"Bridle Calc",
    disclaimer:"⚠ All calculations are estimates for planning purposes. Always verify with a qualified structural engineer and follow local codes. Safety factor of 5:1 minimum for overhead rigging.",
    footer1:"WYP Assist v1.1.0",footer2:"© 2025 WYP Assist. All rights reserved. Patent Pending.",
    plTitle:"Point Load Estimator",plSystemType:"System Type",plTotalLoad:"Total Load",plNumPoints:"Number of Points",plSpanLength:"Span Length",plChordAngle:"Included Angle",plRadius:"Radius",plArcAngle:"Arc Angle (° — 360 for full circle)",plDropHeight:"Drop Height",plResults:"Results",plPerPoint:"per point",plDesignLoad:"Design Load",plHoistPoints:"Points",plSystemDetails:"System Details",plNotes:"Notes",plConfig:"Rigging Configuration",plVisual:"System Diagram",plLoadMode:"Loading Mode",plLoadEven:"Even Distribution",plLoadCustom:"Custom Loads",plHoistSpacing:"Point Spacing",plHoistEven:"Even Spacing",plHoistCustom:"Custom Positions",plHoistPositions:"Point Positions",plClickToAdd:"Click on the truss to place a load. Drag to reposition.",plLoadList:"Applied Loads",plPosition:"Position",plWeight:"Weight",plReactions:"Support Reactions",plBeamAnalysis:"Continuous beam analysis (Three-Moment Theorem)",plAddLoad:"Add Load",plMaxReaction:"MAX",plDeleteLoad:"Remove",plInterior:"Interior Point",plEndPoint:"End Point",
    straight:"Straight",curved:"Curved",circular:"Circular",vertical:"Vertical",
    straightNote:"Even distribution assumed along straight truss/pipe",straightNote2:"End points ~60% avg, mid points ~115% avg (beam loading)",curvedNote1:"End points carry half the load of interior points (tributary method)",curvedNote2:"Design load based on maximum interior point",curvedCustomNote:"Custom point weights — design to maximum point",circularEndNote:"end points carry ~20% more",circularNote:"Circular rigs distribute load evenly when full 360°",verticalNote1:"Vertical loads include 1.25x dynamic factor for movement",verticalNote2:"Account for shock loading during accel/decel",openArc:"Open arc",
    psTitle:"Pull Sheet Generator",psProject:"Project Name",psVenue:"Venue",psChainSystem:"Chain Hoist System",psSystemType:"System Type",psMotorCounts:"Motor Counts",psHardware:"Hardware",psSteelCable:"Steel",psTotalHoists:"Total Hoists",psOnSystem:"on",psSystem:"system",psPullSheet:"Pull Sheet",psProject2:"Project",psVenue2:"Venue",psChainSys2:"Chain System",psBreakdown:"Breakdown by Motor Type",psMotors:"Motors",psItem:"Item",psSize:"Cat. ID",psQty:"Qty",
    psGrandTotals:"Grand Totals — All Gear",psTotalChain:"Total Chain Hoists",psEmpty:"Add motors above to generate your pull sheet",psExportPDF:"Export PDF",psDeliveryDate:"Delivery Date",psShowDate:"First Show Date",psReturnDate:"Return Date",psCountry:"Country / Region",psD8:"D8 / D8+ Rated",psD8Warn:"\u26A0 D8/D8+ RATED SYSTEM REQUIRED",psSendQuote:"Send for Quote",psName:"Your Name",psEmail:"Your Email",psRequired:"Required",psSending:"Sending\u2026",psSent:"Sent \u2713",psSendFail:"Failed \u2014 Retry",
    psAddons:"Additional Equipment",psAddonSub:"Add quantities for optional gear",
    brTitle:"Bridle Calculator",brType:"Bridle Type",brConfig:"Configuration",brDimensions:"Dimensions",brBeamSpacing:"Distance Between Beams",brLoadWeight:"Load Weight",brDistFromA:"Pick Point Distance from Beam A",brHeadroom:"Available Headroom",brThirdLeg:"Third Leg Offset",brHoistType:"Hoist Type (for gear list)",brMotorRating:"Motor Rating",brResults:"Bridle Results",brLegLength:"Leg Length",brLegA:"Leg A",brLegB:"Leg B",brIncAngle:"Included Angle",brApexHeight:"Apex Height",brPerLeg:"per Leg",brHorizForce:"Horizontal Force",brLegs:"Legs",brThirdLegLen:"Third Leg Length",brNotes:"Rigging Notes",brVisual:"Bridle Diagram",brSteelPieces:"Steel Pieces",brBeamConn:"Beam Connection",brAutoHoist:"Recommended Hoist",
    brNote1:"Always verify beam/structure capacity before loading. Angles above 90° significantly increase leg tension.",brNote2:"Horizontal forces must be resolved by the structure. Confirm breast line capacity if used.",brNote3:"Arena bridles: ensure all four attachment points are at equal elevation.",brGearList:"Bridle Gear List",brAngleWarn:"ANGLE WARNING",brAngleWarnText:"Included angle exceeds 120°. Leg loads increase dramatically. Consider wider beam spacing or more headroom.",brError:"Beam spacing must be > pick point spacing.",brEmpty:"Enter dimensions above to calculate bridle geometry",
    twoLeg:"2-Leg",threeLeg:"3-Leg",arena:"Arena (4-Leg)",sameSpreahalf:"Same as half-spread",
    gridIron:"Grid / Iron",beam:"Beam",load:"Load",
    waiverTitle:"Rigging Estimation Tool — Safety Acknowledgment",
    waiverBody1:"This tool provides preliminary rigging load estimates for planning purposes only.",
    waiverBody2:"Calculations generated by this tool are derived from simplified formulas commonly available in engineering reference materials and do not constitute structural engineering analysis or certification.",
    waiverBody3:"This tool does not evaluate venue structural capacity, rigging hardware ratings, installation practices, dynamic loading, shock loading, or other real-world variables that may affect safety.",
    waiverBody4:"Rigging and overhead suspension involve serious life-safety risks, including the potential for equipment failure, property damage, severe injury, or death.",
    waiverBody5:"Before any rigging or structural suspension work is performed:",
    waiverBullet1:"All loads must be verified independently",
    waiverBullet2:"Rigging systems must comply with ANSI E1 entertainment technology standards",
    waiverBullet3:"All installations must follow venue rigging policies and manufacturer load ratings",
    waiverBullet4:"Structural loads should be reviewed and approved by a licensed Professional Engineer (P.E.) or qualified structural engineer where required",
    waiverBody6:"The operators of this website make no representations regarding the accuracy, completeness, or suitability of the calculations generated by this tool.",
    waiverBody7:"Use of this tool is entirely at the user's own risk.",
    waiverAgreeTitle:"By continuing, you acknowledge and agree that:",
    waiverAgree1:"This calculator provides estimates only",
    waiverAgree2:"Results are not engineered or certified",
    waiverAgree3:"You are solely responsible for verifying all loads and calculations",
    waiverAgree4:"You assume all risk associated with any use of the outputs",
    waiverCheckbox:"I acknowledge and accept these terms and wish to proceed",
    waiverBtn:"Proceed to Calculator",
    resultDiscTitle:"Estimation Only — Not Engineered",
    resultDiscBody:"Results shown are preliminary estimates based on simplified formulas and do not account for all structural, installation, or operational variables. These values must not be used as certified rigging loads. All loads must be independently verified and should be reviewed by a qualified structural engineer where required. Rigging operations must comply with ANSI E1 standards, venue policies, and manufacturer load ratings. Use of these estimates is entirely at the user's own risk.",
    footerDisclaimer:"All calculations, estimates, diagrams, and outputs generated by this website are provided for conceptual planning and educational purposes only. The calculator uses simplified mathematical models derived from commonly available engineering formulas and does not perform full structural analysis. Results may not account for critical real-world factors including dynamic loading, rigging hardware limitations, installation practices, structural fatigue, or venue-specific structural conditions. Nothing on this website constitutes engineering advice, structural certification, or professional consultation. Rigging systems and overhead loads should be reviewed and approved by a licensed Professional Engineer where required and must comply with ANSI E1 Entertainment Technology Standards, OSHA regulations, local building codes, and venue rigging policies. The owners and operators of this website assume no liability for any use of the information or calculations provided. All use of this tool is at the user's sole risk.",
    tabMarkout:"Markout",moTitle:"Markout Generator",moImportCSV:"Import CSV",moExportPDF:"Export PDF",moUnit:"Units",moPaper:"Paper Size",moTotalPts:"Total Points",moTotalWeight:"Total Weight",moUpstage:"UPSTAGE",moDownstage:"DOWNSTAGE",moStageLeft:"STAGE LEFT",moStageRight:"STAGE RIGHT",moCL:"CL",moLabel:"Label",moType:"Type",moLoad:"Load",moNotes:"Notes",moTrim:"Trim",moCable:"Cable",moEmpty:"Import a CSV file to generate your markout sheet",moLegend:"Legend",moNum:"#",moY:"Y",moX:"X",moPushPull:"Push to Pull Sheet",moPushPullDone:"Sent to Pull Sheet",moTemplate:"Download Template",moVwHelp:"Create a hoist report in Vectorworks",moLoadIn:"Load-In Markout",moExportLoadIn:"Export Load-In PDF",moSL:"SL",moSR:"SR",
    authLogin:"Sign In",authSignup:"Create Account",authLogout:"Sign Out",authEmail:"Email",authPassword:"Password",authName:"Full Name",authCompany:"Company (optional)",authForgot:"Forgot password?",authNoAccount:"Don't have an account?",authHasAccount:"Already have an account?",authVerifyEmail:"Check your email for a verification link.",authVerifyTitle:"Verify Your Email",authVerifyDesc:"We sent a verification link to",authVerifyHint:"Click the link in the email to activate your account. Check your spam folder if you don't see it.",authVerifyGoLogin:"I've Verified — Sign In",authVerifyResend:"Resend Email",authVerifyResent:"✓ Email Resent",authSubscribe:"Upgrade to Pro",authManage:"Manage Subscription",authProfile:"Account",authProBadge:"PRO",authFreeBadge:"FREE",authPrice:"$9.99/mo",authProFeatures:"Full access to Pull Sheet, Bridle Calc, Markout, and Venue Database",authDemoNotice:"Subscribe for full access to all tools",authResetSent:"Password reset email sent.",authResetPassword:"Reset Password",authBack:"Back",authNewPassword:"New Password",authSetNewPassword:"Set New Password",authNewPasswordSuccess:"Password updated! You can now sign in.",authCheckoutSuccess:"Subscription activated! You now have full access.",authCheckoutPending:"Setting up your account...",
    kbTitle:"Knowledge Base",kbBack:"All Articles",
    tabVenues:"Venues",vnBeta:"BETA",vnTitle:"Venue Database",vnSearch:"Search venues...",vnNoResults:"No venues found",vnLoading:"Loading venues...",vnBack:"Back to List",vnContact:"Contact Info",vnLoadingDock:"Loading Dock",vnStageDims:"Stage Dimensions",vnSteelGrid:"Steel & Grid",vnTechPack:"Tech Pack",vnNotes:"Notes",vnDownloadTechPack:"Download Tech Pack (PDF)",vnSuggestEdit:"Suggest Edit",vnSubmitNew:"Submit New Venue",vnSubmitTitle:"Submit Venue",vnSubmitEditTitle:"Suggest Edit",vnName:"Venue Name",vnCity:"City",vnState:"State / Province",vnCountry:"Country",vnContactName:"Contact Name",vnContactPhone:"Phone",vnContactEmail:"Email",vnWebsite:"Website",vnDockDesc:"Dock Description",vnDockRestrictions:"Access Restrictions",vnDockHeight:"Dock Height (ft)",vnTruckAccess:"Truck Access",vnStageWidth:"Stage Width (ft)",vnStageDepth:"Stage Depth (ft)",vnProscHeight:"Proscenium Height (ft)",vnGridHeight:"Grid Height (ft)",vnWingSpace:"Wing Space (ft)",vnGridType:"Grid Type",vnGridCapTotal:"Grid Capacity Total (lbs)",vnGridCapPerPoint:"Capacity Per Point (lbs)",vnGridSpacing:"Grid Spacing (ft)",vnTrimLow:"Low Trim (ft)",vnTrimHigh:"High Trim (ft)",vnNumLineSets:"Line Sets",vnRiggingType:"Rigging Type",vnGridFixed:"Fixed",vnGridVariable:"Variable",vnRigCounterweight:"Counterweight",vnRigDeadHang:"Dead Hang",vnRigAutomated:"Automated",vnRigMixed:"Mixed",vnUploadTechPack:"Upload Tech Pack (PDF)",vnGeneralNotes:"General Notes",vnSubmit:"Submit for Review",vnSubmitting:"Submitting...",vnSubmitted:"Submitted for Review",vnSubmitError:"Failed — Retry",vnSubmitSuccess:"Your submission has been received and will be reviewed.",vnComingSoon:"Coming Soon",
  },
  pr: {
    appName:"WYP ASSIST",appSub:"Herramientas de Aparejo para Entretenimiento",tabLoad:"Carga Puntual",tabPull:"Hoja de Tiro",tabBridle:"Calc. Brida",
    disclaimer:"⚠ Todos los cálculos son estimaciones para planificación. Verifique con un ingeniero estructural calificado. Factor de seguridad mínimo de 5:1.",
    footer1:"WYP Assist v1.1.0",footer2:"© 2025 WYP Assist. Todos los derechos reservados. Patente Pendiente.",
    plTitle:"Estimador de Carga Puntual",plSystemType:"Tipo de Sistema",plTotalLoad:"Carga Total",plNumPoints:"Número de Puntos",plSpanLength:"Longitud del Tramo",plChordAngle:"Ángulo Incluido",plRadius:"Radio",plArcAngle:"Ángulo de Arco (° — 360 para círculo)",plDropHeight:"Altura de Caída",plResults:"Resultados",plPerPoint:"por punto",plDesignLoad:"Carga de Diseño",plHoistPoints:"Puntos",plSystemDetails:"Detalles del Sistema",plNotes:"Notas",plConfig:"Configuración de Aparejo",plVisual:"Diagrama del Sistema",plLoadMode:"Modo de Carga",plLoadEven:"Distribución Uniforme",plLoadCustom:"Cargas Personalizadas",plHoistSpacing:"Espaciado de Puntos",plHoistEven:"Espaciado Uniforme",plHoistCustom:"Posiciones Personalizadas",plHoistPositions:"Posiciones de Puntos",plClickToAdd:"Clic en el truss para colocar carga. Arrastre para mover.",plLoadList:"Cargas Aplicadas",plPosition:"Posición",plWeight:"Peso",plReactions:"Reacciones en Apoyos",plBeamAnalysis:"Análisis de viga continua (Teorema de Tres Momentos)",plAddLoad:"Agregar Carga",plMaxReaction:"MÁX",plDeleteLoad:"Eliminar",plInterior:"Punto Interior",plEndPoint:"Punto Extremo",
    straight:"Recto",curved:"Curvo",circular:"Circular",vertical:"Vertical",
    straightNote:"Distribución uniforme a lo largo de truss/tubo recto",straightNote2:"Puntos finales ~60%, puntos medios ~115%",curvedNote1:"Puntos extremos llevan la mitad de carga que los interiores (método tributario)",curvedNote2:"Carga de diseño basada en punto interior máximo",curvedCustomNote:"Pesos personalizados — diseño al punto máximo",circularEndNote:"puntos finales ~20% más",circularNote:"Circular distribuye carga uniforme a 360°",verticalNote1:"Cargas verticales: factor dinámico 1.25x",verticalNote2:"Considere carga de impacto en aceleración",openArc:"Arco abierto",
    psTitle:"Generador de Hoja de Tiro",psProject:"Nombre del Proyecto",psVenue:"Lugar",psChainSystem:"Sistema de Polipasto",psSystemType:"Tipo de Sistema",psMotorCounts:"Conteo de Motores",psHardware:"Herrajes",psSteelCable:"Acero",psTotalHoists:"Total Polipastos",psOnSystem:"en",psSystem:"sistema",psPullSheet:"Hoja de Tiro",psProject2:"Proyecto",psVenue2:"Lugar",psChainSys2:"Sistema de Cadena",psBreakdown:"Desglose por Tipo de Motor",psMotors:"Motores",psItem:"Artículo",psSize:"Cat. ID",psQty:"Cant.",
    psGrandTotals:"Totales Generales — Todo el Equipo",psTotalChain:"Total Polipastos",psEmpty:"Agregue motores para generar la hoja",psExportPDF:"Exportar PDF",psDeliveryDate:"Fecha de Entrega",psShowDate:"Fecha del Primer Show",psReturnDate:"Fecha de Devolución",psCountry:"País / Región",psD8:"D8 / D8+ Clasificado",psD8Warn:"\u26A0 SE REQUIERE SISTEMA CLASIFICADO D8/D8+",psSendQuote:"Enviar para Cotización",psName:"Tu Nombre",psEmail:"Tu Correo",psRequired:"Requerido",psSending:"Enviando\u2026",psSent:"Enviado \u2713",psSendFail:"Error \u2014 Reintentar",
    psAddons:"Equipo Adicional",psAddonSub:"Agregue cantidades para equipo opcional",
    brTitle:"Calculadora de Brida",brType:"Tipo de Brida",brConfig:"Configuración",brDimensions:"Dimensiones",brBeamSpacing:"Distancia Entre Vigas",brLoadWeight:"Peso de Carga",brDistFromA:"Distancia del Punto de Carga desde Viga A",brHeadroom:"Altura Disponible",brThirdLeg:"Desplazamiento 3ra Pata",brHoistType:"Tipo de Polipasto (para equipo)",brMotorRating:"Capacidad del Motor",brResults:"Resultados de Brida",brLegLength:"Longitud de Pata",brLegA:"Pata A",brLegB:"Pata B",brIncAngle:"Ángulo Incluido",brApexHeight:"Altura del Ápice",brPerLeg:"por Pata",brHorizForce:"Fuerza Horizontal",brLegs:"Patas",brThirdLegLen:"Longitud 3ra Pata",brNotes:"Notas de Aparejo",brVisual:"Diagrama de Brida",brSteelPieces:"Piezas de Acero",brBeamConn:"Conexión a Viga",brAutoHoist:"Polipasto Recomendado",
    brNote1:"Verifique capacidad de viga/estructura. Ángulos >90° aumentan tensión.",brNote2:"Fuerzas horizontales resueltas por la estructura. Confirme línea de pecho.",brNote3:"Arena: cuatro puntos a misma elevación.",brGearList:"Lista de Equipo de Brida",brAngleWarn:"ADVERTENCIA DE ÁNGULO",brAngleWarnText:"Ángulo >120°. Cargas aumentan dramáticamente.",brError:"Espaciado de vigas debe ser > espaciado de puntos.",brEmpty:"Ingrese dimensiones para calcular",
    twoLeg:"2-Patas",threeLeg:"3-Patas",arena:"Arena (4-Patas)",sameSpreahalf:"Igual que mitad de extensión",
    gridIron:"Parrilla",beam:"Viga",load:"Carga",
    waiverTitle:"Herramienta de Estimación de Aparejo — Reconocimiento de Seguridad",
    waiverBody1:"Esta herramienta proporciona estimaciones preliminares de carga de aparejo solo para fines de planificación.",
    waiverBody2:"Los cálculos generados por esta herramienta se derivan de fórmulas simplificadas disponibles en materiales de referencia de ingeniería y no constituyen un análisis o certificación de ingeniería estructural.",
    waiverBody3:"Esta herramienta no evalúa la capacidad estructural del lugar, las clasificaciones del equipo de aparejo, las prácticas de instalación, la carga dinámica, la carga de impacto u otras variables del mundo real que puedan afectar la seguridad.",
    waiverBody4:"El aparejo y la suspensión aérea implican riesgos graves para la vida, incluyendo la posibilidad de falla del equipo, daños a la propiedad, lesiones graves o muerte.",
    waiverBody5:"Antes de realizar cualquier trabajo de aparejo o suspensión estructural:",
    waiverBullet1:"Todas las cargas deben ser verificadas de forma independiente",
    waiverBullet2:"Los sistemas de aparejo deben cumplir con los estándares ANSI E1 de tecnología de entretenimiento",
    waiverBullet3:"Todas las instalaciones deben seguir las políticas de aparejo del lugar y las clasificaciones de carga del fabricante",
    waiverBullet4:"Las cargas estructurales deben ser revisadas y aprobadas por un Ingeniero Profesional (P.E.) licenciado o ingeniero estructural calificado cuando sea necesario",
    waiverBody6:"Los operadores de este sitio web no hacen representaciones sobre la precisión, integridad o idoneidad de los cálculos generados por esta herramienta.",
    waiverBody7:"El uso de esta herramienta es completamente bajo el propio riesgo del usuario.",
    waiverAgreeTitle:"Al continuar, usted reconoce y acepta que:",
    waiverAgree1:"Esta calculadora proporciona solo estimaciones",
    waiverAgree2:"Los resultados no están diseñados ni certificados",
    waiverAgree3:"Usted es el único responsable de verificar todas las cargas y cálculos",
    waiverAgree4:"Usted asume todo el riesgo asociado con cualquier uso de los resultados",
    waiverCheckbox:"Reconozco y acepto estos términos y deseo continuar",
    waiverBtn:"Proceder a la Calculadora",
    resultDiscTitle:"Solo Estimación — No Diseñado",
    resultDiscBody:"Los resultados mostrados son estimaciones preliminares basadas en fórmulas simplificadas y no tienen en cuenta todas las variables estructurales, de instalación u operativas. Estos valores no deben utilizarse como cargas de aparejo certificadas. Todas las cargas deben ser verificadas de forma independiente y revisadas por un ingeniero estructural calificado cuando sea necesario. Las operaciones de aparejo deben cumplir con los estándares ANSI E1, las políticas del lugar y las clasificaciones de carga del fabricante. El uso de estas estimaciones es completamente bajo el propio riesgo del usuario.",
    footerDisclaimer:"Todos los cálculos, estimaciones, diagramas y resultados generados por este sitio web se proporcionan únicamente con fines de planificación conceptual y educativos. La calculadora utiliza modelos matemáticos simplificados derivados de fórmulas de ingeniería comúnmente disponibles y no realiza un análisis estructural completo. Los resultados pueden no tener en cuenta factores críticos del mundo real, incluyendo carga dinámica, limitaciones del equipo de aparejo, prácticas de instalación, fatiga estructural o condiciones estructurales específicas del lugar. Nada en este sitio web constituye asesoramiento de ingeniería, certificación estructural o consulta profesional. Los sistemas de aparejo y las cargas aéreas deben ser revisados y aprobados por un Ingeniero Profesional licenciado cuando sea necesario y deben cumplir con los Estándares de Tecnología de Entretenimiento ANSI E1, las regulaciones de OSHA, los códigos de construcción locales y las políticas de aparejo del lugar. Los propietarios y operadores de este sitio web no asumen ninguna responsabilidad por cualquier uso de la información o los cálculos proporcionados. Todo uso de esta herramienta es bajo el propio riesgo del usuario.",
    tabMarkout:"Marcado",moTitle:"Generador de Marcado",moImportCSV:"Importar CSV",moExportPDF:"Exportar PDF",moUnit:"Unidades",moPaper:"Tamaño Papel",moTotalPts:"Total Puntos",moTotalWeight:"Peso Total",moUpstage:"FONDO",moDownstage:"FRENTE",moStageLeft:"IZQUIERDA",moStageRight:"DERECHA",moCL:"LC",moLabel:"Etiqueta",moType:"Tipo",moLoad:"Carga",moNotes:"Notas",moTrim:"Trim",moCable:"Cable",moEmpty:"Importe un archivo CSV para generar su hoja de marcado",moLegend:"Leyenda",moNum:"#",moY:"Y",moX:"X",moPushPull:"Enviar a Hoja de Tiro",moPushPullDone:"Enviado a Hoja de Tiro",moTemplate:"Descargar Plantilla",moVwHelp:"Crear reporte de polipastos en Vectorworks",moLoadIn:"Marcado de Carga",moExportLoadIn:"Exportar PDF de Carga",moSL:"IZ",moSR:"DE",
    authLogin:"Iniciar Sesión",authSignup:"Crear Cuenta",authLogout:"Cerrar Sesión",authEmail:"Correo",authPassword:"Contraseña",authName:"Nombre Completo",authCompany:"Empresa (opcional)",authForgot:"¿Olvidó su contraseña?",authNoAccount:"¿No tiene cuenta?",authHasAccount:"¿Ya tiene cuenta?",authVerifyEmail:"Revise su correo para el enlace de verificación.",authVerifyTitle:"Verifique su Correo",authVerifyDesc:"Enviamos un enlace de verificación a",authVerifyHint:"Haga clic en el enlace del correo para activar su cuenta. Revise su carpeta de spam si no lo ve.",authVerifyGoLogin:"Ya Verifiqué — Iniciar Sesión",authVerifyResend:"Reenviar Correo",authVerifyResent:"✓ Correo Reenviado",authSubscribe:"Actualizar a Pro",authManage:"Administrar Suscripción",authProfile:"Cuenta",authProBadge:"PRO",authFreeBadge:"FREE",authPrice:"$9.99/mes",authProFeatures:"Acceso completo a Hoja de Tiro, Calc. Brida, Marcado y Base de Lugares",authDemoNotice:"Suscríbase para acceso completo",authResetSent:"Correo de restablecimiento enviado.",authResetPassword:"Restablecer Contraseña",authBack:"Volver",authNewPassword:"Nueva Contraseña",authSetNewPassword:"Establecer Nueva Contraseña",authNewPasswordSuccess:"¡Contraseña actualizada! Ya puede iniciar sesión.",authCheckoutSuccess:"¡Suscripción activada! Ya tiene acceso completo.",authCheckoutPending:"Configurando su cuenta...",
    kbTitle:"Base de Conocimiento",kbBack:"Todos los Artículos",
    tabVenues:"Lugares",vnBeta:"BETA",vnTitle:"Base de Datos de Lugares",vnSearch:"Buscar lugares...",vnNoResults:"No se encontraron lugares",vnLoading:"Cargando lugares...",vnBack:"Volver a la Lista",vnContact:"Información de Contacto",vnLoadingDock:"Muelle de Carga",vnStageDims:"Dimensiones del Escenario",vnSteelGrid:"Estructura y Parrilla",vnTechPack:"Paquete Técnico",vnNotes:"Notas",vnDownloadTechPack:"Descargar Paquete Técnico (PDF)",vnSuggestEdit:"Sugerir Edición",vnSubmitNew:"Enviar Nuevo Lugar",vnSubmitTitle:"Enviar Lugar",vnSubmitEditTitle:"Sugerir Edición",vnName:"Nombre del Lugar",vnCity:"Ciudad",vnState:"Estado / Provincia",vnCountry:"País",vnContactName:"Nombre del Contacto",vnContactPhone:"Teléfono",vnContactEmail:"Correo",vnWebsite:"Sitio Web",vnDockDesc:"Descripción del Muelle",vnDockRestrictions:"Restricciones de Acceso",vnDockHeight:"Altura del Muelle (ft)",vnTruckAccess:"Acceso de Camiones",vnStageWidth:"Ancho del Escenario (ft)",vnStageDepth:"Profundidad del Escenario (ft)",vnProscHeight:"Altura del Proscenio (ft)",vnGridHeight:"Altura de la Parrilla (ft)",vnWingSpace:"Espacio en Bambalinas (ft)",vnGridType:"Tipo de Parrilla",vnGridCapTotal:"Capacidad Total de Parrilla (lbs)",vnGridCapPerPoint:"Capacidad por Punto (lbs)",vnGridSpacing:"Espaciado de Parrilla (ft)",vnTrimLow:"Trim Bajo (ft)",vnTrimHigh:"Trim Alto (ft)",vnNumLineSets:"Líneas de Vuelo",vnRiggingType:"Tipo de Aparejo",vnGridFixed:"Fija",vnGridVariable:"Variable",vnRigCounterweight:"Contrapeso",vnRigDeadHang:"Colgado Muerto",vnRigAutomated:"Automatizado",vnRigMixed:"Mixto",vnUploadTechPack:"Subir Paquete Técnico (PDF)",vnGeneralNotes:"Notas Generales",vnSubmit:"Enviar para Revisión",vnSubmitting:"Enviando...",vnSubmitted:"Enviado para Revisión",vnSubmitError:"Error — Reintentar",vnSubmitSuccess:"Su envío ha sido recibido y será revisado.",vnComingSoon:"Próximamente",
  },
};

export const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const CHAIN_SYSTEMS = ["60'", "80'", "125'"];
const MOTOR_TYPES = [".25 Ton", ".5 Ton", "1 Ton", "2 Ton"];
const COUNTRIES = ["N & S America", "Europe", "United Kingdom", "Australia", "Asia"];


export function r5(n) { return Math.ceil(n / 5) * 5; }
export function rU(n) { return Math.ceil(n); }
const danger = "#E74C3C", success = "#2ECC71", warning = "#E67E22";

// ── Markout color mapping ──
const MARKOUT_COLORS = {
  "Stage":"#666666","1 Ton Lights":"#FFD700","1 Ton Video":"#00BFFF",
  "1 Ton Generic Hoist":"#FF6B35","1/2 Ton Generic Hoist":"#FF9F6B",
  "1 Ton Cable Pick":"#2ECC71","1/2 Ton Cable Pick":"#7DCEA0",
  "1 Ton Audio":"#E056CF","Fall Arrest":"#E74C3C","Floormark":"#9B59B6",
  "Unknown Other":"#95A5A6",
};
function moColor(type){ return MARKOUT_COLORS[type]||"#AAAAAA"; }

// ── Shape mapping by type category ──
// 1/4 Ton = octagon, 1/2 Ton = triangle, 1 Ton = circle, 2 Ton = square
// Cable Pick & Stage = X mark, Fall Arrest = diamond, Floormark = star, Unknown = diamond
function moShape(type){
  if(type==="Stage") return "x";
  if(/Cable Pick/i.test(type)) return "x";
  if(/^\.25 Ton|1\/4 Ton/i.test(type)) return "octagon";
  if(/^\.5 Ton|1\/2 Ton/i.test(type)) return "triangle";
  if(/^2 Ton/i.test(type)) return "square";
  if(/^1 Ton|^\.25|^1/i.test(type)) return "circle"; // 1 Ton default
  if(type==="Fall Arrest") return "diamond";
  if(type==="Floormark") return "diamond";
  return "diamond"; // Unknown Other
}

// Returns true if the shape is a hoist (should get crosshairs)
function moIsHoist(type){
  return /Ton.*Hoist|Ton.*Video|Ton.*Lights|Ton.*Audio/i.test(type);
}

// SVG shape renderers — each returns SVG elements centered at (cx,cy) with size r
function SvgShape({shape,cx,cy,r,fill,stroke,strokeWidth,opacity}){
  const sw=strokeWidth||0.5, op=opacity||0.9;
  switch(shape){
    case "circle":
      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
    case "square":
      return <rect x={cx-r} y={cy-r} width={r*2} height={r*2} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
    case "triangle":{
      const pts=`${cx},${cy-r*1.15} ${cx-r},${cy+r*0.7} ${cx+r},${cy+r*0.7}`;
      return <polygon points={pts} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
    }
    case "octagon":{
      const a=r*0.924; // outer radius
      const pts=Array.from({length:8},(_,i)=>{const ang=Math.PI*2*i/8-Math.PI/8;return `${cx+a*Math.cos(ang)},${cy+a*Math.sin(ang)}`;}).join(" ");
      return <polygon points={pts} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
    }
    case "diamond":{
      const pts=`${cx},${cy-r*1.2} ${cx+r},${cy} ${cx},${cy+r*1.2} ${cx-r},${cy}`;
      return <polygon points={pts} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
    }
    case "x":
      return <g opacity={op}>
        <line x1={cx-r} y1={cy-r} x2={cx+r} y2={cy+r} stroke={fill} strokeWidth={sw+1} strokeLinecap="round"/>
        <line x1={cx+r} y1={cy-r} x2={cx-r} y2={cy+r} stroke={fill} strokeWidth={sw+1} strokeLinecap="round"/>
      </g>;
    default:
      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke||"#000"} strokeWidth={sw} opacity={op}/>;
  }
}

// Map CSV hoist type to Pull Sheet motor rating
// Returns null for non-hoist types (Stage, Fall Arrest, Floormark, Unknown)
function csvTypeToMotor(type){
  if(!type) return null;
  if(/^\.25 Ton|1\/4 Ton/i.test(type)) return ".25 Ton";
  if(/^\.5 Ton|1\/2 Ton/i.test(type)) return ".5 Ton";
  if(/^2 Ton/i.test(type)) return "2 Ton";
  if(/^1 Ton/i.test(type)) return "1 Ton";
  return null; // Stage, Fall Arrest, Floormark, Unknown Other — not hoists
}

// Count motors from markout CSV points → { ".25 Ton":N, ".5 Ton":N, "1 Ton":N, "2 Ton":N }
function countMotorsFromCSV(points){
  const counts={".25 Ton":0,".5 Ton":0,"1 Ton":0,"2 Ton":0};
  points.forEach(p=>{const m=csvTypeToMotor(p.type);if(m)counts[m]++;});
  return counts;
}

// Download blank CSV template for markout
function downloadMarkoutTemplate(){
  const hdr="#,POINT LABEL,Y [m],X [m],Y [ft],X [ft],TYPE,Load [lbs],Load [kgs],NOTES,TRIM [ft],TRIM [m],CABLE [ft],CABLE [m]";
  const row="1,FOH-1,0,0,0,0,1 Ton Lights,500,226.8,Example note,40,12.192,60,18.288";
  const csv=hdr+"\n"+row+"\n";
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="WYP_Markout_Template.csv";
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
}

// Crosshair lines for hoist symbols
function SvgCrosshair({cx,cy,r,stroke}){
  const ext=r*1.6;
  return <g>
    <line x1={cx-ext} y1={cy} x2={cx+ext} y2={cy} stroke={stroke||"#000"} strokeWidth={0.4} opacity={0.5}/>
    <line x1={cx} y1={cy-ext} x2={cx} y2={cy+ext} stroke={stroke||"#000"} strokeWidth={0.4} opacity={0.5}/>
  </g>;
}

// ── Legacy parser (kept for test compatibility) ──
export function parseMarkoutCSV(text){
  const lines=text.trim().split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2) return {points:[],errors:["File is empty or has no data rows"]};
  const hdr=lines[0].split(",").map(h=>h.trim());
  const iNum=0,iLabel=1,iYm=2,iXm=3,iYft=4,iXft=5,iType=6,iLbs=7,iKgs=8,iNotes=9,iTrimFt=10,iTrimM=11,iCableFt=12,iCableM=13;
  const points=[],errors=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(",").map(c=>c.trim());
    const num=parseInt(cols[iNum]);
    if(isNaN(num)) continue;
    const ym=parseFloat(cols[iYm])||0, xm=parseFloat(cols[iXm])||0;
    const yft=parseFloat(cols[iYft])||0, xft=parseFloat(cols[iXft])||0;
    points.push({
      num, label:cols[iLabel]||"", ym, xm, yft, xft,
      type:cols[iType]||"Unknown", lbs:parseFloat(cols[iLbs])||0, kgs:parseFloat(cols[iKgs])||0,
      notes:cols[iNotes]||"", trimFt:parseFloat(cols[iTrimFt])||0, trimM:parseFloat(cols[iTrimM])||0,
      cableFt:parseFloat(cols[iCableFt])||0, cableM:parseFloat(cols[iCableM])||0,
    });
  }
  return {points,errors};
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLEXIBLE CSV IMPORTER
// ═══════════════════════════════════════════════════════════════════════════════

// Parse feet-inches strings like 48'2.221", -27'0", .795", 30'3 3/4" → decimal feet
export function parseFeetInches(str){
  if(!str||typeof str!=="string") return 0;
  str=str.trim().replace(/"/g,"");
  if(!str) return 0;
  // Try pure decimal first
  const plain=parseFloat(str);
  if(!isNaN(plain)&&!str.includes("'")) return plain;
  // Detect negative
  const neg=str.startsWith("-")?-1:1;
  str=str.replace(/^-/,"");
  // Match feet'inches pattern
  const m=str.match(/^(\d+)?'?\s*(\d+\.?\d*)?(?:\s+(\d+)\/(\d+))?'?"?$/);
  if(!m){
    // Fallback: just inches with quote? e.g. .795"
    const inOnly=parseFloat(str);
    return isNaN(inOnly)?0:neg*(inOnly/12);
  }
  const feet=parseFloat(m[1])||0;
  let inches=parseFloat(m[2])||0;
  if(m[3]&&m[4]) inches+=parseInt(m[3])/parseInt(m[4]); // fractional inches
  return neg*(feet+inches/12);
}

// Parse load values like "2204.62 lb", "1000 kgs", "500" → { lbs, kgs }
export function parseLoadValue(str){
  if(!str||typeof str!=="string") return {lbs:0,kgs:0};
  str=str.trim();
  const numMatch=str.match(/^([\d.,]+)/);
  if(!numMatch) return {lbs:0,kgs:0};
  const val=parseFloat(numMatch[1].replace(",",""))||0;
  const lower=str.toLowerCase();
  if(lower.includes("kg")){return {lbs:val*2.20462,kgs:val};}
  if(lower.includes("lb")||lower.includes("lbf")){return {lbs:val,kgs:val/2.20462};}
  // Assume lbs if no unit
  return {lbs:val,kgs:val/2.20462};
}

// Parse position: try decimal first, then feet-inches
export function parsePosition(str){
  if(!str||typeof str!=="string") return 0;
  str=str.trim();
  if(!str) return 0;
  // If it contains ' (foot mark), parse as feet-inches
  if(str.includes("'")) return parseFeetInches(str);
  // If it contains " (inch mark only), it's inches → convert to feet
  if(str.includes('"')){const v=parseFloat(str.replace(/"/g,""))||0;return v/12;}
  // Otherwise pure decimal
  return parseFloat(str)||0;
}

// Extract type from a Name field like "1 Ton Lights", "1/2 Ton Scenery"
export function extractTypeFromName(name){
  if(!name) return "Unknown Other";
  name=name.trim();
  // Match patterns: "1 Ton Lights", "1/2 Ton Scenery", "1.6 Ton Super Grid"
  const m=name.match(/^([\d./]+\s*Ton)\s+(.+)$/i);
  if(m) return `${m[1]} ${m[2]}`.trim();
  // Return as-is if no pattern match
  return name||"Unknown Other";
}

// Phase 1: Pre-parse CSV into raw headers + rows with auto-delimiter detection
export function preParseCSV(text){
  const lines=text.trim().split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2) return {headers:[],rows:[],delimiter:","};
  const first=lines[0];
  // Auto-detect delimiter: semicolons vs commas vs tabs
  const semis=(first.match(/;/g)||[]).length;
  const commas=(first.match(/,/g)||[]).length;
  const tabs=(first.match(/\t/g)||[]).length;
  const delimiter=semis>commas&&semis>tabs?";":tabs>commas?"\t":",";
  const headers=first.split(delimiter).map(h=>h.trim()).filter(h=>h);
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(delimiter).map(c=>c.trim());
    // Skip empty rows
    if(cols.every(c=>!c)) continue;
    rows.push(cols);
  }
  return {headers,rows,delimiter};
}

// App fields the user can map CSV columns to
const MAP_FIELDS=[
  {key:"label",label:"Label / Name",keywords:["label","name","hoist","point","id"],required:false},
  {key:"type",label:"Type / Category",keywords:["type","category","kind","class"],required:false},
  {key:"xPos",label:"X Position",keywords:["x-pos","x pos","x","stage left","sl"],required:true},
  {key:"yPos",label:"Y Position",keywords:["y-pos","y pos","y","upstage","ds","us"],required:true},
  {key:"load",label:"Load / Weight",keywords:["load","weight","capacity","lbs","kgs","lb","kg","force"],required:false},
  {key:"trim",label:"Trim Height",keywords:["trim","height","z","elevation"],required:false},
  {key:"notes",label:"Notes",keywords:["notes","note","comment","origin","memo"],required:false},
];

// Auto-match CSV headers to app fields
export function autoMatchHeaders(csvHeaders){
  const mapping={};
  const lowerHeaders=csvHeaders.map(h=>h.toLowerCase());
  MAP_FIELDS.forEach(field=>{
    let bestIdx=-1, bestScore=0;
    lowerHeaders.forEach((h,idx)=>{
      // Check each keyword against this header
      field.keywords.forEach(kw=>{
        let score=0;
        if(h===kw) score=10; // exact match
        else if(h.includes(kw)) score=5; // contains
        else if(kw.includes(h)&&h.length>1) score=3; // keyword contains header
        if(score>bestScore){bestScore=score;bestIdx=idx;}
      });
    });
    mapping[field.key]=bestIdx>=0?bestIdx:-1;
  });
  return mapping;
}

// Phase 2: Apply column mapping to produce points[]
export function applyColumnMapping(rawData,mapping){
  const {rows}=rawData;
  const points=[],errors=[];
  let pointNum=1;
  rows.forEach((cols,rowIdx)=>{
    // Skip rows where both X and Y are empty
    const xRaw=mapping.xPos>=0?cols[mapping.xPos]||"":"";
    const yRaw=mapping.yPos>=0?cols[mapping.yPos]||"":"";
    if(!xRaw&&!yRaw) return;
    const labelRaw=mapping.label>=0?cols[mapping.label]||"":"";
    const typeRaw=mapping.type>=0?cols[mapping.type]||"":"";
    const loadRaw=mapping.load>=0?cols[mapping.load]||"":"";
    const trimRaw=mapping.trim>=0?cols[mapping.trim]||"":"";
    const notesRaw=mapping.notes>=0?cols[mapping.notes]||"":"";
    // Parse positions (handles feet-inches and decimal)
    const xft=parsePosition(xRaw);
    const yft=parsePosition(yRaw);
    const xm=xft*0.3048;
    const ym=yft*0.3048;
    // Parse load
    const {lbs,kgs}=parseLoadValue(loadRaw);
    // Determine type: use Type column if mapped, otherwise extract from Label/Name
    const type=typeRaw?typeRaw.trim():extractTypeFromName(labelRaw);
    // Trim
    const trimFt=parsePosition(trimRaw);
    const trimM=trimFt*0.3048;
    // Label: use label column, or auto-number
    const label=labelRaw||`P${pointNum}`;
    points.push({
      num:pointNum++, label, ym:parseFloat(ym.toFixed(3)), xm:parseFloat(xm.toFixed(3)),
      yft:parseFloat(yft.toFixed(3)), xft:parseFloat(xft.toFixed(3)),
      type, lbs:parseFloat(lbs.toFixed(2)), kgs:parseFloat(kgs.toFixed(2)),
      notes:notesRaw, trimFt:parseFloat(trimFt.toFixed(3)), trimM:parseFloat(trimM.toFixed(3)),
      cableFt:0, cableM:0,
    });
  });
  return {points,errors};
}

export function calcHoistGear(motorType, count) {
  const isHeavy = parseFloat(motorType) > 1;
  const template = isHeavy ? HOIST_GEAR_HEAVY : HOIST_GEAR_LIGHT;
  const items = [];
  Object.entries(template).forEach(([catId, spec]) => {
    let qty = count * spec.per;
    if (spec.round5) qty = r5(qty);
    if (spec.roundUp) qty = rU(qty);
    items.push({ catId, name: spec.label, qty });
  });
  return items;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRIDLE STEEL PIECE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════
// Available steel cable lengths (feet) and STAC chain for fine-tuning
const STEEL_LENGTHS=[50,30,20,10,5,2]; // descending for greedy
const CHAIN_LEN=3; // STAC chain section = 3ft
const CHAIN_LINK=4/12; // 4 inches = 0.333 ft per link

/**
 * Calculate optimal steel cable + chain combination for a target leg length.
 * Beam connection is always 5' spanset+burlap+shackle (not counted in leg steel).
 * Returns {steels:[{len,qty}], chains:number, links:number, totalLen:number}
 */
function calcSteelPieces(targetFt,isHeavy){
  if(targetFt<=0)return{steels:[],chains:0,links:0,totalLen:0};
  let remaining=targetFt;const steels=[];
  // Greedy: use largest steel pieces first
  for(const len of STEEL_LENGTHS){
    if(remaining>=len){const qty=Math.floor(remaining/len);steels.push({len,qty});remaining-=qty*len;}
  }
  // Use STAC chain sections for remaining length (3' sections)
  let chains=0;
  if(remaining>=CHAIN_LEN){chains=Math.floor(remaining/CHAIN_LEN);remaining-=chains*CHAIN_LEN;}
  // Use chain links (4" each) for fine remainder
  let links=0;
  if(remaining>0.01){links=Math.ceil(remaining/CHAIN_LINK);remaining=0;}
  const totalLen=steels.reduce((s,p)=>s+p.len*p.qty,0)+chains*CHAIN_LEN+links*CHAIN_LINK;
  // Catalog IDs for gear list
  const prefix=isHeavy?"steel12":"steel38";
  const catMap=isHeavy?{2:"RIG17-25",5:"RIG17-30",10:"RIG17-40",20:"RIG17-50",30:"RIG17-60",50:"RIG17-70"}
    :{2:"RIG10-50",5:"RIG10-55",10:"RIG10-60",20:"RIG10-65",30:"RIG10-70",50:"RIG10-75"};
  const gearItems=steels.map(s=>({catId:catMap[s.len],name:CAT[catMap[s.len]]?.name||`Steel ${s.len}'`,qty:s.qty}));
  if(chains>0)gearItems.push({catId:"RIG11-20",name:CAT["RIG11-20"]?.name||"S.T.A.C. Chain 3'",qty:chains});
  return{steels,chains,links,totalLen,gearItems,prefix};
}

/**
 * Build full bridle gear list for one leg (beam connection + steel pieces).
 * Beam connection: 1x Spanset 5' + 1x Burlap + 1x Shackle, wrapped around beam.
 */
function calcBridleLegGear(legLenFt,isHeavy){
  const shackleId=isHeavy?"RIG17-10":"RIG10-00";const shackleName=CAT[shackleId]?.name;
  const pearId=isHeavy?"RIG17-20":"RIG10-05";const pearName=CAT[pearId]?.name;
  const items=[];
  // Beam connection: spanset 5' + burlap + shackle
  // Beam connection: 5' steel cable wrapped with burlap around beam to a shackle
  const beamSteelId=isHeavy?"RIG17-30":"RIG10-55";
  items.push({catId:beamSteelId,name:CAT[beamSteelId]?.name||"Steel 5' Cable",qty:1,note:"Beam wrap"});
  items.push({catId:"RIG11-30",name:"Burlap",qty:1,note:"Beam wrap"});
  items.push({catId:shackleId,name:shackleName,qty:1,note:"Beam to leg"});
  // Steel pieces for leg
  const sp=calcSteelPieces(legLenFt,isHeavy);
  sp.gearItems.forEach(g=>{items.push({...g,note:"Leg steel"});});
  // Shackles between steel pieces (n_pieces - 1 connectors + 1 at bottom)
  const nPieces=sp.steels.reduce((s,p)=>s+p.qty,0)+sp.chains;
  if(nPieces>1)items.push({catId:shackleId,name:shackleName,qty:nPieces-1,note:"Steel connectors"});
  // Bottom shackle + pear ring at apex
  items.push({catId:shackleId,name:shackleName,qty:1,note:"Apex connection"});
  items.push({catId:pearId,name:pearName,qty:1,note:"Apex pear ring"});
  return{items,steelPieces:sp};
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTINUOUS BEAM SOLVER (Three-Moment Theorem)
// ═══════════════════════════════════════════════════════════════════════════════

// Thomas algorithm for tridiagonal matrix: a=sub-diag, b=main-diag, c=super-diag, d=RHS
function solveTridiagonal(a, b, c, d) {
  const n = b.length;
  if (n === 0) return [];
  if (n === 1) return [d[0] / b[0]];
  const cp = new Array(n), dp = new Array(n), x = new Array(n);
  cp[0] = c[0] / b[0];
  dp[0] = d[0] / b[0];
  for (let i = 1; i < n; i++) {
    const m = b[i] - a[i] * cp[i - 1];
    cp[i] = i < n - 1 ? c[i] / m : 0;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / m;
  }
  x[n - 1] = dp[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
  return x;
}

/**
 * Solve a continuous beam with N supports under arbitrary point loads.
 * Uses the Three-Moment Theorem (Clapeyron) to find support reactions.
 * @param {number[]} supportPositions - sorted ascending positions of supports
 * @param {{position:number, weight:number}[]} loads - point loads on the beam
 * @returns {{reactions:number[], moments:number[], maxReaction:number}}
 */
export function solveBeamReactions(supportPositions, loads) {
  const N = supportPositions.length;
  if (N === 0) return { reactions: [], moments: [], maxReaction: 0 };
  if (N === 1) {
    const total = loads.reduce((s, l) => s + l.weight, 0);
    return { reactions: [total], moments: [0], maxReaction: total };
  }

  // Span lengths
  const nSpans = N - 1;
  const L = [];
  for (let i = 0; i < nSpans; i++) L.push(supportPositions[i + 1] - supportPositions[i]);

  // Assign each load to a span and compute theta contributions
  const thetaL = new Array(nSpans).fill(0);
  const thetaR = new Array(nSpans).fill(0);
  // Also track simple-beam reactions for each span
  const simpleLeft = new Array(nSpans).fill(0);
  const simpleRight = new Array(nSpans).fill(0);

  loads.forEach(ld => {
    if (ld.weight === 0) return;
    // Clamp load position to beam extent
    let pos = Math.max(supportPositions[0], Math.min(supportPositions[N - 1], ld.position));
    // Find which span this load falls in
    let spanIdx = 0;
    for (let i = 0; i < nSpans; i++) {
      if (pos <= supportPositions[i + 1] + 1e-12) { spanIdx = i; break; }
      if (i === nSpans - 1) spanIdx = i;
    }
    const a = pos - supportPositions[spanIdx];
    const b = L[spanIdx] - a;
    const P = ld.weight;
    const Li = L[spanIdx];
    if (Li < 1e-12) {
      // Zero-length span: load goes to left support
      simpleLeft[spanIdx] += P;
      return;
    }
    // Theta contributions for three-moment equations
    thetaL[spanIdx] += P * a * (Li * Li - a * a) / (6 * Li);
    thetaR[spanIdx] += P * b * (Li * Li - b * b) / (6 * Li);
    // Simple beam reactions
    simpleLeft[spanIdx] += P * b / Li;
    simpleRight[spanIdx] += P * a / Li;
  });

  // Build tridiagonal system for interior moments (M[0]=0, M[N-1]=0)
  const nInterior = N - 2;
  const moments = new Array(N).fill(0); // M[0..N-1]

  if (nInterior > 0) {
    const sa = new Array(nInterior).fill(0); // sub-diagonal
    const sb = new Array(nInterior).fill(0); // main diagonal
    const sc = new Array(nInterior).fill(0); // super-diagonal
    const sd = new Array(nInterior).fill(0); // RHS

    for (let k = 0; k < nInterior; k++) {
      const i = k + 1; // support index (1..N-2)
      const leftSpan = i - 1;
      const rightSpan = i;
      sa[k] = k > 0 ? L[leftSpan] : 0;
      sb[k] = 2 * (L[leftSpan] + L[rightSpan]);
      sc[k] = k < nInterior - 1 ? L[rightSpan] : 0;
      sd[k] = -6 * (thetaR[leftSpan] + thetaL[rightSpan]);
    }

    const mInterior = solveTridiagonal(sa, sb, sc, sd);
    for (let k = 0; k < nInterior; k++) moments[k + 1] = mInterior[k];
  }

  // Compute reactions from simple beam + moment corrections
  const reactions = new Array(N).fill(0);
  for (let i = 0; i < nSpans; i++) {
    const Li = L[i];
    if (Li < 1e-12) {
      reactions[i] += simpleLeft[i];
      continue;
    }
    const momentCorr = (moments[i + 1] - moments[i]) / Li;
    reactions[i] += simpleLeft[i] - momentCorr;
    reactions[i + 1] += simpleRight[i] + momentCorr;
  }

  const maxReaction = Math.max(0, ...reactions);
  return { reactions, moments, maxReaction };
}

/**
 * Generate evenly-spaced loads to approximate a uniform distributed load.
 * @param {number} totalWeight
 * @param {number} numPoints - number of discrete load points
 * @param {number} spanLength
 * @returns {{position:number, weight:number}[]}
 */
export function generateEvenLoads(totalWeight, numPoints, spanLength) {
  if (numPoints <= 0 || spanLength <= 0) return [];
  const w = totalWeight / numPoints;
  return Array.from({ length: numPoints }, (_, i) => ({
    position: numPoints === 1 ? spanLength / 2 : (spanLength * i) / (numPoints - 1),
    weight: w,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
function mkS(t) {
  return {
    app:{fontFamily:"'IBM Plex Mono','Fira Code',monospace",background:t.bg,color:t.textPrimary,minHeight:"100vh",overflowX:"hidden",width:"100%"},
    header:{background:t.headerGradient,borderBottom:`3px solid ${t.accent}`,position:"sticky",top:0,zIndex:100,overflow:"hidden",width:"100%"},
    headerInner:{maxWidth:1260,margin:"0 auto",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},
    logo:{display:"flex",alignItems:"center",gap:14},
    logoIcon:{width:48,height:48,borderRadius:"50%",objectFit:"contain"},
    logoText:{fontSize:24,fontWeight:900,letterSpacing:3,color:t.textPrimary},
    logoSub:{fontSize:9,color:t.textSecondary,letterSpacing:4,textTransform:"uppercase",marginTop:2,whiteSpace:"normal",lineHeight:1.4},
    nav:{display:"flex",gap:4,flexWrap:"wrap",flexShrink:1},
    navBtn:(a)=>({padding:"10px 12px",textAlign:"center",whiteSpace:"nowrap",background:a?`linear-gradient(180deg,${t.accent} 0%,${t.accent}CC 100%)`:"transparent",color:a?"#fff":t.textSecondary,border:a?`2px solid ${t.accent}`:`2px solid ${t.border}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:a?900:600,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s",boxShadow:a?`0 2px 8px ${t.accent}50,inset 0 1px 0 rgba(255,255,255,0.15)`:"none",textShadow:a?"0 1px 2px rgba(0,0,0,0.3)":"none",borderBottom:a?`2px solid ${t.accent}80`:`2px solid ${t.border}`}),
    langBtn:(a)=>({padding:"8px 10px",background:a?t.secondary:"transparent",color:a?"#fff":t.textSecondary,border:a?`2px solid ${t.secondary}`:`2px solid ${t.border}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?800:500,transition:"all .15s",display:"flex",alignItems:"center",gap:4,boxShadow:a?`0 2px 8px ${t.secondary}40,inset 0 1px 0 rgba(255,255,255,0.15)`:"none",letterSpacing:a?1:0}),
    main:{maxWidth:1200,margin:"0 auto",padding:"32px 24px",boxSizing:"border-box"},
    card:{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:28,marginBottom:20,boxShadow:t.cardGlow,boxSizing:"border-box"},
    cardTitle:{fontSize:15,fontWeight:700,color:t.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:20,paddingBottom:12,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10},
    secTitle:{fontSize:12,fontWeight:700,color:t.textSecondary,letterSpacing:3,textTransform:"uppercase",marginBottom:16,marginTop:24},
    label:{fontSize:10,color:t.textSecondary,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,display:"block",fontWeight:600},
    input:{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:4,padding:"10px 14px",color:t.textPrimary,fontFamily:"inherit",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16},
    g4:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16},
    res:{background:`linear-gradient(135deg,${t.surfaceLight} 0%,${t.surface} 100%)`,border:`1px solid ${t.accent}30`,borderRadius:6,padding:20,textAlign:"center"},
    resVal:{fontSize:30,fontWeight:900,color:t.accent,letterSpacing:-1},
    resLbl:{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginTop:4},
    tbl:{width:"100%",borderCollapse:"collapse",marginTop:12},
    th:{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:700,color:t.textSecondary,letterSpacing:1.5,textTransform:"uppercase",borderBottom:`2px solid ${t.border}`,background:t.surfaceLight},
    td:{padding:"10px 14px",fontSize:13,borderBottom:`1px solid ${t.border}20`,color:t.textPrimary},
    tdA:{padding:"10px 14px",fontSize:13,borderBottom:`1px solid ${t.border}20`,color:t.accent,fontWeight:700,textAlign:"right"},
    tdId:{padding:"10px 14px",fontSize:11,borderBottom:`1px solid ${t.border}20`,color:t.textSecondary,fontFamily:"inherit",letterSpacing:0.5},
    badge:(c)=>({display:"inline-block",padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:`${c}20`,color:c,border:`1px solid ${c}40`}),
    chip:(a)=>({padding:"9px 18px",background:a?`${t.accent}18`:t.surfaceLight,color:a?t.accent:t.textSecondary,border:a?`2px solid ${t.accent}`:`1px solid ${t.border}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?800:500,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s",boxShadow:a?`inset 0 0 12px ${t.accent}15`:"none"}),
    ctr:{display:"inline-flex",alignItems:"center",border:`2px solid ${t.border}`,borderRadius:2,overflow:"hidden"},
    ctrBtn:{width:34,height:34,background:t.surfaceLight,border:"none",color:t.textPrimary,cursor:"pointer",fontFamily:"inherit",fontSize:16,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"},
    ctrVal:{width:48,height:34,background:t.surface,borderLeft:`1px solid ${t.border}`,borderRight:`1px solid ${t.border}`,color:t.accent,fontFamily:"inherit",fontSize:14,fontWeight:700,textAlign:"center",border:"none",outline:"none",MozAppearance:"textfield",WebkitAppearance:"none",padding:0,margin:0},
    empty:{textAlign:"center",padding:"48px 24px",color:t.textSecondary},
    fg:{marginBottom:16},
    note:{color:t.textSecondary,fontSize:12,marginBottom:6,paddingLeft:12,borderLeft:`2px solid ${t.accent}40`},
    pill:{background:t.surfaceLight,padding:"8px 14px",borderRadius:4,border:`1px solid ${t.border}`},
    mCard:{background:t.surfaceLight,borderRadius:6,padding:16,border:`1px solid ${t.border}`,textAlign:"center"},
    bCard:{marginBottom:20,padding:16,background:t.surfaceLight,borderRadius:6,border:`1px solid ${t.border}`},
    gtWrap:{background:`linear-gradient(135deg,${t.surfaceLight} 0%,${t.surface} 100%)`,borderRadius:6,border:`2px solid ${t.accent}30`,padding:20},
    warnBox:(c)=>({background:`${c}12`,border:`1px solid ${c}40`,borderRadius:6,padding:14,marginBottom:20,display:"flex",gap:10,alignItems:"center"}),
    disc:{marginBottom:24,padding:"12px 16px",background:`${t.accent}08`,border:`1px solid ${t.accent}20`,borderRadius:6,fontSize:11,color:t.textSecondary,letterSpacing:0.5,wordBreak:"break-word",overflowWrap:"break-word"},
    diagWrap:{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:8,padding:20,marginTop:16,marginBottom:8},
    exportBtn:{padding:"13px 30px",background:`linear-gradient(180deg,${t.accent} 0%,${t.accent}CC 100%)`,color:"#fff",border:`2px solid ${t.accent}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:900,letterSpacing:2,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:8,transition:"all .15s",boxShadow:`0 3px 12px ${t.accent}40,inset 0 1px 0 rgba(255,255,255,0.2)`,textShadow:"0 1px 2px rgba(0,0,0,0.3)"},
    addonGroup:{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:16,marginBottom:12},
    addonTitle:{fontSize:12,fontWeight:700,color:t.accent,letterSpacing:1,marginBottom:12,textTransform:"uppercase"},
    addonRow:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}20`,gap:8,flexWrap:"wrap"},
    addonLabel:{fontSize:12,color:t.textPrimary,flex:1,minWidth:100},
    addonId:{fontSize:10,color:t.textSecondary,fontFamily:"inherit",minWidth:70},
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════════════════════════════
export const Field = ({label,children,style})=>{const{s}=useTheme();return<div style={{...s.fg,...style}}><label style={s.label}>{label}</label>{children}</div>;};
export const Inp = ({value,onChange,type="number",placeholder,step,min})=>{const{s}=useTheme();return<input style={s.input} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} step={step} min={min}/>;};
export const Chips = ({options,value,onChange})=>{const{s}=useTheme();return<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{options.map(o=><button key={o} style={s.chip(value===o)} onClick={()=>onChange(o)}>{o}</button>)}</div>;};
const FlagStripe = ({theme})=>{const c=theme==="usa"?["#BF0A30","#FFF","#002868","#FFF","#BF0A30"]:["#ED0000","#FFF","#0050F0","#FFF","#ED0000"];return<div style={{height:4,display:"flex"}}>{c.map((cl,i)=><div key={i} style={{flex:1,background:cl}}/>)}</div>;};

const MiniCounter = ({value, onChange}) => {
  const {s} = useTheme();
  return (
    <div style={s.ctr}>
      <button style={s.ctrBtn} onClick={()=>onChange(Math.max(0,value-1))}>−</button>
      <input type="number" min="0" style={s.ctrVal} value={value} onChange={e=>{const v=parseInt(e.target.value);onChange(isNaN(v)?0:Math.max(0,v));}} onFocus={e=>e.target.select()}/>
      <button style={s.ctrBtn} onClick={()=>onChange(value+1)}>+</button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SVG DIAGRAMS
// ═══════════════════════════════════════════════════════════════════════════════

// Interactive diagram for straight rigs with beam loading
function InteractivePointLoadDiagram({spanLength,hoistPositions,loads,reactions,maxReaction,unit,loadMode,onAddLoad,onUpdateLoad,onDeleteLoad,svgRef}){
  const{t,tx}=useTheme();const ac=t.accent,dim=t.textSecondary;
  const uW=unit==="imperial"?"lbs":"kg",uD=unit==="imperial"?"ft":"m";
  const w=600,h=400,padX=60,plotW=w-padX*2;
  const S=Math.max(spanLength,0.001);
  const toSvgX=pos=>padX+(pos/S)*plotW;
  const toBeamPos=svgX=>Math.max(0,Math.min(S,((svgX-padX)/plotW)*S));
  const gridY=20,hoistY=80,trussY=120,loadY=220,dimY=360;

  // Reaction color: green→yellow→red
  const rxColor=r=>{
    if(maxReaction<=0)return success;
    const ratio=Math.abs(r)/maxReaction;
    if(ratio<0.5)return success;
    if(ratio<0.8)return warning;
    return danger;
  };

  // Handle click on truss to add load (custom mode only)
  const handleTrussClick=e=>{
    if(loadMode!=="custom"||!svgRef.current||!onAddLoad)return;
    const svg=svgRef.current;
    const pt=svg.createSVGPoint();
    pt.x=e.clientX;pt.y=e.clientY;
    const svgPt=pt.matrixTransform(svg.getScreenCTM().inverse());
    const pos=toBeamPos(svgPt.x);
    onAddLoad(pos);
  };

  // Drag state (local to SVG interactions)
  const[dragId,setDragId]=useState(null);
  const handleDragStart=(e,id)=>{e.stopPropagation();setDragId(id);};
  const handleDragMove=e=>{
    if(dragId===null||!svgRef.current||!onUpdateLoad)return;
    const svg=svgRef.current;
    const pt=svg.createSVGPoint();
    pt.x=e.clientX;pt.y=e.clientY;
    const svgPt=pt.matrixTransform(svg.getScreenCTM().inverse());
    const pos=Math.round(toBeamPos(svgPt.x)*100)/100;
    onUpdateLoad(dragId,"position",pos);
  };
  const handleDragEnd=()=>setDragId(null);

  return(
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:600,cursor:loadMode==="custom"?"crosshair":"default",userSelect:"none"}}
      onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
      <defs>
        <marker id="ipl-ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker>
      </defs>
      {/* Grid Iron */}
      <rect x={padX-10} y={gridY} width={plotW+20} height={12} rx={2} fill={dim} opacity={0.3}/>
      <text x={w/2} y={gridY-4} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>
      {/* Hoist chain lines + points + reactions */}
      {hoistPositions.map((pos,i)=>{
        const x=toSvgX(pos);const rx=(reactions&&reactions[i])||0;const col=rxColor(rx);const isMax=maxReaction>0&&Math.abs(rx-maxReaction)<0.01;
        return(<g key={`h${i}`}>
          <line x1={x} y1={gridY+12} x2={x} y2={hoistY-8} stroke={dim} strokeWidth={1.5} strokeDasharray="4 3"/>
          <circle cx={x} cy={hoistY} r={6} fill={col} stroke={isMax?"#fff":"none"} strokeWidth={isMax?2:0}/>
          <text x={x} y={hoistY-14} textAnchor="middle" fill={col} fontSize="10" fontFamily="inherit" fontWeight="700">{rx.toFixed(0)} {uW}</text>
          {isMax&&<text x={x} y={hoistY-26} textAnchor="middle" fill={danger} fontSize="8" fontFamily="inherit" fontWeight="900" letterSpacing="1">{tx.plMaxReaction}</text>}
          <text x={x} y={hoistY+18} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit">R{i+1}</text>
        </g>);
      })}
      {/* Truss line (clickable in custom mode) */}
      <rect x={padX-6} y={trussY-8} width={plotW+12} height={16} rx={3} fill="none" stroke={ac} strokeWidth={2}
        style={{cursor:loadMode==="custom"?"crosshair":"default"}} onClick={handleTrussClick}/>
      <text x={w/2} y={trussY+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">TRUSS</text>
      {/* Load arrows */}
      {loads.map((ld,i)=>{
        const x=toSvgX(ld.position);
        return(<g key={`ld${ld.id||i}`}>
          {/* Arrow from truss down */}
          <line x1={x} y1={trussY+10} x2={x} y2={loadY-10} stroke={ac} strokeWidth={2} markerEnd="url(#ipl-ah)"/>
          {/* Load box - draggable in custom mode */}
          <g style={{cursor:loadMode==="custom"?"grab":"default"}}
            onMouseDown={loadMode==="custom"?e=>handleDragStart(e,ld.id):undefined}>
            <rect x={x-32} y={loadY-8} width={64} height={26} rx={4} fill={ac} opacity={0.15} stroke={ac} strokeWidth={1}/>
            <text x={x} y={loadY+10} textAnchor="middle" fill={ac} fontSize="10" fontFamily="inherit" fontWeight="700">{ld.weight.toFixed(0)} {uW}</text>
          </g>
          {/* Position label */}
          <text x={x} y={loadY+32} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit">{ld.position.toFixed(1)} {uD}</text>
          {/* Delete button (custom mode) */}
          {loadMode==="custom"&&onDeleteLoad&&(
            <g style={{cursor:"pointer"}} onClick={()=>onDeleteLoad(ld.id)}>
              <circle cx={x+28} cy={loadY-4} r={7} fill={danger} opacity={0.8}/>
              <text x={x+28} y={loadY-1} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="inherit" fontWeight="700">✕</text>
            </g>
          )}
        </g>);
      })}
      {/* Dimension line */}
      <line x1={padX} y1={dimY} x2={padX+plotW} y2={dimY} stroke={dim} strokeWidth={1}/>
      <line x1={padX} y1={dimY-5} x2={padX} y2={dimY+5} stroke={dim} strokeWidth={1}/>
      <line x1={padX+plotW} y1={dimY-5} x2={padX+plotW} y2={dimY+5} stroke={dim} strokeWidth={1}/>
      <text x={w/2} y={dimY+16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit">{S.toFixed(1)} {uD}</text>
      {/* Click hint for custom mode */}
      {loadMode==="custom"&&loads.length===0&&(
        <text x={w/2} y={trussY+40} textAnchor="middle" fill={dim} fontSize="11" fontFamily="inherit" fontStyle="italic">{tx.plClickToAdd}</text>
      )}
    </svg>
  );
}

function PointLoadDiagram({rigType,numPoints,pointLoad,unit,pointLoads,curvedDims}){
  const{t,tx}=useTheme();const N=parseInt(numPoints)||3;const pL=parseFloat(pointLoad)||0;
  const uW=unit==="imperial"?"lbs":"kg";const w=520,h=320;const ac=t.accent,dim=t.textSecondary,sec=t.secondary;
  if(rigType==="straight"){const padX=60,tY=80,sp=(w-padX*2)/Math.max(N-1,1);const pts=Array.from({length:N},(_,i)=>padX+i*sp);
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={padX-10} y={20} width={w-padX*2+20} height={12} rx={2} fill={dim} opacity={0.3}/><text x={w/2} y={16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>{pts.map((x,i)=><line key={`ch${i}`} x1={x} y1={32} x2={x} y2={tY-8} stroke={dim} strokeWidth={1.5} strokeDasharray="4 3"/>)}<rect x={padX-6} y={tY-8} width={w-padX*2+12} height={16} rx={3} fill="none" stroke={ac} strokeWidth={2}/><text x={w/2} y={tY+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">TRUSS</text>{pts.map((x,i)=>(<g key={i}><circle cx={x} cy={tY+8} r={5} fill={ac}/><line x1={x} y1={tY+18} x2={x} y2={tY+80} stroke={ac} strokeWidth={2} markerEnd="url(#ah)"/><rect x={x-28} y={tY+86} width={56} height={22} rx={3} fill={ac} opacity={0.15}/><text x={x} y={tY+101} textAnchor="middle" fill={ac} fontSize="10" fontFamily="inherit" fontWeight="700">{pL} {uW}</text><text x={x} y={tY+120} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">P{i+1}</text></g>))}<line x1={pts[0]} y1={h-30} x2={pts[pts.length-1]} y2={h-30} stroke={dim} strokeWidth={1}/><text x={w/2} y={h-16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit">{N} points</text></svg>);}
  if(rigType==="curved"){
    const cW=580,cH=580;const hasPerPt=pointLoads&&pointLoads.length===N;
    const uD=unit==="imperial"?"ft":"m";
    const cd=curvedDims||{};const rVal=cd.radius||0;const aDeg=cd.angleDeg||90;
    const arcL=cd.arcLen||0;const chordL=cd.chordLen||0;
    const aRad=aDeg*Math.PI/180;
    const warning=t.warning||"#f0ad4e";

    // ─── PLAN VIEW ───
    const topY0=30;const topCx=cW/2;
    const topArcR=130;// larger arc for better label spacing
    const visAngle=Math.min(Math.max(aRad,0.35),Math.PI*1.6);
    // Center the arc: for small angles the arc is near the top, for large angles it pushes down
    const topCy=topY0+topArcR+40;
    // Points along arc
    const topPts=Array.from({length:N},(_,i)=>{
      const frac=N===1?0.5:i/(N-1);
      const a=-visAngle/2+frac*visAngle-Math.PI/2;
      return{x:topCx+topArcR*Math.cos(a),y:topCy+topArcR*Math.sin(a)};
    });
    const topStart=topPts[0],topEnd=topPts[N-1];
    const topLargeArc=visAngle>Math.PI?1:0;
    // Bounding box of plan view for positioning
    const topMinY=Math.min(...topPts.map(p=>p.y));
    const topMaxY=Math.max(...topPts.map(p=>p.y),topCy);
    const planBottom=topMaxY+50;// leave room for stage front label

    // ─── ELEVATION VIEW ───
    const sideY0=planBottom+24;const sideGridY=sideY0+22;
    const sidePad=70,sideSpan=cW-sidePad*2;
    const maxChain=55,minChain=18;
    const sidePts=Array.from({length:N},(_,i)=>{
      const frac=N===1?0.5:i/(N-1);
      const x=sidePad+frac*sideSpan;
      const d=Math.abs(frac-0.5)*2;
      return{x,y:sideGridY+10+minChain+(maxChain-minChain)*d*d};
    });
    const loadDrop=44;
    const botY=Math.max(...sidePts.map(p=>p.y))+loadDrop+44;
    const svgH=Math.max(cH,botY+10);

    // Container styles for the two views
    const ctnr={background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"14px 10px 10px"};
    const ctnrTitle={fontSize:10,color:dim,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8,textAlign:"center"};
    // Plan view SVG dimensions (self-contained)
    const planH=planBottom+10;
    // Elevation SVG dimensions (self-contained, reset Y origin)
    const eGridY=30;
    const eSidePts=Array.from({length:N},(_,i)=>{
      const frac=N===1?0.5:i/(N-1);
      const x=sidePad+frac*sideSpan;
      const d=Math.abs(frac-0.5)*2;
      return{x,y:eGridY+10+minChain+(maxChain-minChain)*d*d};
    });
    const eLoadDrop=loadDrop;
    const eBotY=Math.max(...eSidePts.map(p=>p.y))+eLoadDrop+38+(N>4?18:0)+18;
    const elevH=eBotY+6;

    return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* ═══ PLAN VIEW CONTAINER ═══ */}
      <div style={ctnr}>
        <div style={ctnrTitle}>Plan View</div>
        <svg viewBox={`0 0 ${cW} ${planH}`} style={{width:"100%",maxWidth:600}}>
          {/* Arc truss */}
          <path d={`M ${topStart.x} ${topStart.y} A ${topArcR} ${topArcR} 0 ${topLargeArc} 1 ${topEnd.x} ${topEnd.y}`} fill="none" stroke={ac} strokeWidth={3}/>
          {/* Pick points — labels pushed outward radially */}
          {topPts.map((p,i)=>{const ptW=hasPerPt?pointLoads[i]:pL;
            const dx=(p.x-topCx)/topArcR;const dy=(p.y-topCy)/topArcR;
            const lbl=32;const lx=p.x+dx*lbl;const ly=p.y+dy*lbl;
            const anc=Math.abs(dx)<0.2?"middle":dx<0?"end":"start";
            return(<g key={`tp${i}`}>
              <circle cx={p.x} cy={p.y} r={5} fill={ac}/>
              <line x1={p.x+dx*7} y1={p.y+dy*7} x2={p.x+dx*20} y2={p.y+dy*20} stroke={dim} strokeWidth={0.6}/>
              <text x={lx} y={ly-1} textAnchor={anc} fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">{ptW} {uW}</text>
              <text x={lx} y={ly+10} textAnchor={anc} fill={dim} fontSize="8" fontFamily="inherit">P{i+1}</text>
            </g>);})}
          {/* Chord dashed line */}
          <line x1={topStart.x} y1={topStart.y} x2={topEnd.x} y2={topEnd.y} stroke={dim} strokeWidth={0.8} strokeDasharray="5 3"/>
          {/* Radius line: center → mid-arc */}
          <line x1={topCx} y1={topCy} x2={topPts[Math.floor(N/2)].x} y2={topPts[Math.floor(N/2)].y} stroke={dim} strokeWidth={0.7} strokeDasharray="3 2"/>
          <circle cx={topCx} cy={topCy} r={3} fill="none" stroke={dim} strokeWidth={0.8}/>
          {/* Angle arc near center */}
          {aDeg>0&&(()=>{const annR=28;const a1=-visAngle/2-Math.PI/2;const a2=visAngle/2-Math.PI/2;
            return<g>
              <path d={`M ${topCx+annR*Math.cos(a1)} ${topCy+annR*Math.sin(a1)} A ${annR} ${annR} 0 ${topLargeArc} 1 ${topCx+annR*Math.cos(a2)} ${topCy+annR*Math.sin(a2)}`} fill="none" stroke={warning} strokeWidth={1} opacity={0.7}/>
              <text x={topCx} y={topCy+annR+4} textAnchor="middle" fill={warning} fontSize="9" fontFamily="inherit" fontWeight="700">{aDeg}°</text>
            </g>;
          })()}
          {/* Dimension legend — top-right */}
          {(()=>{const bx=cW-16;const by=topMinY+10;
            return<g>
              <text x={bx} y={by} textAnchor="end" fill={dim} fontSize="8.5" fontFamily="inherit" fontStyle="italic">R = {rVal.toFixed(1)} {uD}</text>
              {arcL>0&&<text x={bx} y={by+13} textAnchor="end" fill={ac} fontSize="8.5" fontFamily="inherit" fontWeight="600">Arc = {arcL.toFixed(1)} {uD}</text>}
              {chordL>0&&<text x={bx} y={by+26} textAnchor="end" fill={dim} fontSize="8.5" fontFamily="inherit" fontStyle="italic">Chord = {chordL.toFixed(1)} {uD}</text>}
            </g>;
          })()}
          {/* Stage front reference line */}
          <line x1={topCx-topArcR-50} y1={planBottom-16} x2={topCx+topArcR+50} y2={planBottom-16} stroke={dim} strokeWidth={0.5} strokeDasharray="6 4"/>
          <text x={topCx} y={planBottom-4} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit" letterSpacing="1.5">STAGE FRONT</text>
        </svg>
      </div>

      {/* ═══ ELEVATION VIEW CONTAINER ═══ */}
      <div style={ctnr}>
        <div style={ctnrTitle}>Elevation View</div>
        <svg viewBox={`0 0 ${cW} ${elevH}`} style={{width:"100%",maxWidth:600}}>
          <defs>
            <marker id="ah2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker>
            <marker id="dimA" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0 0,6 2,0 4" fill={dim}/></marker>
            <marker id="dimB" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto"><polygon points="6 0,0 2,6 4" fill={dim}/></marker>
          </defs>
          {/* Grid iron */}
          <rect x={sidePad-14} y={14} width={sideSpan+28} height={8} rx={2} fill={dim} opacity={0.2}/>
          <text x={cW/2} y={10} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit" letterSpacing="1">{tx.gridIron}</text>
          {/* Chain lines */}
          {eSidePts.map((p,i)=><line key={`sch${i}`} x1={p.x} y1={22} x2={p.x} y2={p.y-5} stroke={dim} strokeWidth={1} strokeDasharray="4 3"/>)}
          {/* Truss curve */}
          {(()=>{
            if(eSidePts.length<3)return<line x1={eSidePts[0].x} y1={eSidePts[0].y} x2={eSidePts[N-1].x} y2={eSidePts[N-1].y} stroke={ac} strokeWidth={2.5}/>;
            const pathD=eSidePts.reduce((acc,p,i)=>{
              if(i===0)return`M ${p.x} ${p.y}`;
              if(i===eSidePts.length-1)return acc+` L ${p.x} ${p.y}`;
              const mx=(eSidePts[i-1].x+p.x)/2;const my=(eSidePts[i-1].y+p.y)/2;
              return acc+` Q ${eSidePts[i-1].x} ${eSidePts[i-1].y} ${mx} ${my}`;
            },"");
            return<path d={pathD} fill="none" stroke={ac} strokeWidth={2.5}/>;
          })()}
          {/* Loads */}
          {eSidePts.map((p,i)=>{const ptW=hasPerPt?pointLoads[i]:pL;
            const alt=N>4&&i%2===1;const drop=alt?eLoadDrop+18:eLoadDrop;
            return(<g key={`sp${i}`}>
              <circle cx={p.x} cy={p.y} r={3.5} fill={ac}/>
              <line x1={p.x} y1={p.y+6} x2={p.x} y2={p.y+drop-4} stroke={ac} strokeWidth={1.5} markerEnd="url(#ah2)"/>
              <rect x={p.x-26} y={p.y+drop} width={52} height={17} rx={3} fill={ac} opacity={0.12}/>
              <text x={p.x} y={p.y+drop+12} textAnchor="middle" fill={ac} fontSize="8.5" fontFamily="inherit" fontWeight="700">{ptW} {uW}</text>
              <text x={p.x} y={p.y+drop+25} textAnchor="middle" fill={dim} fontSize="7.5" fontFamily="inherit">P{i+1}</text>
            </g>);})}
          {/* Bottom dimension line */}
          {(()=>{const dy=Math.max(...eSidePts.map(p=>p.y))+eLoadDrop+38+(N>4?18:0);
            return<g>
              <line x1={eSidePts[0].x} y1={dy} x2={eSidePts[N-1].x} y2={dy} stroke={dim} strokeWidth={0.7} markerStart="url(#dimB)" markerEnd="url(#dimA)"/>
              <line x1={eSidePts[0].x} y1={dy-4} x2={eSidePts[0].x} y2={dy+4} stroke={dim} strokeWidth={0.6}/>
              <line x1={eSidePts[N-1].x} y1={dy-4} x2={eSidePts[N-1].x} y2={dy+4} stroke={dim} strokeWidth={0.6}/>
              <text x={cW/2} y={dy+14} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">{N} {tx.plHoistPoints}{arcL>0?` · Arc: ${arcL.toFixed(1)} ${uD}`:""}</text>
            </g>;
          })()}
        </svg>
      </div>
    </div>);
  }
  if(rigType==="circular"){const cx=w/2,cy=h/2-10,r=100;const hasPerPt=pointLoads&&pointLoads.length===N;const pts=Array.from({length:N},(_,i)=>{const a=(Math.PI*2*i)/N-Math.PI/2;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};});
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah3" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill={ac}/></marker></defs><circle cx={cx} cy={cy} r={r} fill="none" stroke={ac} strokeWidth={2.5}/>{pts.map((p,i)=>{const dx=(p.x-cx)/r,dy=(p.y-cy)/r;const ax=p.x+dx*55,ay=p.y+dy*55;const ptW=hasPerPt?pointLoads[i]:pL;return(<g key={i}><circle cx={p.x} cy={p.y} r={5} fill={ac}/><line x1={p.x+dx*8} y1={p.y+dy*8} x2={ax-dx*6} y2={ay-dy*6} stroke={ac} strokeWidth={1.5} markerEnd="url(#ah3)"/><text x={ax+dx*8} y={ay+dy*4+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">{ptW}</text></g>);})}<text x={cx} y={h-8} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit">{N} points · 360°</text></svg>);}
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={80} y={20} width={w-160} height={14} rx={2} fill={dim} opacity={0.3}/><text x={w/2} y={16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>{Array.from({length:Math.min(N,4)},(_,i)=>{const x=140+i*70;return(<g key={i}><line x1={x} y1={34} x2={x} y2={60} stroke={dim} strokeWidth={1.2} strokeDasharray="4 3"/><rect x={x-8} y={60} width={16} height={24} rx={2} fill={sec} opacity={0.6}/><text x={x} y={76} textAnchor="middle" fill="#fff" fontSize="7" fontFamily="inherit">M</text><line x1={x} y1={84} x2={x} y2={230} stroke={dim} strokeWidth={1.5} strokeDasharray="6 2"/><circle cx={x} cy={230} r={4} fill={ac}/></g>);})}<rect x={120} y={240} width={Math.min(N,4)*70+20} height={14} rx={3} fill="none" stroke={ac} strokeWidth={2}/><line x1={w/2} y1={256} x2={w/2} y2={290} stroke={ac} strokeWidth={2} markerEnd="url(#ah4)"/><text x={w/2} y={306} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="700">{pL} {uW}/pt</text></svg>);
}

function BridleDiagram({bridleType,result,unit}){
  const{t,tx}=useTheme();if(!result||result.err) return null;
  const ac=t.accent,sec=t.secondary,dim=t.textSecondary,warn="#E67E22";
  const dL=unit==="imperial"?"ft":"m",wL=unit==="imperial"?"lbs":"kg";
  // Shackle component — draws a U-shape shackle at position
  const Shackle=({x,y,size=8,rot=0})=>(<g transform={`translate(${x},${y}) rotate(${rot})`}><path d={`M ${-size/2} ${-size*0.3} L ${-size/2} ${size*0.3} A ${size/2} ${size/2} 0 0 0 ${size/2} ${size*0.3} L ${size/2} ${-size*0.3}`} fill="none" stroke="#AAA" strokeWidth={1.8}/><line x1={-size/2-2} y1={-size*0.3} x2={size/2+2} y2={-size*0.3} stroke="#AAA" strokeWidth={2}/><circle cx={0} cy={-size*0.3} r={1.5} fill="#AAA"/></g>);
  // Pear ring component
  const PearRing=({x,y,size=7})=>(<g><ellipse cx={x} cy={y-size*0.2} rx={size*0.45} ry={size*0.5} fill="none" stroke="#CCC" strokeWidth={1.8}/><ellipse cx={x} cy={y+size*0.5} rx={size*0.3} ry={size*0.3} fill="none" stroke="#CCC" strokeWidth={1.5}/></g>);

  if(bridleType==="2"||bridleType==="3"){
    const w=540,h=420;const beamY=48,apexY=200,loadY=320;
    const spread=160,lB=w/2-spread,rB=w/2+spread;
    // Apex X position: proportional to dA/D between beams
    const hsA=result.hsA||0,hsB=result.hsB||0,D=hsA+hsB||1;
    const apexX=lB+((hsA/D)*(rB-lB));
    return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"14px 10px 10px"}}>
        <div style={{fontSize:10,color:dim,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8,textAlign:"center"}}>Front Elevation — Bridle Assembly</div>
        <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:560}}>
          <defs><marker id="bdah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill={ac}/></marker><marker id="bdim" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto"><polygon points="0 0,6 2,0 4" fill={dim}/></marker><marker id="bdimR" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse"><polygon points="0 0,6 2,0 4" fill={dim}/></marker></defs>
          {/* Grid iron / beam bars */}
          <rect x={lB-50} y={beamY-10} width={spread*2+100} height={8} rx={1} fill={sec} opacity={0.35}/>
          <line x1={lB-50} y1={beamY+2} x2={rB+50} y2={beamY+2} stroke={sec} strokeWidth={0.5} opacity={0.5}/>
          <text x={w/2} y={beamY-16} textAnchor="middle" fill={`${dim}80`} fontSize="8" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>
          {/* Beam bars */}
          <rect x={lB-28} y={beamY-4} width={56} height={12} rx={2} fill={sec} opacity={0.7}/>
          <rect x={rB-28} y={beamY-4} width={56} height={12} rx={2} fill={sec} opacity={0.7}/>
          <text x={lB} y={beamY-16} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit" fontWeight="600">{tx.beam} A</text>
          <text x={rB} y={beamY-16} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit" fontWeight="600">{tx.beam} B</text>
          {bridleType==="3"&&<><rect x={w/2-22} y={beamY-4} width={44} height={12} rx={2} fill={sec} opacity={0.5}/><text x={w/2} y={beamY-16} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit" fontWeight="600">C</text></>}
          {/* Shackles + burlap at beam points */}
          <Shackle x={lB} y={beamY+18} size={9}/>
          <Shackle x={rB} y={beamY+18} size={9}/>
          {bridleType==="3"&&<Shackle x={w/2} y={beamY+18} size={9}/>}
          <text x={lB+16} y={beamY+22} fill="#AAA" fontSize="7" fontFamily="inherit">Steel+Burlap</text>
          {/* Steel cable legs — asymmetric to apex */}
          <line x1={lB} y1={beamY+28} x2={apexX} y2={apexY-12} stroke={ac} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={rB} y1={beamY+28} x2={apexX} y2={apexY-12} stroke={ac} strokeWidth={2.5} strokeLinecap="round"/>
          {bridleType==="3"&&<line x1={w/2} y1={beamY+28} x2={apexX} y2={apexY-12} stroke={ac} strokeWidth={2} strokeDasharray="6 3"/>}
          {/* Leg A label */}
          {(()=>{const mx=(lB+apexX)/2-14,my=(beamY+28+apexY-12)/2;const ang=Math.atan2(apexY-12-(beamY+28),apexX-lB)*180/Math.PI;return <text x={mx} y={my} fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700" transform={`rotate(${ang} ${mx} ${my})`} textAnchor="middle">A: {result.llA} {dL}</text>;})()}
          {/* Leg B label */}
          {(()=>{const mx=(rB+apexX)/2+14,my=(beamY+28+apexY-12)/2;const ang=Math.atan2(apexY-12-(beamY+28),apexX-rB)*180/Math.PI;return <text x={mx} y={my} fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700" transform={`rotate(${ang} ${mx} ${my})`} textAnchor="middle">B: {result.llB} {dL}</text>;})()}
          {/* Apex hardware */}
          <Shackle x={apexX} y={apexY-6} size={10} rot={180}/>
          <PearRing x={apexX} y={apexY+8} size={8}/>
          <circle cx={apexX} cy={apexY} r={4} fill={ac}/>
          <text x={apexX+20} y={apexY-8} fill="#AAA" fontSize="7" fontFamily="inherit">Shackle</text>
          <text x={apexX+20} y={apexY+12} fill="#AAA" fontSize="7" fontFamily="inherit">Pear Ring</text>
          {/* Included angle arc */}
          {(()=>{const r=32;const tA=Math.atan2(hsA,parseFloat(result.ah)),tB=Math.atan2(hsB,parseFloat(result.ah));const x1=apexX-r*Math.sin(tA),y1=apexY-r*Math.cos(tA);const x2=apexX+r*Math.sin(tB),y2=apexY-r*Math.cos(tB);return<><path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={warn} strokeWidth={1.5}/><text x={apexX} y={apexY-38} textAnchor="middle" fill={warn} fontSize="10" fontFamily="inherit" fontWeight="700">{result.ia}°</text></>;})()}
          {/* Drop line to pick point */}
          <line x1={apexX} y1={apexY+20} x2={apexX} y2={loadY-20} stroke={dim} strokeWidth={1.5} strokeDasharray="5 3"/>
          <text x={apexX+10} y={(apexY+20+loadY-20)/2} fill={dim} fontSize="8" fontFamily="inherit">Chain</text>
          {/* Load box */}
          <rect x={apexX-60} y={loadY-18} width={120} height={32} rx={4} fill={`${ac}12`} stroke={ac} strokeWidth={2}/>
          <text x={apexX} y={loadY-2} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="600">PICK POINT</text>
          <text x={apexX} y={loadY+10} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="800">{result.W} {wL}</text>
          <line x1={apexX} y1={loadY+16} x2={apexX} y2={loadY+40} stroke={ac} strokeWidth={2} markerEnd="url(#bdah)"/>
          {/* DIMENSIONS */}
          {/* Beam spacing */}
          <line x1={lB} y1={h-40} x2={rB} y2={h-40} stroke={dim} strokeWidth={0.8} markerStart="url(#bdimR)" markerEnd="url(#bdim)"/>
          <line x1={lB} y1={h-48} x2={lB} y2={h-34} stroke={dim} strokeWidth={0.5}/>
          <line x1={rB} y1={h-48} x2={rB} y2={h-34} stroke={dim} strokeWidth={0.5}/>
          <text x={w/2} y={h-44} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit">{tx.brBeamSpacing}</text>
          {/* Distance from Beam A */}
          <line x1={lB} y1={h-20} x2={apexX} y2={h-20} stroke={`${ac}80`} strokeWidth={0.8} markerStart="url(#bdimR)" markerEnd="url(#bdim)"/>
          <line x1={lB} y1={h-28} x2={lB} y2={h-14} stroke={`${ac}80`} strokeWidth={0.5}/>
          <line x1={apexX} y1={h-28} x2={apexX} y2={h-14} stroke={`${ac}80`} strokeWidth={0.5}/>
          <text x={(lB+apexX)/2} y={h-8} textAnchor="middle" fill={`${ac}80`} fontSize="8" fontFamily="inherit">{tx.brDistFromA}</text>
          {/* Headroom */}
          <line x1={rB+48} y1={beamY+4} x2={rB+48} y2={apexY} stroke={dim} strokeWidth={0.8} markerStart="url(#bdimR)" markerEnd="url(#bdim)"/>
          <line x1={rB+40} y1={beamY+4} x2={rB+56} y2={beamY+4} stroke={dim} strokeWidth={0.5}/>
          <line x1={rB+40} y1={apexY} x2={rB+56} y2={apexY} stroke={dim} strokeWidth={0.5}/>
          <text x={rB+60} y={(beamY+apexY)/2+3} fill={dim} fontSize="8" fontFamily="inherit">{result.ah} {dL}</text>
        </svg>
      </div>
      {/* PARTS LEGEND */}
      <div style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:dim,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Bridle Components (per leg)</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[{label:"Steel 5'",desc:"Beam wrap",color:"#888"},{label:"Burlap",desc:"Beam protection",color:"#8B7355"},{label:"Shackle",desc:"Beam to leg",color:"#AAA"},{label:"Steel Cable",desc:"Leg",color:ac},{label:"Shackle + Pear Ring",desc:"Apex",color:"#CCC"}].map((p,i)=>
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:t.surface,borderRadius:4,border:`1px solid ${t.border}`,fontSize:10}}>
              <div style={{width:10,height:10,borderRadius:2,background:p.color,flexShrink:0}}/>
              <div><span style={{color:t.textPrimary,fontWeight:600}}>{p.label}</span><span style={{color:dim,marginLeft:4}}>{p.desc}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>);
  }
  // ARENA (4-leg) — top view
  const w=520,h=380;const cx=w/2,cy=h/2-10,sp=110;const corners=[[-sp,-sp],[sp,-sp],[sp,sp],[-sp,sp]].map(([dx,dy])=>({x:cx+dx,y:cy+dy}));
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"14px 10px 10px"}}>
      <div style={{fontSize:10,color:dim,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8,textAlign:"center"}}>Arena — Top View</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}>
        <defs><marker id="bdim4" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto"><polygon points="0 0,6 2,0 4" fill={dim}/></marker><marker id="bdim4R" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse"><polygon points="0 0,6 2,0 4" fill={dim}/></marker></defs>
        <rect x={cx-sp} y={cy-sp} width={sp*2} height={sp*2} fill="none" stroke={dim} strokeWidth={1} strokeDasharray="6 3"/>
        {corners.map((c,i)=>{const ang=Math.atan2(cy-c.y,cx-c.x);const legMx=(c.x+cx)/2,legMy=(c.y+cy)/2;const lbl=String.fromCharCode(65+i);return(<g key={i}><line x1={c.x} y1={c.y} x2={cx} y2={cy} stroke={ac} strokeWidth={2.5}/><circle cx={c.x} cy={c.y} r={10} fill={sec} opacity={0.6}/><text x={c.x} y={c.y+4} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="inherit" fontWeight="700">{lbl}</text><Shackle x={c.x+Math.cos(ang)*16} y={c.y+Math.sin(ang)*16} size={7} rot={ang*180/Math.PI+90}/></g>);})}
        <circle cx={cx} cy={cy} r={22} fill={`${ac}18`} stroke={ac} strokeWidth={2}/>
        <PearRing x={cx} y={cy} size={6}/>
        <text x={cx} y={cy+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">{tx.load}</text>
        <text x={cx} y={cy+40} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="800">{result.lpl} {wL}/leg</text>
        {/* Dimensions */}
        <line x1={cx-sp} y1={h-30} x2={cx+sp} y2={h-30} stroke={dim} strokeWidth={0.8} markerStart="url(#bdim4R)" markerEnd="url(#bdim4)"/>
        <text x={cx} y={h-18} textAnchor="middle" fill={dim} fontSize="8" fontFamily="inherit">{tx.brBeamSpacing}</text>
        <text x={cx} y={h-6} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">L={result.ll} {dL} · {result.ia}°</text>
      </svg>
    </div>
    <div style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"12px 14px"}}>
      <div style={{fontSize:10,color:dim,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Bridle Components (per leg)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {[{label:"Shackle",desc:"Beam connection",color:"#AAA"},{label:"Steel Cable",desc:result.ll+" "+dL,color:ac},{label:"Shackle",desc:"Apex connection",color:"#AAA"},{label:"Pear Ring",desc:"Apex hardware",color:"#CCC"}].map((p,i)=>
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:t.surface,borderRadius:4,border:`1px solid ${t.border}`,fontSize:10}}>
            <div style={{width:10,height:10,borderRadius:2,background:p.color,flexShrink:0}}/>
            <div><span style={{color:t.textPrimary,fontWeight:600}}>{p.label}</span><span style={{color:dim,marginLeft:4}}>{p.desc}</span></div>
          </div>
        )}
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
function generatePDF({projectName,venue,chainSystem,totalHoists,hoistLines,addonItems,tx,theme,deliveryDate,showDate,returnDate,country,d8,userName,userEmail}){
    const doc=new jsPDF('p','mm','letter');
    const pw=215.9,ph=279.4,ml=18,mr=18,mb=14;let y=4;
    const maxY=ph-mb; // page bottom margin
    const ac=theme==="usa"?[237,0,0]:[237,0,0],sc2=theme==="usa"?[0,40,104]:[0,80,240];
    const newPageIfNeeded=(need)=>{if(y+need>maxY){doc.addPage();y=14;}};
    // Flag stripe
    [ac,[255,255,255],sc2,[255,255,255],ac].forEach((c,i)=>{doc.setFillColor(c[0],c[1],c[2]);doc.rect(pw/5*i,0,pw/5,4,'F');});
    y=14;doc.setFont('helvetica','bold');doc.setFontSize(22);doc.setTextColor(...ac);doc.text('WYP ASSIST',ml,y);
    y+=6;doc.setFontSize(9);doc.setTextColor(120,120,120);doc.text(tx.appSub.toUpperCase(),ml,y);
    y+=4;doc.setFontSize(16);doc.setTextColor(40,40,40);doc.text(tx.psPullSheet,ml,y+8);y+=14;
    // Info box — calculate height based on content
    const infoLines=[];
    if(projectName) infoLines.push(`${tx.psProject2}: ${projectName}`);
    if(venue) infoLines.push(`${tx.psVenue2}: ${venue}`);
    infoLines.push(`${tx.psChainSys2}: ${chainSystem}  |  ${tx.psTotalHoists}: ${totalHoists}`);
    if(deliveryDate) infoLines.push(`${tx.psDeliveryDate}: ${deliveryDate}`);
    if(showDate) infoLines.push(`${tx.psShowDate}: ${showDate}${returnDate?`  |  ${tx.psReturnDate}: ${returnDate}`:""}`);
    if(country) infoLines.push(`${tx.psCountry}: ${country}`);
    if(userName||userEmail) infoLines.push(`${userName||""}${userEmail?`  |  ${userEmail}`:""}`);
    const infoH=Math.max(22,infoLines.length*6+8);
    doc.setFillColor(245,245,245);doc.rect(ml,y,pw-ml-mr,infoH,'F');doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(80,80,80);let iy=y+7;
    infoLines.forEach(line=>{doc.text(line,ml+4,iy);iy+=6;});
    y+=infoH+6;
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(120,120,120);
    doc.text(`Date: ${new Date().toLocaleDateString()}`,pw-mr-40,y-infoH);
    // D8/D8+ Warning Banner
    if(d8){
      newPageIfNeeded(16);
      const bw=pw-ml-mr;
      // Outer border
      doc.setDrawColor(231,76,60);doc.setLineWidth(1.5);doc.rect(ml,y,bw,12);
      // Inner filled bar with padding
      doc.setFillColor(231,76,60);doc.rect(ml+2,y+2,bw-4,8,'F');
      // Warning text (strip unicode emoji — not supported by jsPDF helvetica)
      const d8Text=tx.psD8Warn.replace(/[^\x20-\x7E]/g,'').trim()||"D8/D8+ RATED SYSTEM REQUIRED";
      doc.setFontSize(12);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      doc.text("!! "+d8Text+" !!",ml+bw/2,y+8,{align:"center"});
      y+=16;
    }

    // Helper: draw a section table header
    const drawSectionHeader=(title,color)=>{
      newPageIfNeeded(24); // need room for title bar + header row + at least 1 data row
      doc.setFillColor(...color);doc.rect(ml,y,pw-ml-mr,7,'F');
      doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      doc.text(title,ml+3,y+5);y+=10;
      doc.setFillColor(235,235,235);doc.rect(ml,y,pw-ml-mr,6,'F');
      doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(100,100,100);
      doc.text('CAT. ID',ml+3,y+4);doc.text(tx.psItem.toUpperCase(),ml+32,y+4);doc.text(tx.psQty.toUpperCase(),pw-mr-12,y+4);y+=8;
    };
    // Helper: draw a data row
    const drawRow=(catId,name,qty,idx)=>{
      newPageIfNeeded(6);
      if(idx%2===0){doc.setFillColor(250,250,250);doc.rect(ml,y-3,pw-ml-mr,6,'F');}
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      doc.setTextColor(140,140,140);doc.text(catId,ml+3,y+1);
      doc.setTextColor(60,60,60);doc.text(name,ml+32,y+1);
      doc.setTextColor(...ac);doc.setFont('helvetica','bold');doc.text(String(qty),pw-mr-8,y+1);
      doc.setFont('helvetica','normal');y+=6;
    };

    // Per-type tables
    hoistLines.forEach(line=>{
      drawSectionHeader(`${line.ty} ${tx.psMotors}  (x${line.c})`,ac);
      line.items.forEach(({catId,name,qty},idx)=>drawRow(catId,name,qty,idx));
      y+=6;
    });

    // Add-ons
    const activeAddons=addonItems.filter(a=>a.qty>0);
    if(activeAddons.length>0){
      y+=2;
      drawSectionHeader(tx.psAddons.toUpperCase(),sc2);
      activeAddons.forEach(({catId,name,qty},idx)=>drawRow(catId,name,qty,idx));
    }

    // Grand totals
    y+=4;
    newPageIfNeeded(20);
    doc.setFillColor(...ac);doc.rect(ml,y,pw-ml-mr,8,'F');
    doc.setFontSize(11);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
    doc.text(tx.psGrandTotals,ml+3,y+6);y+=12;
    // Merge all items by catId
    const merged={};
    hoistLines.forEach(l=>l.items.forEach(({catId,name,qty})=>{merged[catId]=(merged[catId]||{name,qty:0});merged[catId].qty+=qty;}));
    activeAddons.forEach(({catId,name,qty})=>{merged[catId]=(merged[catId]||{name,qty:0});merged[catId].qty+=qty;});
    Object.entries(merged).filter(([,v])=>v.qty>0).forEach(([catId,{name,qty}],idx)=>drawRow(catId,name,qty,idx));
    // Total bar
    newPageIfNeeded(12);
    y+=2;doc.setFillColor(...ac);doc.rect(ml,y,pw-ml-mr,8,'F');doc.setFontSize(10);doc.setTextColor(255,255,255);
    doc.text(`${tx.psTotalChain} (${chainSystem})`,ml+3,y+6);doc.setFontSize(14);doc.text(String(totalHoists),pw-mr-14,y+6);
    // Footer on each page
    const pages=doc.getNumberOfPages();
    for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7);doc.setTextColor(160,160,160);doc.text(`${tx.footer1} | ${tx.footer2}`,ml,ph-6);}
    return doc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: POINT LOAD
// ═══════════════════════════════════════════════════════════════════════════════
const RIG_KEYS=["straight","curved","circular"];
function PointLoadTab(){
  const{s,t,tx}=useTheme();
  const[rig,setRig]=useState("straight");const[load,setLoad]=useState("");const[pts,setPts]=useState("");
  const[span,setSpan]=useState("");const[chord,setChord]=useState("");const[rad,setRad]=useState("");
  const[arc,setArc]=useState("");const[drop,setDrop]=useState("");const[unit,setUnit]=useState("imperial");
  // Beam loading state (straight rig only)
  const[loadMode,setLoadMode]=useState("even"); // "even" | "custom"
  const[hoistMode,setHoistMode]=useState("even"); // "even" | "custom"
  const[customLoads,setCustomLoads]=useState([]); // [{id,position,weight}]
  const[customHoists,setCustomHoists]=useState(""); // comma-separated positions string
  const[pointWeights,setPointWeights]=useState([]); // per-point weights for curved/circular custom mode
  const nextLoadId=useRef(1);
  const svgRef=useRef(null);

  const labels={straight:tx.straight,curved:tx.curved,circular:tx.circular};
  const uW=unit==="imperial"?"lbs":"kg",uD=unit==="imperial"?"ft":"m";

  // Custom load handlers
  const addLoad=(pos)=>{
    const w=parseFloat(load)||100;
    setCustomLoads(prev=>[...prev,{id:nextLoadId.current++,position:Math.round(pos*100)/100,weight:Math.round(w/Math.max(parseInt(pts)||1,1))}]);
  };
  const updateLoad=(id,field,val)=>{
    setCustomLoads(prev=>prev.map(l=>l.id===id?{...l,[field]:parseFloat(val)||0}:l));
  };
  const deleteLoad=(id)=>{
    setCustomLoads(prev=>prev.filter(l=>l.id!==id));
  };

  // Compute results — beam solver for straight, legacy for curved/circular
  const res=useMemo(()=>{
    const N=parseInt(pts);
    if(rig==="straight"){
      const S=parseFloat(span)||0;
      if(!N||N<1||S<=0)return null;
      // Hoist positions
      let hoistPos;
      if(hoistMode==="custom"&&customHoists.trim()){
        hoistPos=customHoists.split(",").map(v=>parseFloat(v.trim())).filter(v=>!isNaN(v)&&v>=0&&v<=S).sort((a,b)=>a-b);
        if(hoistPos.length<1)hoistPos=Array.from({length:N},(_,i)=>N===1?S/2:(S*i)/(N-1));
      }else{
        hoistPos=Array.from({length:N},(_,i)=>N===1?S/2:(S*i)/(N-1));
      }
      // Loads
      let beamLoads;
      if(loadMode==="custom"){
        beamLoads=customLoads.map(l=>({position:l.position,weight:l.weight}));
      }else{
        const W=parseFloat(load);if(!W)return null;
        // Approximate UDL with N*4 even loads
        const nPts=Math.max(N*4,8);
        beamLoads=generateEvenLoads(W,nPts,S);
      }
      if(beamLoads.length===0&&loadMode==="custom")beamLoads=[]; // allow empty for display
      const{reactions,moments,maxReaction}=solveBeamReactions(hoistPos,beamLoads);
      const totalLoad=beamLoads.reduce((s,l)=>s+l.weight,0);
      const avgLoad=hoistPos.length>0?totalLoad/hoistPos.length:0;
      const notes=[tx.plBeamAnalysis];
      return{pL:avgLoad.toFixed(1),dL:(maxReaction*5).toFixed(1),notes,det:{},
        beam:true,reactions,moments,maxReaction,hoistPositions:hoistPos,
        beamLoads,totalLoad,spanLength:S};
    }
    // Curved / circular
    if(!N||N<1)return null;const W=parseFloat(load);if(loadMode==="even"&&!W)return null;let pL,notes=[],det={};
    if(rig==="curved"){const a=(parseFloat(chord)||0)*Math.PI/180;const R=parseFloat(rad)||0;const arcLen=R>0&&a>0?R*a:0;const chordLen=R>0&&a>0?2*R*Math.sin(a/2):0;
      if(!arcLen||arcLen<=0)return null;
      const hoistPos=Array.from({length:N},(_,i)=>N===1?arcLen/2:(arcLen*i)/(N-1));
      let beamLoads;
      if(loadMode==="custom"){beamLoads=customLoads.map(l=>({position:l.position,weight:l.weight}));}
      else{if(!W)return null;const nPts=Math.max(N*4,8);beamLoads=generateEvenLoads(W,nPts,arcLen);}
      const{reactions,moments,maxReaction}=solveBeamReactions(hoistPos,beamLoads);
      const totalLoad=beamLoads.reduce((sm,l)=>sm+l.weight,0);
      det.arcLength=arcLen.toFixed(1)+" "+(unit==="imperial"?"ft":"m");det.chordLength=chordLen.toFixed(1)+" "+(unit==="imperial"?"ft":"m");
      notes.push(tx.plBeamAnalysis);
      return{pL:(maxReaction||0).toFixed(1),dL:((maxReaction||0)*5).toFixed(1),notes,det,beam:true,curved:true,reactions,moments,maxReaction:maxReaction||0,hoistPositions:hoistPos,beamLoads,totalLoad,spanLength:arcLen,pointLoads:reactions.map(r=>parseFloat(r.toFixed(1))),curvedDims:{radius:R,angleDeg:parseFloat(chord)||0,arcLen,chordLen}};}
    else if(rig==="circular"){const r=parseFloat(rad)||0,a=parseFloat(arc)||360;det.circumference=(a*Math.PI/180*r).toFixed(1);det.arcAngle=a;
      if(loadMode==="custom"){const pLoads=Array.from({length:N},(_,i)=>pointWeights[i]||0);const maxW=Math.max(...pLoads,0);notes.push(tx.curvedCustomNote||"Custom point weights — design to maximum point");return{pL:maxW.toFixed(1),dL:(maxW*5).toFixed(1),notes,det,beam:false,pointLoads:pLoads,customMode:true};}
      pL=W/N;if(a<360){det.endPointLoad=(pL*1.2).toFixed(1);notes.push(`${tx.openArc} (${a}°): ${tx.circularEndNote}`);}notes.push(tx.circularNote);}
    else{pL=W/N;notes.push(tx.straightNote);}
    return{pL:pL.toFixed(1),dL:(pL*5).toFixed(1),notes,det,beam:false};
  },[rig,load,pts,span,chord,rad,arc,drop,tx,loadMode,hoistMode,customLoads,customHoists,pointWeights,unit]);

  // Reaction color helper
  const rxColor=(r,max)=>{
    if(max<=0)return success;
    const ratio=Math.abs(r)/max;
    if(ratio<0.5)return success;if(ratio<0.8)return warning;return danger;
  };

  return(<div>
    <div data-r="card" style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>⚙</span> {tx.plTitle}</div>
      <Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/>
      <div style={s.secTitle}>{tx.plConfig}</div>
      <Field label={tx.plSystemType}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{RIG_KEYS.map(k=><button key={k} style={s.chip(rig===k)} onClick={()=>setRig(k)}>{labels[k]}</button>)}</div></Field>
      <div data-r="g3" style={s.g3}>
        {loadMode==="even"&&<Field label={`${tx.plTotalLoad} (${uW})`}><Inp value={load} onChange={setLoad} placeholder="0"/></Field>}
        <Field label={tx.plNumPoints}><Inp value={pts} onChange={setPts} placeholder="0" step="1"/></Field>
        {rig==="straight"&&<Field label={`${tx.plSpanLength} (${uD})`}><Inp value={span} onChange={setSpan} placeholder="0"/></Field>}
        {rig==="curved"&&<Field label={`${tx.plRadius} (${uD})`}><Inp value={rad} onChange={setRad} placeholder="0"/></Field>}
        {rig==="circular"&&<Field label={`${tx.plRadius} (${uD})`}><Inp value={rad} onChange={setRad} placeholder="0"/></Field>}
      </div>
      {rig==="curved"&&<Field label={`${tx.plChordAngle} (°)`} style={{marginTop:8}}><Inp value={chord} onChange={setChord} placeholder="0"/></Field>}
      {rig==="circular"&&<Field label={tx.plArcAngle} style={{marginTop:8}}><Inp value={arc} onChange={setArc} placeholder="360"/></Field>}

      {/* Curved: show computed arc length */}
      {rig==="curved"&&(parseFloat(rad)||0)>0&&(parseFloat(chord)||0)>0&&(
        <div style={{marginTop:8,padding:"6px 12px",background:t.surfaceLight,borderRadius:4,border:`1px solid ${t.border}`,fontSize:11,color:t.textSecondary}}>
          Arc Length: <span style={{color:t.accent,fontWeight:700}}>{((parseFloat(rad)||0)*((parseFloat(chord)||0)*Math.PI/180)).toFixed(1)} {uD}</span>
          {" · "}Chord: <span style={{color:t.accent,fontWeight:700}}>{(2*(parseFloat(rad)||0)*Math.sin(((parseFloat(chord)||0)*Math.PI/180)/2)).toFixed(1)} {uD}</span>
        </div>
      )}

      {/* Circular: loading mode toggle + per-point weights */}
      {rig==="circular"&&<>
        <div style={{marginTop:16}}>
          <Field label={tx.plLoadMode}><div style={{display:"flex",gap:8}}>
            <button style={s.chip(loadMode==="even")} onClick={()=>setLoadMode("even")}>{tx.plLoadEven}</button>
            <button style={s.chip(loadMode==="custom")} onClick={()=>setLoadMode("custom")}>{tx.plLoadCustom}</button>
          </div></Field>
        </div>
        {loadMode==="custom"&&(parseInt(pts)||0)>0&&(
          <div style={{marginTop:12}}>
            <div style={s.secTitle}>{tx.plLoadList||"Point Weights"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {Array.from({length:parseInt(pts)||0},(_,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"center",background:t.surfaceLight,padding:"4px 8px",borderRadius:4,border:`1px solid ${t.border}`}}>
                  <span style={{color:t.textSecondary,fontSize:10,minWidth:30,flexShrink:0}}>P{i+1}</span>
                  <input type="number" style={{...s.input,flex:1,margin:0,padding:"3px 6px"}} value={pointWeights[i]!=null?pointWeights[i]:""} onChange={e=>{const v=[...pointWeights];while(v.length<=i)v.push(0);v[i]=parseFloat(e.target.value)||0;setPointWeights(v);}} placeholder="0"/>
                  <span style={{color:t.textSecondary,fontSize:10,flexShrink:0}}>{uW}</span>
                </div>
              ))}
              <div style={{color:t.textSecondary,fontSize:11,marginTop:4,fontWeight:600}}>{tx.plTotalLoad}: {pointWeights.slice(0,parseInt(pts)||0).reduce((sm,w)=>sm+(w||0),0).toFixed(0)} {uW}</div>
            </div>
          </div>
        )}
      </>}

      {/* Straight & Curved: load mode + spacing toggles + position-based custom loads */}
      {(rig==="straight"||rig==="curved")&&<>
        <div style={{marginTop:16,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Field label={tx.plLoadMode}><div style={{display:"flex",gap:8}}>
            <button style={s.chip(loadMode==="even")} onClick={()=>setLoadMode("even")}>{tx.plLoadEven}</button>
            <button style={s.chip(loadMode==="custom")} onClick={()=>setLoadMode("custom")}>{tx.plLoadCustom}</button>
          </div></Field>
          {rig==="straight"&&<Field label={tx.plHoistSpacing}><div style={{display:"flex",gap:8}}>
            <button style={s.chip(hoistMode==="even")} onClick={()=>setHoistMode("even")}>{tx.plHoistEven}</button>
            <button style={s.chip(hoistMode==="custom")} onClick={()=>setHoistMode("custom")}>{tx.plHoistCustom}</button>
          </div></Field>}
        </div>
        {/* Custom point positions input (straight only) */}
        {rig==="straight"&&hoistMode==="custom"&&<Field label={`${tx.plHoistPositions} (${uD}) — comma separated`} style={{marginTop:8}}>
          <input style={s.input} type="text" value={customHoists} onChange={e=>setCustomHoists(e.target.value)} placeholder={`e.g. 0, 10, 20, 30`}/>
        </Field>}
        {/* Custom load list table */}
        {loadMode==="custom"&&customLoads.length>0&&(
          <div style={{marginTop:12}}>
            <div style={s.secTitle}>{tx.plLoadList}</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {customLoads.map(ld=>(
                <div key={ld.id} data-r="custom-load-row" style={{display:"flex",gap:8,alignItems:"center",background:t.surfaceLight,padding:"4px 8px",borderRadius:4,border:`1px solid ${t.border}`}}>
                  <span style={{color:t.textSecondary,fontSize:10,minWidth:50,flexShrink:0}}>{tx.plPosition} ({uD})</span>
                  <input type="number" style={{...s.input,width:80,minWidth:60,flex:"1 1 60px",margin:0,padding:"3px 6px"}} value={ld.position} onChange={e=>updateLoad(ld.id,"position",e.target.value)} step="0.1"/>
                  <span style={{color:t.textSecondary,fontSize:10,minWidth:40,flexShrink:0}}>{tx.plWeight} ({uW})</span>
                  <input type="number" style={{...s.input,width:80,minWidth:60,flex:"1 1 60px",margin:0,padding:"3px 6px"}} value={ld.weight} onChange={e=>updateLoad(ld.id,"weight",e.target.value)}/>
                  <button style={{...s.chip(false),color:danger,borderColor:danger,padding:"2px 8px",fontSize:11,cursor:"pointer",flexShrink:0}} onClick={()=>deleteLoad(ld.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Add load button for custom mode */}
        {loadMode==="custom"&&((rig==="straight"&&parseFloat(span)>0)||(rig==="curved"&&(parseFloat(rad)||0)>0&&(parseFloat(chord)||0)>0))&&(
          <button style={{...s.chip(false),marginTop:8,cursor:"pointer"}} onClick={()=>{const arcL=rig==="curved"?(parseFloat(rad)||0)*((parseFloat(chord)||0)*Math.PI/180):0;addLoad(rig==="curved"?arcL/2:parseFloat(span)/2);}}>+ {tx.plAddLoad}</button>
        )}
      </>}
    </div>

    {/* RESULTS */}
    {res&&(<div data-r="card" style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.plResults} — {labels[rig]}</div>

      {/* Diagram: curved beam → front-elevation PointLoadDiagram; straight beam → interactive; others → static */}
      {res.beam&&res.curved?(<div style={s.diagWrap}>
        <div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.plVisual}</div>
        <PointLoadDiagram rigType="curved" numPoints={pts} pointLoad={res.pL} unit={unit} pointLoads={res.pointLoads} curvedDims={res.curvedDims}/>
      </div>):res.beam?(<div style={s.diagWrap}>
        <div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.plVisual}</div>
        <InteractivePointLoadDiagram
          spanLength={res.spanLength} hoistPositions={res.hoistPositions}
          loads={loadMode==="custom"?customLoads:
            Array.from({length:parseInt(pts)||1},(_,i)=>{const N=parseInt(pts)||1;const S=res.spanLength;return{id:i,position:N===1?S/2:(S*i)/(N-1),weight:res.totalLoad/N};})}
          reactions={res.reactions} maxReaction={res.maxReaction}
          unit={unit} loadMode={loadMode}
          onAddLoad={addLoad} onUpdateLoad={updateLoad} onDeleteLoad={deleteLoad}
          svgRef={svgRef}/>
      </div>):(
        <div style={s.diagWrap}><div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.plVisual}</div><PointLoadDiagram rigType={rig} numPoints={pts} pointLoad={res.pL} unit={unit} pointLoads={res.pointLoads}/></div>
      )}

      {/* Reaction cards for beam loading */}
      {res.beam&&res.reactions&&res.reactions.length>0&&(<>
        <div style={{marginTop:20}}><div style={s.secTitle}>{tx.plReactions}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
            {res.reactions.map((r,i)=>{
              const isMax=res.maxReaction>0&&Math.abs(r-res.maxReaction)<0.01;
              const col=rxColor(r,res.maxReaction);
              return(<div key={i} style={{...s.res,position:"relative",border:`2px solid ${col}`,borderRadius:8,padding:"10px 14px",minWidth:90,textAlign:"center"}}>
                {isMax&&<div style={{position:"absolute",top:-8,right:-4,background:danger,color:"#fff",fontSize:8,fontWeight:900,padding:"1px 6px",borderRadius:4,letterSpacing:1}}>{tx.plMaxReaction}</div>}
                <div style={{fontSize:22,fontWeight:900,color:col}}>{r.toFixed(0)}</div>
                <div style={{fontSize:9,color:t.textSecondary,marginTop:2}}>R{i+1} ({uW})</div>
                <div style={{fontSize:8,color:t.textSecondary}}>{res.hoistPositions[i].toFixed(1)} {uD}</div>
              </div>);
            })}
          </div>
        </div>
        {/* Summary row */}
        <div data-r="g3" style={{...s.g3,marginTop:20}}>
          <div style={s.res}><div style={{...s.resVal,color:danger}}>{res.dL}</div><div style={s.resLbl}>{tx.plDesignLoad} (5:1 SF)</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{res.hoistPositions.length}</div><div style={s.resLbl}>{tx.plHoistPoints}</div></div>
          <div style={s.res}><div style={s.resVal}>{res.totalLoad.toFixed(0)}</div><div style={s.resLbl}>{tx.plTotalLoad} ({uW})</div></div>
        </div>
      </>)}

      {/* Cards for curved/circular */}
      {!res.beam&&(<>
        {res.customMode?(<div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>
          <div style={s.res}><div style={s.resVal}>{res.pL}</div><div style={s.resLbl}>{uW} {tx.plMaxReaction||"MAX"}</div></div>
          <div style={s.res}><div style={{...s.resVal,color:danger}}>{res.dL}</div><div style={s.resLbl}>{tx.plDesignLoad} (5:1 SF)</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{pts}</div><div style={s.resLbl}>{tx.plHoistPoints}</div></div>
          <div style={s.res}><div style={s.resVal}>{res.pointLoads?res.pointLoads.reduce((a,b)=>a+b,0).toFixed(0):0}</div><div style={s.resLbl}>{tx.plTotalLoad} ({uW})</div></div>
        </div>):res.pointLoads&&res.endLoad?(<div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>
          <div style={s.res}><div style={s.resVal}>{res.interiorLoad}</div><div style={s.resLbl}>{uW} {tx.plInterior}</div></div>
          <div style={s.res}><div style={s.resVal}>{res.endLoad}</div><div style={s.resLbl}>{uW} {tx.plEndPoint}</div></div>
          <div style={s.res}><div style={{...s.resVal,color:danger}}>{res.dL}</div><div style={s.resLbl}>{tx.plDesignLoad} (5:1 SF)</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{pts}</div><div style={s.resLbl}>{tx.plHoistPoints}</div></div>
        </div>):(<div data-r="g3" style={{...s.g3,marginTop:20}}>
          <div style={s.res}><div style={s.resVal}>{res.pL}</div><div style={s.resLbl}>{uW} {tx.plPerPoint}</div></div>
          <div style={s.res}><div style={{...s.resVal,color:danger}}>{res.dL}</div><div style={s.resLbl}>{tx.plDesignLoad} (5:1 SF)</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{pts}</div><div style={s.resLbl}>{tx.plHoistPoints}</div></div>
        </div>)}
        {Object.keys(res.det).length>0&&<div style={{marginTop:20}}><div style={s.secTitle}>{tx.plSystemDetails}</div><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{Object.entries(res.det).map(([k,v])=><div key={k} style={s.pill}><span style={{color:t.textSecondary,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{k.replace(/([A-Z])/g,' $1')}: </span><span style={{color:t.accent,fontWeight:700}}>{v}</span></div>)}</div></div>}
      </>)}

      {res.notes.length>0&&<div style={{marginTop:20}}><div style={s.secTitle}>{tx.plNotes}</div>{res.notes.map((n,i)=><div key={i} style={s.note}>{n}</div>)}</div>}

      {/* Results disclaimer */}
      <div style={{marginTop:24,padding:"14px 18px",background:`${danger}08`,border:`1px solid ${danger}25`,borderRadius:6}}>
        <div style={{fontSize:11,fontWeight:700,color:danger,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{tx.resultDiscTitle}</div>
        <div style={{fontSize:10,color:t.textSecondary,lineHeight:1.7}}>{tx.resultDiscBody}</div>
      </div>
    </div>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: PULL SHEET (with catalog IDs and add-ons)
// ═══════════════════════════════════════════════════════════════════════════════
function PullSheetTab(){
  const{s,t,tx,lang,sharedMotors,setSharedMotors}=useTheme();
  const[cs,setCs]=useState("60'");
  const[m,setM]=useState(()=>sharedMotors||{".25 Ton":0,".5 Ton":0,"1 Ton":0,"2 Ton":0});
  const[pn,setPn]=useState("");const[vn,setVn]=useState("");
  // New fields
  const[deliveryDate,setDeliveryDate]=useState("");
  const[showDate,setShowDate]=useState("");
  const[returnDate,setReturnDate]=useState("");
  const[country,setCountry]=useState("N & S America");
  const[d8,setD8]=useState(false);
  const[userName,setUserName]=useState("");
  const[userEmail,setUserEmail]=useState("");
  const[sendStatus,setSendStatus]=useState(null); // null | "sending" | "sent" | "error"
  // Accept pushed motor counts from Markout tab (handles re-push while already on tab)
  const lastPush=useRef(sharedMotors);
  useEffect(()=>{
    if(sharedMotors&&sharedMotors!==lastPush.current){lastPush.current=sharedMotors;setM(sharedMotors);}
    if(sharedMotors)setSharedMotors(null);
  },[sharedMotors]);
  // Addon state: { catId: qty }
  const initAddons={};ADDON_GROUPS.forEach(g=>g.items.forEach(it=>{initAddons[it.id]=0;}));
  const[addons,setAddons]=useState(initAddons);
  const setAddon=(id,v)=>setAddons(p=>({...p,[id]:Math.max(0,v)}));
  const mc=(ty,d)=>setM(p=>({...p,[ty]:Math.max(0,p[ty]+d)}));
  const tot=Object.values(m).reduce((a,b)=>a+b,0);

  const hoistLines=useMemo(()=>{
    const lines=[];
    MOTOR_TYPES.forEach(ty=>{const c=m[ty];if(!c)return;const items=calcHoistGear(ty,c);lines.push({ty,c,items});});
    return lines;
  },[m]);

  const addonItems=useMemo(()=>{
    return Object.entries(addons).filter(([,q])=>q>0).map(([catId,qty])=>({catId,name:CAT[catId]?.name||catId,qty}));
  },[addons]);

  const hasData=tot>0||addonItems.length>0;

  // Grand totals merged
  const grandTotals=useMemo(()=>{
    const merged={};
    hoistLines.forEach(l=>l.items.forEach(({catId,name,qty})=>{
      if(!merged[catId]) merged[catId]={name,qty:0};merged[catId].qty+=qty;
    }));
    addonItems.forEach(({catId,name,qty})=>{
      if(!merged[catId]) merged[catId]={name,qty:0};merged[catId].qty+=qty;
    });
    return Object.entries(merged).filter(([,v])=>v.qty>0);
  },[hoistLines,addonItems]);

  const pdfParams=()=>({projectName:pn,venue:vn,chainSystem:cs,totalHoists:tot,hoistLines,addonItems,tx,theme:lang,deliveryDate,showDate,returnDate,country,d8,userName,userEmail});

  const handleExport=()=>{if(!hasData)return;const doc=generatePDF(pdfParams());doc.save(`WYP_PullSheet_${pn||'export'}.pdf`);};

  // Email validation
  const isValidEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const canSend=hasData&&showDate&&userName.trim()&&isValidEmail(userEmail);

  const handleSendQuote=async()=>{
    if(!canSend)return;
    setSendStatus("sending");
    try{
      const doc=generatePDF(pdfParams());
      const pdfBase64=doc.output("datauristring").split(",")[1];
      const hdrs=await authHeaders();
      const resp=await fetch("/api/send-quote",{
        method:"POST",
        headers:hdrs,
        body:JSON.stringify({
          from_name:userName,
          from_email:userEmail,
          project_name:pn||"Untitled",
          venue:vn||"—",
          delivery_date:deliveryDate||"N/A",
          show_date:showDate,
          return_date:returnDate||"N/A",
          country:country,
          d8_status:d8?tx.psD8Warn:"Standard",
          total_hoists:String(tot),
          chain_system:cs,
          pdf_base64:pdfBase64,
        }),
      });
      if(!resp.ok){const e=await resp.json();throw new Error(e.error||"Send failed");}
      setSendStatus("sent");
      setTimeout(()=>setSendStatus(null),4000);
    }catch(err){
      console.error("Send quote error:",err);
      setSendStatus("error");
      setTimeout(()=>setSendStatus(null),5000);
    }
  };

  const sendBtnLabel=sendStatus==="sending"?tx.psSending:sendStatus==="sent"?tx.psSent:sendStatus==="error"?tx.psSendFail:tx.psSendQuote;
  const sendBtnColor=sendStatus==="sent"?success:sendStatus==="error"?danger:t.secondary;

  return(<div>
    <div data-r="card" style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:18}}>📋</span> {tx.psTitle}</div>
      <div data-r="g2" style={s.g2}>
        <Field label={tx.psProject}><Inp type="text" value={pn} onChange={setPn} placeholder="..."/></Field>
        <Field label={tx.psVenue}><Inp type="text" value={vn} onChange={setVn} placeholder="..."/></Field>
      </div>

      {/* Delivery Date / Show Date / Return Date / Country */}
      <div data-r="g4" style={{...s.g4,marginTop:16}}>
        <Field label={tx.psDeliveryDate}>
          <input type="date" style={s.input} value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)}/>
        </Field>
        <Field label={<>{tx.psShowDate} <span style={{color:danger,fontSize:10}}>*</span></>}>
          <input type="date" style={s.input} value={showDate} onChange={e=>setShowDate(e.target.value)}/>
        </Field>
        <Field label={tx.psReturnDate}>
          <input type="date" style={s.input} value={returnDate} onChange={e=>setReturnDate(e.target.value)}/>
        </Field>
        <Field label={tx.psCountry}>
          <select style={s.input} value={country} onChange={e=>setCountry(e.target.value)}>
            {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* Motor Counts */}
      <div style={s.secTitle}>{tx.psMotorCounts}</div>
      <div data-r="g4" style={s.g4}>
        {MOTOR_TYPES.map(ty=>{const isH=parseFloat(ty)>1;return(
          <div key={ty} style={s.mCard}>
            <div style={{fontSize:13,fontWeight:700,color:t.accent,marginBottom:4}}>{ty}</div>
            <div style={{fontSize:9,color:t.textSecondary,marginBottom:12}}>{isH?'3/4" · 1/2"':'5/8" · 3/8"'}</div>
            <div style={s.ctr}><button style={s.ctrBtn} onClick={()=>mc(ty,-1)}>−</button><input type="number" min="0" style={s.ctrVal} value={m[ty]} onChange={e=>{const v=parseInt(e.target.value);setM(p=>({...p,[ty]:isNaN(v)?0:Math.max(0,v)}));}} onFocus={e=>e.target.select()}/><button style={s.ctrBtn} onClick={()=>mc(ty,1)}>+</button></div>
          </div>);})}
      </div>
      <div style={{marginTop:12,textAlign:"center",background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:"12px 20px",display:"inline-flex",alignItems:"baseline",gap:6,justifyContent:"center",width:"100%",boxSizing:"border-box"}}>
        <span style={{fontSize:12,color:t.textSecondary,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{tx.psTotalHoists}:</span>
        <span style={{fontSize:26,fontWeight:900,color:t.accent,lineHeight:1}}>{tot}</span>
        <span style={{fontSize:11,color:t.textSecondary}}>{tx.psOnSystem} {cs} {tx.psSystem}</span>
      </div>

      {/* Chain System */}
      <div style={s.secTitle}>{tx.psChainSystem}</div>
      <Field label={tx.psSystemType}><Chips options={CHAIN_SYSTEMS} value={cs} onChange={setCs}/></Field>

      {/* D8 / D8+ Toggle */}
      <div style={{marginTop:20,marginBottom:8}}>
        <button style={{...s.chip(d8),background:d8?`${danger}25`:s.chip(false).background,color:d8?danger:t.textSecondary,border:d8?`2px solid ${danger}`:`1px solid ${t.border}`,fontWeight:d8?900:500,fontSize:12,padding:"10px 20px",letterSpacing:1.5}} onClick={()=>setD8(!d8)}>
          {d8?"⚠ ":"🔒 "}{tx.psD8}
        </button>
      </div>
      {d8&&<div style={{background:`${danger}18`,border:`2px solid ${danger}`,borderRadius:6,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>⚠</span>
        <span style={{color:danger,fontWeight:900,fontSize:13,letterSpacing:1.5,textTransform:"uppercase"}}>{tx.psD8Warn}</span>
      </div>}
    </div>

    {/* ── ADD-ONS SECTION ── */}
    <div data-r="card" style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:16}}>+</span> {tx.psAddons}</div>
      <div style={{fontSize:11,color:t.textSecondary,marginBottom:16}}>{tx.psAddonSub}</div>
      {ADDON_GROUPS.map(g=>(
        <div key={g.key} style={s.addonGroup}>
          <div style={s.addonTitle}>{lang==="usa"?g.titleEN:g.titleES}</div>
          {g.items.map(it=>(
            <div key={it.id} style={s.addonRow}>
              <span style={s.addonId}>{it.id}</span>
              <span style={s.addonLabel}>{CAT[it.id]?.name||it.label}</span>
              <MiniCounter value={addons[it.id]||0} onChange={v=>setAddon(it.id,v)}/>
            </div>
          ))}
        </div>
      ))}
    </div>

    {/* ── NAME / EMAIL / EXPORT / SEND ── */}
    <div data-r="card" style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:16}}>📧</span> {tx.psSendQuote}</div>
      <div data-r="g2" style={s.g2}>
        <Field label={<>{tx.psName} <span style={{color:danger,fontSize:10}}>*</span></>}><Inp type="text" value={userName} onChange={setUserName} placeholder="..."/></Field>
        <Field label={<>{tx.psEmail} <span style={{color:danger,fontSize:10}}>*</span></>}><Inp type="email" value={userEmail} onChange={setUserEmail} placeholder="name@example.com"/></Field>
      </div>
      <div data-r="export-row" style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap",alignItems:"center"}}>
        <button style={s.exportBtn} onClick={handleExport} disabled={!hasData}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {tx.psExportPDF}
        </button>
        <button style={{...s.exportBtn,background:sendBtnColor,borderColor:sendBtnColor,opacity:canSend||sendStatus?1:0.4,cursor:canSend?"pointer":"not-allowed",boxShadow:`0 3px 12px ${sendBtnColor}40,inset 0 1px 0 rgba(255,255,255,0.2)`}} onClick={handleSendQuote} disabled={!canSend||sendStatus==="sending"}>
          <span>{sendStatus==="sending"?"⏳":sendStatus==="sent"?"✓":sendStatus==="error"?"✗":"📧"}</span>
          {sendBtnLabel}
        </button>
        {!canSend&&hasData&&<span style={{fontSize:10,color:t.textSecondary,letterSpacing:1}}>
          {!showDate&&`${tx.psShowDate} ${tx.psRequired}. `}
          {!userName.trim()&&`${tx.psName} ${tx.psRequired}. `}
          {(!userEmail||!isValidEmail(userEmail))&&`${tx.psEmail} ${tx.psRequired}.`}
        </span>}
      </div>
    </div>

    {/* ── PULL SHEET OUTPUT ── */}
    {hasData?(
      <div data-r="card" style={s.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <div style={{...s.cardTitle,marginBottom:0,paddingBottom:0,borderBottom:"none"}}><span>◆</span> {tx.psPullSheet}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {pn&&<span style={s.badge(t.accent)}>{pn}</span>}
          </div>
        </div>
        {/* Info summary */}
        <div style={{marginBottom:20,padding:12,background:t.surfaceLight,borderRadius:4}}>
          {pn&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psProject2}:</span> {pn}</div>}
          {vn&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psVenue2}:</span> {vn}</div>}
          <div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psChainSys2}:</span> {cs}</div>
          {deliveryDate&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psDeliveryDate}:</span> {deliveryDate}</div>}
          {showDate&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psShowDate}:</span> {showDate}{returnDate&&<> <span style={{color:t.textSecondary,marginLeft:12}}>{tx.psReturnDate}:</span> {returnDate}</>}</div>}
          <div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psCountry}:</span> {country}</div>
        </div>

        {/* D8 Warning Banner */}
        {d8&&<div style={{background:`${danger}18`,border:`2px solid ${danger}`,borderRadius:6,padding:"12px 16px",marginBottom:20,textAlign:"center"}}>
          <span style={{color:danger,fontWeight:900,fontSize:15,letterSpacing:2,textTransform:"uppercase"}}>⚠ {tx.psD8Warn}</span>
        </div>}

        {/* Per-motor breakdowns */}
        {hoistLines.length>0&&<><div style={s.secTitle}>{tx.psBreakdown}</div>
        {hoistLines.map(l=>(
          <div key={l.ty} style={s.bCard}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,fontWeight:700,color:t.accent}}>{l.ty} {tx.psMotors}</span>
              <span style={s.badge(success)}>× {l.c}</span>
            </div>
            <div data-r="tbl-wrap" style={{overflowX:"auto"}}><table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
              <tbody>{l.items.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table></div>
          </div>
        ))}</>}

        {/* Add-on items */}
        {addonItems.length>0&&<>
          <div style={s.secTitle}>{tx.psAddons}</div>
          <div style={s.bCard}>
            <div data-r="tbl-wrap" style={{overflowX:"auto"}}><table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
              <tbody>{addonItems.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table></div>
          </div>
        </>}

        {/* Grand totals */}
        <div style={s.secTitle}>{tx.psGrandTotals}</div>
        <div style={s.gtWrap}><div data-r="tbl-wrap" style={{overflowX:"auto"}}>
          <table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
            <tbody>
              {grandTotals.map(([catId,{name,qty}],i)=><tr key={i}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}
              {tot>0&&<tr style={{background:`${t.accent}10`}}><td style={{...s.td,fontWeight:700,color:t.accent}} colSpan={2}>{tx.psTotalChain} ({cs})</td><td style={{...s.tdA,fontSize:18}}>{tot}</td></tr>}
            </tbody></table>
        </div></div>
      </div>
    ):(
      <div style={{...s.card,...s.empty}}><div style={{fontSize:48,marginBottom:12,opacity:.3}}>⛓</div><div style={{fontSize:14}}>{tx.psEmpty}</div></div>
    )}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: BRIDLE
// ═══════════════════════════════════════════════════════════════════════════════
function BridleTab(){
  const{s,t,tx}=useTheme();
  const bOpts=[{k:"2",l:tx.twoLeg},{k:"3",l:tx.threeLeg},{k:"4",l:tx.arena}];
  const[bt,setBt]=useState("2");const[unit,setUnit]=useState("imperial");
  const[bs,setBs]=useState("");const[lw,setLw]=useState("");
  const[dA,setDA]=useState("");const[hr,setHr]=useState("");
  const[ht,setHt]=useState(".5 Ton");const[tlo,setTlo]=useState("");
  const dL=unit==="imperial"?"ft":"m",wL=unit==="imperial"?"lbs":"kg";
  const MOTOR_CAPS={".25 Ton":500,".5 Ton":1000,"1 Ton":2000,"2 Ton":4000};
  // Asymmetric bridle calculation
  const res=useMemo(()=>{
    const D=parseFloat(bs),W=parseFloat(lw),A=parseFloat(dA),H=parseFloat(hr);
    if(!D||!W||!H)return null;if(A===undefined||isNaN(A)||A<0)return null;
    if(A>D)return{err:"Distance from Beam A cannot exceed beam spacing."};
    const n=bt==="2"?2:bt==="3"?3:4;
    if(bt==="4"){
      // Arena: symmetric, A = half beam spacing
      const hs=D/2;const ll=Math.sqrt(hs*hs+H*H),ia=2*Math.atan2(hs,H)*180/Math.PI;
      const lpl=(W/4)*(ll/H),hf=(W/4)*(hs/H);
      return{ll:ll.toFixed(2),llA:ll.toFixed(2),llB:ll.toFixed(2),ia:ia.toFixed(1),ah:H.toFixed(2),lpl:lpl.toFixed(1),lplA:lpl.toFixed(1),lplB:lpl.toFixed(1),hf:hf.toFixed(1),n:4,W,maxLpl:lpl,sw:ia>120,symmetric:true,llARaw:ll,llBRaw:ll};
    }
    // 2-leg or 3-leg: asymmetric
    const hsA=A,hsB=D-A;
    const llA=Math.sqrt(hsA*hsA+H*H),llB=Math.sqrt(hsB*hsB+H*H);
    const thetaA=Math.atan2(hsA,H),thetaB=Math.atan2(hsB,H);
    const ia=(thetaA+thetaB)*180/Math.PI;
    // Per-leg tension (moment balance about each beam)
    const vA=W*(D-A)/D, vB=W*A/D;// vertical component at each beam
    const tA=vA*(llA/H), tB=vB*(llB/H);// tension = V / cos(theta) = V * L/H
    const hf=W*A*(D-A)/(D*H);// horizontal force (equal both sides)
    const maxLpl=Math.max(tA,tB);
    const base={llA:llA.toFixed(2),llB:llB.toFixed(2),ll:Math.max(llA,llB).toFixed(2),ia:ia.toFixed(1),ah:H.toFixed(2),lplA:tA.toFixed(1),lplB:tB.toFixed(1),lpl:maxLpl.toFixed(1),hf:hf.toFixed(1),n,W,maxLpl,sw:ia>120,symmetric:Math.abs(hsA-hsB)<0.01,llARaw:llA,llBRaw:llB,hsA,hsB};
    if(bt==="3"){const o=parseFloat(tlo)||A;base.tll=Math.sqrt(o*o+H*H).toFixed(2);base.tllRaw=Math.sqrt(o*o+H*H);}
    return base;
  },[bt,bs,lw,dA,hr,tlo,tx]);
  // Auto-select hoist based on max per-leg load
  // Auto-select hoist based on pick point weight (total load W), not per-leg tension
  const autoHoist=useMemo(()=>{
    if(!res||res.err)return null;
    const pickLbs=unit==="imperial"?res.W:res.W*2.205;
    const sorted=MOTOR_TYPES.map(m=>({type:m,cap:MOTOR_CAPS[m]})).sort((a,b)=>a.cap-b.cap);
    let selected=sorted[sorted.length-1];
    for(const m of sorted){if(m.cap>=pickLbs){selected=m;break;}}
    const pct=(pickLbs/selected.cap)*100;
    return{type:selected.type,cap:selected.cap,pct:pct.toFixed(0),pickLbs:pickLbs.toFixed(0),over80:pct>80,overCap:pct>100};
  },[res,unit]);
  useEffect(()=>{if(autoHoist)setHt(autoHoist.type);},[autoHoist?.type]);
  // Steel piece breakdown per leg + combined gear list
  const isHeavy=parseFloat(ht)>1;
  const legGear=useMemo(()=>{
    if(!res||res.err)return null;
    const gA=calcBridleLegGear(res.llARaw,isHeavy);
    const gB=calcBridleLegGear(res.llBRaw,isHeavy);
    const gC=res.tllRaw?calcBridleLegGear(res.tllRaw,isHeavy):null;
    // Combine all items into a totals map
    const totals={};const addItem=(it,mult)=>{const k=it.catId;if(!totals[k])totals[k]={catId:it.catId,name:it.name,qty:0};totals[k].qty+=it.qty*mult;};
    const legCount=res.n===4?4:1;// arena: 4 identical legs
    if(res.n===4){gA.items.forEach(it=>addItem(it,4));}
    else{gA.items.forEach(it=>addItem(it,1));gB.items.forEach(it=>addItem(it,1));if(gC)gC.items.forEach(it=>addItem(it,1));}
    return{legA:gA,legB:gB,legC:gC,totals:Object.values(totals)};
  },[res,isHeavy]);
  return(<div>
    <div data-r="card" style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>△</span> {tx.brTitle}</div>
      <Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/>
      <div style={s.secTitle}>{tx.brType}</div>
      <Field label={tx.brConfig}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{bOpts.map(b=><button key={b.k} style={s.chip(bt===b.k)} onClick={()=>setBt(b.k)}>{b.l}</button>)}</div></Field>
      <div style={s.secTitle}>{tx.brDimensions}</div>
      <div data-r="g2" style={s.g2}>
        <Field label={`${tx.brBeamSpacing} (${dL})`}><Inp value={bs} onChange={setBs} placeholder="0"/></Field>
        <Field label={`${tx.brLoadWeight} (${wL})`}><Inp value={lw} onChange={setLw} placeholder="0"/></Field>
        {bt!=="4"&&<Field label={`${tx.brDistFromA} (${dL})`}><Inp value={dA} onChange={setDA} placeholder="0"/></Field>}
        <Field label={`${tx.brHeadroom} (${dL})`}><Inp value={hr} onChange={setHr} placeholder="0"/></Field>
      </div>
      {bt==="3"&&<Field label={`${tx.brThirdLeg} (${dL})`}><Inp value={tlo} onChange={setTlo} placeholder={tx.sameSpreahalf}/></Field>}
      <div style={{...s.secTitle,marginTop:24}}>{tx.brHoistType}</div>
      <Field label={tx.brMotorRating}><Chips options={MOTOR_TYPES} value={ht} onChange={setHt}/></Field>
      {autoHoist&&<div style={{marginTop:8,padding:"10px 14px",background:autoHoist.overCap?`${danger}15`:autoHoist.over80?`${warning}12`:`${success}10`,border:`1px solid ${autoHoist.overCap?danger:autoHoist.over80?warning:success}40`,borderRadius:6,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:14}}>{autoHoist.overCap?"⛔":autoHoist.over80?"⚠":"✓"}</span>
        <div style={{fontSize:11,lineHeight:1.5}}>
          <span style={{fontWeight:700,color:autoHoist.overCap?danger:autoHoist.over80?warning:success}}>{tx.brAutoHoist}: {autoHoist.type}</span>
          <span style={{color:t.textSecondary,marginLeft:8}}>{autoHoist.pickLbs} lbs pick point = {autoHoist.pct}% of {autoHoist.cap} lbs capacity</span>
          {autoHoist.overCap&&<div style={{color:danger,fontWeight:700,marginTop:2}}>EXCEEDS MOTOR CAPACITY — Select a larger hoist</div>}
          {autoHoist.over80&&!autoHoist.overCap&&<div style={{color:warning,fontWeight:600,marginTop:2}}>CAUTION: Exceeds 80% rated capacity</div>}
        </div>
      </div>}
    </div>
    {res&&!res.err&&(<>
      <div data-r="card" style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.brResults} — {bOpts.find(b=>b.k===bt)?.l}</div>
        {res.sw&&<div style={s.warnBox(danger)}><span style={{fontSize:20}}>⚠</span><div><div style={{color:danger,fontWeight:700,fontSize:13}}>{tx.brAngleWarn}</div><div style={{color:t.textSecondary,fontSize:12}}>{tx.brAngleWarnText}</div></div></div>}
        <div style={s.diagWrap}><div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.brVisual}</div><BridleDiagram bridleType={bt} result={res} unit={unit}/></div>
        {/* Asymmetric leg results */}
        {!res.symmetric&&bt!=="4"?(<>
          <div data-r="g2" style={{...s.g2,marginTop:20}}>
            <div style={{...s.res,border:`2px solid ${t.accent}40`}}><div style={{fontSize:9,color:t.textSecondary,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{tx.brLegA}</div><div style={s.resVal}>{res.llA} <span style={{fontSize:11}}>{dL}</span></div><div style={s.resLbl}>{res.lplA} {wL}</div></div>
            <div style={{...s.res,border:`2px solid ${t.accent}40`}}><div style={{fontSize:9,color:t.textSecondary,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{tx.brLegB}</div><div style={s.resVal}>{res.llB} <span style={{fontSize:11}}>{dL}</span></div><div style={s.resLbl}>{res.lplB} {wL}</div></div>
          </div>
        </>):(<div data-r="g3" style={{...s.g3,marginTop:20}}>
          <div style={s.res}><div style={s.resVal}>{res.ll}</div><div style={s.resLbl}>{tx.brLegLength} ({dL})</div></div>
          <div style={s.res}><div style={s.resVal}>{res.lpl}</div><div style={s.resLbl}>{wL} {tx.brPerLeg}</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{res.n}</div><div style={s.resLbl}>{tx.brLegs}</div></div>
        </div>)}
        <div data-r="g3" style={{...s.g3,marginTop:12}}>
          <div style={s.res}><div style={{...s.resVal,color:res.sw?danger:success}}>{res.ia}°</div><div style={s.resLbl}>{tx.brIncAngle}</div></div>
          <div style={s.res}><div style={s.resVal}>{res.ah}</div><div style={s.resLbl}>{tx.brApexHeight} ({dL})</div></div>
          <div style={s.res}><div style={{...s.resVal,color:warning}}>{res.hf}</div><div style={s.resLbl}>{tx.brHorizForce} ({wL})</div></div>
        </div>
        {res.tll&&<div style={{...s.res,marginTop:12,display:"inline-block"}}><div style={s.resVal}>{res.tll}</div><div style={s.resLbl}>{tx.brThirdLegLen} ({dL})</div></div>}
        {/* Steel piece breakdown per leg */}
        {legGear&&!res.symmetric&&bt!=="4"&&(<div style={{marginTop:20}}>
          <div style={s.secTitle}>{tx.brSteelPieces}</div>
          <div data-r="g2" style={s.g2}>
            {[{label:tx.brLegA,gear:legGear.legA,len:res.llA},{label:tx.brLegB,gear:legGear.legB,len:res.llB}].map((leg,i)=>(
              <div key={i} style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:12}}>
                <div style={{fontSize:10,fontWeight:700,color:t.accent,letterSpacing:1,marginBottom:6}}>{leg.label} — {leg.len} {dL}</div>
                <div style={{fontSize:10,color:t.textSecondary,lineHeight:1.8}}>
                  <div style={{color:"#AAA"}}>Beam: Steel 5' + Burlap + Shackle</div>
                  {leg.gear.steelPieces.steels.map((st,j)=><div key={j}>{st.qty}x Steel {st.len}' cable</div>)}
                  {leg.gear.steelPieces.chains>0&&<div>{leg.gear.steelPieces.chains}x S.T.A.C. Chain 3'</div>}
                  {leg.gear.steelPieces.links>0&&<div>{leg.gear.steelPieces.links}x Chain link (4")</div>}
                  <div style={{color:"#AAA",marginTop:4}}>Apex: Shackle + Pear Ring</div>
                </div>
              </div>
            ))}
          </div>
        </div>)}
        {legGear&&(res.symmetric||bt==="4")&&(<div style={{marginTop:20}}>
          <div style={s.secTitle}>{tx.brSteelPieces} (per leg)</div>
          <div style={{background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,padding:12}}>
            <div style={{fontSize:10,color:t.textSecondary,lineHeight:1.8}}>
              <div style={{color:"#AAA"}}>Beam: Steel 5' + Burlap + Shackle</div>
              {legGear.legA.steelPieces.steels.map((st,j)=><div key={j}>{st.qty}x Steel {st.len}' cable</div>)}
              {legGear.legA.steelPieces.chains>0&&<div>{legGear.legA.steelPieces.chains}x S.T.A.C. Chain 3'</div>}
              {legGear.legA.steelPieces.links>0&&<div>{legGear.legA.steelPieces.links}x Chain link (4")</div>}
              <div style={{color:"#AAA",marginTop:4}}>Apex: Shackle + Pear Ring</div>
            </div>
          </div>
        </div>)}
        <div style={{marginTop:24}}><div style={s.secTitle}>{tx.brNotes}</div><div style={s.note}>{tx.brNote1}</div><div style={s.note}>{tx.brNote2}</div>{bt==="4"&&<div style={s.note}>{tx.brNote3}</div>}</div>
        <div style={{marginTop:24,padding:"14px 18px",background:`${danger}08`,border:`1px solid ${danger}25`,borderRadius:6}}>
          <div style={{fontSize:11,fontWeight:700,color:danger,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{tx.resultDiscTitle}</div>
          <div style={{fontSize:10,color:t.textSecondary,lineHeight:1.7}}>{tx.resultDiscBody}</div>
        </div>
      </div>
      {/* Combined gear list */}
      {legGear&&(
        <div data-r="card" style={s.card}><div style={s.cardTitle}><span>⛓</span> {tx.brGearList} — {ht}</div>
          <div data-r="tbl-wrap" style={{overflowX:"auto"}}><table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
            <tbody>{legGear.totals.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </>)}
    {res?.err&&<div style={{...s.card,border:`1px solid ${danger}40`}}><div style={{color:danger,fontWeight:700}}>⚠ {res.err}</div></div>}
    {!res&&<div style={{...s.card,...s.empty}}><div style={{fontSize:48,marginBottom:12,opacity:.3}}>△</div><div style={{fontSize:14}}>{tx.brEmpty}</div></div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: MARKOUT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function MarkoutVisualizer({points,unit,theme,tx}){
  if(!points.length) return null;
  const pad=60, labelPad=30;
  const getX=p=>unit==="imperial"?p.xft:p.xm;
  const getY=p=>unit==="imperial"?p.yft:p.ym;
  const uL=unit==="imperial"?"ft":"m";
  const xs=points.map(getX), ys=points.map(getY);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const rangeX=maxX-minX||1, rangeY=maxY-minY||1;
  // Grid step: 10ft or 5m
  const step=unit==="imperial"?10:5;
  const gridMinX=Math.floor(minX/step)*step, gridMaxX=Math.ceil(maxX/step)*step;
  const gridMinY=Math.floor(minY/step)*step, gridMaxY=Math.ceil(maxY/step)*step;
  const plotW=600, ar=rangeY/rangeX, plotH=Math.max(300,Math.min(800,plotW*ar));
  const svgW=plotW+pad*2+labelPad, svgH=plotH+pad*2+labelPad;
  const sx=v=>(pad+labelPad)+((v-minX)/rangeX)*plotW;
  const sy=v=>(pad)+(1-(v-minY)/rangeY)*plotH;
  // Stage outline
  const stagePoints=points.filter(p=>p.type==="Stage");
  // Unique types for legend (no Stage)
  const types=[...new Set(points.filter(p=>p.type!=="Stage").map(p=>p.type))];
  return(
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{width:"100%",height:"auto",background:theme.surface,borderRadius:6,border:`1px solid ${theme.border}`}}>
      {/* Grid lines */}
      {Array.from({length:Math.round((gridMaxX-gridMinX)/step)+1},(_,i)=>{
        const v=gridMinX+i*step; const px=sx(v);
        return px>=(pad+labelPad)&&px<=(pad+labelPad+plotW)?<line key={`gx${i}`} x1={px} y1={pad} x2={px} y2={pad+plotH} stroke={theme.border} strokeWidth={0.5} strokeDasharray={v===0?"":"3,3"}/>:null;
      })}
      {Array.from({length:Math.round((gridMaxY-gridMinY)/step)+1},(_,i)=>{
        const v=gridMinY+i*step; const py=sy(v);
        return py>=pad&&py<=pad+plotH?<line key={`gy${i}`} x1={pad+labelPad} y1={py} x2={pad+labelPad+plotW} y2={py} stroke={theme.border} strokeWidth={0.5} strokeDasharray={v===0?"":"3,3"}/>:null;
      })}
      {/* CENTER LINES — bold at 0 */}
      {minX<=0&&maxX>=0&&<line x1={sx(0)} y1={pad-8} x2={sx(0)} y2={pad+plotH+8} stroke={theme.accent} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.7}/>}
      {minY<=0&&maxY>=0&&<line x1={pad+labelPad-8} y1={sy(0)} x2={pad+labelPad+plotW+8} y2={sy(0)} stroke={theme.accent} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.7}/>}
      {/* CL labels */}
      {minX<=0&&maxX>=0&&<text x={sx(0)} y={pad-12} fill={theme.accent} fontSize={8} textAnchor="middle" fontWeight={700} fontFamily="inherit">{tx.moCL}</text>}
      {minY<=0&&maxY>=0&&<text x={pad+labelPad-14} y={sy(0)+3} fill={theme.accent} fontSize={8} textAnchor="middle" fontWeight={700} fontFamily="inherit">{tx.moCL}</text>}
      {/* Axis tick labels */}
      {Array.from({length:Math.round((gridMaxX-gridMinX)/step)+1},(_,i)=>{
        const v=gridMinX+i*step; const px=sx(v);
        return px>=(pad+labelPad)&&px<=(pad+labelPad+plotW)?<text key={`tx${i}`} x={px} y={pad+plotH+16} fill={theme.textSecondary} fontSize={7} textAnchor="middle" fontFamily="inherit">{v}</text>:null;
      })}
      {Array.from({length:Math.round((gridMaxY-gridMinY)/step)+1},(_,i)=>{
        const v=gridMinY+i*step; const py=sy(v);
        return py>=pad&&py<=pad+plotH?<text key={`ty${i}`} x={pad+labelPad-8} y={py+3} fill={theme.textSecondary} fontSize={7} textAnchor="end" fontFamily="inherit">{v}</text>:null;
      })}
      {/* Axis unit labels */}
      <text x={pad+labelPad+plotW/2} y={pad+plotH+32} fill={theme.textSecondary} fontSize={9} textAnchor="middle" fontFamily="inherit" fontWeight={600} letterSpacing={2}>X ({uL})</text>
      <text x={14} y={pad+plotH/2} fill={theme.textSecondary} fontSize={9} textAnchor="middle" fontFamily="inherit" fontWeight={600} letterSpacing={2} transform={`rotate(-90,14,${pad+plotH/2})`}>Y ({uL})</text>
      {/* Compass labels */}
      <text x={pad+labelPad+plotW/2} y={pad-20} fill={theme.accent} fontSize={8} textAnchor="middle" fontFamily="inherit" fontWeight={800} letterSpacing={3} opacity={0.6}>{tx.moUpstage}</text>
      <text x={pad+labelPad+plotW/2} y={svgH-4} fill={theme.accent} fontSize={8} textAnchor="middle" fontFamily="inherit" fontWeight={800} letterSpacing={3} opacity={0.6}>{tx.moDownstage}</text>
      <text x={svgW-6} y={pad+plotH/2} fill={theme.accent} fontSize={8} textAnchor="end" fontFamily="inherit" fontWeight={800} letterSpacing={2} opacity={0.6} transform={`rotate(90,${svgW-6},${pad+plotH/2})`}>{tx.moStageLeft}</text>
      <text x={pad+labelPad-28} y={pad+plotH/2} fill={theme.accent} fontSize={8} textAnchor="start" fontFamily="inherit" fontWeight={800} letterSpacing={2} opacity={0.6} transform={`rotate(-90,${pad+labelPad-28},${pad+plotH/2})`}>{tx.moStageRight}</text>
      {/* Stage outline */}
      {stagePoints.length>=2&&<polygon points={stagePoints.map(p=>`${sx(getX(p))},${sy(getY(p))}`).join(" ")} fill={`${moColor("Stage")}15`} stroke={moColor("Stage")} strokeWidth={1.5} strokeDasharray="4,2"/>}
      {/* Points */}
      {points.filter(p=>p.type!=="Stage").map(p=>{
        const pcx=sx(getX(p)), pcy=sy(getY(p)), c=moColor(p.type);
        const shape=moShape(p.type), isHoist=moIsHoist(p.type), pr=4;
        const xv=(unit==="imperial"?p.xft:p.xm), yv=(unit==="imperial"?p.yft:p.ym);
        return <g key={p.num}>
          {isHoist&&<SvgCrosshair cx={pcx} cy={pcy} r={pr} stroke={c}/>}
          <SvgShape shape={shape} cx={pcx} cy={pcy} r={pr} fill={c}/>
          <text x={pcx+6} y={pcy-6} fill={theme.textPrimary} fontSize={5.5} fontFamily="inherit" fontWeight={500} opacity={0.85}>{p.label}</text>
          <text x={pcx+6} y={pcy+1} fill={theme.textSecondary} fontSize={3.8} fontFamily="inherit" opacity={0.65}>{xv},{yv}</text>
        </g>;
      })}
      {/* Stage X marks */}
      {stagePoints.map(p=>{
        const pcx=sx(getX(p)), pcy=sy(getY(p)), c=moColor("Stage");
        const xv=(unit==="imperial"?p.xft:p.xm), yv=(unit==="imperial"?p.yft:p.ym);
        return <g key={`stg-${p.num}`}>
          <SvgShape shape="x" cx={pcx} cy={pcy} r={3.5} fill={c}/>
          <text x={pcx+5} y={pcy-5} fill={theme.textSecondary} fontSize={4.5} fontFamily="inherit" opacity={0.6}>{p.label}</text>
          <text x={pcx+5} y={pcy+2} fill={theme.textSecondary} fontSize={3.5} fontFamily="inherit" opacity={0.5}>{xv},{yv}</text>
        </g>;
      })}
      {/* Legend with shapes */}
      {types.map((tp,i)=>{
        const lx=pad+labelPad+4, ly=pad+6+i*16;
        return <g key={tp} transform={`translate(${lx},${ly})`}>
          <SvgShape shape={moShape(tp)} cx={4} cy={4} r={4} fill={moColor(tp)}/>
          {moIsHoist(tp)&&<SvgCrosshair cx={4} cy={4} r={4} stroke={moColor(tp)}/>}
          <text x={14} y={7} fill={theme.textSecondary} fontSize={6.5} fontFamily="inherit">{tp}</text>
        </g>;
      })}
    </svg>
  );
}

// ── PDF shape drawing helpers ──
function pdfDrawShape(doc,shape,cx,cy,r,rgb){
  doc.setFillColor(...rgb);
  switch(shape){
    case "circle":
      doc.circle(cx,cy,r,"F");break;
    case "square":
      doc.rect(cx-r,cy-r,r*2,r*2,"F");break;
    case "triangle":{
      const pts=[[cx,cy-r*1.15],[cx-r,cy+r*0.7],[cx+r,cy+r*0.7]];
      doc.triangle(pts[0][0],pts[0][1],pts[1][0],pts[1][1],pts[2][0],pts[2][1],"F");
      break;
    }
    case "octagon":{
      const a=r*0.924;
      const pts=Array.from({length:8},(_,i)=>{const ang=Math.PI*2*i/8-Math.PI/8;return[cx+a*Math.cos(ang),cy+a*Math.sin(ang)];});
      // Draw octagon as filled lines
      doc.setFillColor(...rgb);
      const lines=pts.map(p=>p);lines.push(pts[0]);
      doc.setLineWidth(0.1);doc.setDrawColor(...rgb);
      for(let i=0;i<8;i++){
        const [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%8];
        doc.line(x1,y1,x2,y2);
      }
      // Fill by drawing smaller circles inside
      doc.circle(cx,cy,r*0.85,"F");
      break;
    }
    case "diamond":{
      const pts=[[cx,cy-r*1.2],[cx+r,cy],[cx,cy+r*1.2],[cx-r,cy]];
      doc.triangle(pts[0][0],pts[0][1],pts[1][0],pts[1][1],pts[2][0],pts[2][1],"F");
      doc.triangle(pts[0][0],pts[0][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1],"F");
      break;
    }
    case "x":{
      doc.setDrawColor(...rgb);doc.setLineWidth(0.5);
      doc.line(cx-r,cy-r,cx+r,cy+r);
      doc.line(cx+r,cy-r,cx-r,cy+r);
      break;
    }
    default:
      doc.circle(cx,cy,r,"F");
  }
}

function pdfDrawCrosshair(doc,cx,cy,r,rgb){
  const ext=r*1.6;
  doc.setDrawColor(...rgb);doc.setLineWidth(0.15);
  doc.setLineDashPattern([0.5,0.5],0);
  doc.line(cx-ext,cy,cx+ext,cy);
  doc.line(cx,cy-ext,cx,cy+ext);
  doc.setLineDashPattern([],0);
}

function generateMarkoutPDF({points,unit,paperSize,fileName,tx,theme}){
  const hexToRgb=h=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return[r,g,b];};
  const ac=[237,0,0],sc2=theme==="usa"?[0,40,104]:[0,80,240];
  const getX=p=>unit==="imperial"?p.xft:p.xm;
  const getY=p=>unit==="imperial"?p.yft:p.ym;
  const uL=unit==="imperial"?"ft":"m",wL=unit==="imperial"?"lbs":"kgs";
  const totW=unit==="imperial"?points.reduce((s,p)=>s+p.lbs,0):points.reduce((s,p)=>s+p.kgs,0);
  const types=[...new Set(points.filter(p=>p.type!=="Stage").map(p=>p.type))];

  // ═══════════════════════════════════════════
  // DOCUMENT 1: Plot sheet — Arch D or A1
  // ═══════════════════════════════════════════
  const isArchD=paperSize==="archD";
  const fmt=isArchD?[914.4,609.6]:[841,594];
  const doc=new jsPDF({orientation:"landscape",unit:"mm",format:fmt});
  const pw=fmt[0],ph=fmt[1],ml=20,mt=20,mr=20,mb=20;

  // Title block
  doc.setFont("helvetica","bold");doc.setFontSize(20);doc.setTextColor(...ac);
  doc.text("WYP ASSIST — MARKOUT SHEET",ml,mt+6);
  doc.setFontSize(9);doc.setTextColor(120,120,120);doc.setFont("helvetica","normal");
  doc.text(`${fileName||"Export"}  |  ${points.length} points  |  ${unit==="imperial"?"Imperial (ft/lbs)":"Metric (m/kg)"}  |  ${isArchD?"Arch D 24×36":"A1 841×594mm"}  |  ${new Date().toLocaleDateString()}`,ml,mt+14);

  // Plot area — use most of the page
  const plotL=ml+14, plotT=mt+22, plotW=pw-ml-mr-14, plotH=ph-mt-mb-32;
  doc.setDrawColor(80,80,80);doc.setLineWidth(0.3);doc.rect(plotL,plotT,plotW,plotH);

  // Compute scale
  const xs=points.map(getX),ys=points.map(getY);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const rangeX=maxX-minX||1,rangeY=maxY-minY||1;
  const scaleX=plotW/rangeX,scaleY=plotH/rangeY,scale=Math.min(scaleX,scaleY)*0.88;
  const offX=plotL+plotW/2,offY=plotT+plotH/2;
  const midDataX=(minX+maxX)/2,midDataY=(minY+maxY)/2;
  const px=v=>offX+(v-midDataX)*scale;
  const py=v=>offY-(v-midDataY)*scale;

  // Grid
  const step=unit==="imperial"?10:5;
  const gMinX=Math.floor(minX/step)*step,gMaxX=Math.ceil(maxX/step)*step;
  const gMinY=Math.floor(minY/step)*step,gMaxY=Math.ceil(maxY/step)*step;
  doc.setDrawColor(60,60,60);doc.setLineWidth(0.15);
  for(let v=gMinX;v<=gMaxX;v+=step){const x=px(v);if(x>=plotL&&x<=plotL+plotW){doc.setLineDashPattern([1,1],0);doc.line(x,plotT,x,plotT+plotH);doc.setFontSize(5);doc.setTextColor(120,120,120);doc.text(String(v),x,plotT+plotH+4,{align:"center"});}}
  for(let v=gMinY;v<=gMaxY;v+=step){const y=py(v);if(y>=plotT&&y<=plotT+plotH){doc.setLineDashPattern([1,1],0);doc.line(plotL,y,plotL+plotW,y);doc.text(String(v),plotL-2,y+1.5,{align:"right"});}}

  // Center lines
  doc.setDrawColor(...ac);doc.setLineWidth(0.5);doc.setLineDashPattern([3,2],0);
  if(minX<=0&&maxX>=0){const cx=px(0);doc.line(cx,plotT,cx,plotT+plotH);}
  if(minY<=0&&maxY>=0){const cy=py(0);doc.line(plotL,cy,plotL+plotW,cy);}
  doc.setLineDashPattern([],0);

  // Compass labels
  doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(...ac);
  doc.text("UPSTAGE",plotL+plotW/2,plotT-3,{align:"center"});
  doc.text("DOWNSTAGE",plotL+plotW/2,plotT+plotH+10,{align:"center"});
  // Axis unit labels
  doc.setFontSize(6);doc.setTextColor(120,120,120);
  doc.text(`X (${uL})`,plotL+plotW/2,plotT+plotH+15,{align:"center"});
  doc.text(`Y (${uL})`,plotL-8,plotT+plotH/2,{angle:90,align:"center"});

  // Stage outline
  const stg=points.filter(p=>p.type==="Stage");
  if(stg.length>=2){doc.setDrawColor(100,100,100);doc.setLineWidth(0.4);doc.setLineDashPattern([2,1],0);const spts=stg.map(p=>({x:px(getX(p)),y:py(getY(p))}));for(let i=0;i<spts.length;i++){const n=(i+1)%spts.length;doc.line(spts[i].x,spts[i].y,spts[n].x,spts[n].y);}doc.setLineDashPattern([],0);}

  // Stage X marks
  stg.forEach(p=>{
    const cx=px(getX(p)),cy=py(getY(p)),rgb=hexToRgb(moColor("Stage"));
    pdfDrawShape(doc,"x",cx,cy,1.2,rgb);
    doc.setFontSize(3.5);doc.setTextColor(100,100,100);doc.setFont("helvetica","normal");
    doc.text(p.label,cx+2,cy-1.5);
    doc.setFontSize(2.8);doc.setTextColor(150,150,150);
    doc.text(`${getX(p)},${getY(p)}`,cx+2,cy+1);
  });

  // Points with shapes, crosshairs, coordinate labels
  points.filter(p=>p.type!=="Stage").forEach(p=>{
    const cx=px(getX(p)),cy=py(getY(p)),rgb=hexToRgb(moColor(p.type));
    const shape=moShape(p.type), isHoist=moIsHoist(p.type), r=1.5;
    if(isHoist) pdfDrawCrosshair(doc,cx,cy,r,rgb);
    pdfDrawShape(doc,shape,cx,cy,r,rgb);
    doc.setFontSize(3.5);doc.setTextColor(60,60,60);doc.setFont("helvetica","normal");
    doc.text(p.label,cx+2.5,cy-1.5);
    doc.setFontSize(2.5);doc.setTextColor(140,140,140);
    doc.text(`${getX(p)},${getY(p)}`,cx+2.5,cy+1);
  });

  // Legend
  let ly=plotT+4;
  doc.setFontSize(5);doc.setFont("helvetica","bold");doc.setTextColor(100,100,100);doc.text("LEGEND",plotL+2,ly);ly+=5;
  doc.setFont("helvetica","normal");
  types.forEach(t=>{
    const rgb=hexToRgb(moColor(t));
    const shape=moShape(t);
    pdfDrawShape(doc,shape,plotL+5,ly-1.5,1.5,rgb);
    if(moIsHoist(t)) pdfDrawCrosshair(doc,plotL+5,ly-1.5,1.5,rgb);
    doc.setTextColor(80,80,80);doc.setFontSize(4.5);
    doc.text(t,plotL+9,ly);ly+=5;
  });

  // Summary bar
  doc.setFillColor(...ac);doc.rect(ml,ph-mb-2,pw-ml-mr,6,"F");
  doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text(`${tx.moTotalPts}: ${points.length}  |  ${tx.moTotalWeight}: ${totW.toLocaleString()} ${wL}  |  WYP Assist v1.1.0`,ml+3,ph-mb+2);

  doc.save(`WYP_Markout_Plot_${fileName||"export"}.pdf`);

  // ═══════════════════════════════════════════
  // DOCUMENT 2: Data table cheat sheet — Letter or A4
  // ═══════════════════════════════════════════
  const isImperial=unit==="imperial";
  const fmt2=isImperial?"letter":"a4";
  const doc2=new jsPDF({orientation:"portrait",unit:"mm",format:fmt2});
  const pw2=isImperial?215.9:210, ph2=isImperial?279.4:297;
  const ml2=12,mt2=12,mr2=12,mb2=12;

  // Title
  doc2.setFont("helvetica","bold");doc2.setFontSize(14);doc2.setTextColor(...ac);
  doc2.text("WYP ASSIST — POINT DATA CHEAT SHEET",ml2,mt2+6);
  doc2.setFontSize(8);doc2.setTextColor(120,120,120);doc2.setFont("helvetica","normal");
  doc2.text(`${fileName||"Export"}  |  ${points.length} points  |  ${isImperial?"Imperial (ft/lbs)":"Metric (m/kg)"}  |  ${isImperial?"Letter 8.5×11":"A4 210×297mm"}  |  ${new Date().toLocaleDateString()}`,ml2,mt2+13);

  // Table
  let ty=mt2+20;
  doc2.setFillColor(...ac);doc2.rect(ml2,ty,pw2-ml2-mr2,5,"F");
  doc2.setFontSize(7);doc2.setFont("helvetica","bold");doc2.setTextColor(255,255,255);
  doc2.text("POINT DATA TABLE",ml2+2,ty+3.8);ty+=7;

  const colW=[10,24,14,14,32,16,16,16,16];
  const totalColW=colW.reduce((a,b)=>a+b,0);
  const colScale=(pw2-ml2-mr2)/totalColW;
  const colWS=colW.map(w=>w*colScale);
  const colH=["#","LABEL",`Y (${uL})`,`X (${uL})`,"TYPE",`LOAD (${wL})`,"NOTES",`TRIM (${uL})`,`CABLE (${uL})`];

  doc2.setFillColor(235,235,235);doc2.rect(ml2,ty,pw2-ml2-mr2,5,"F");
  doc2.setFontSize(5.5);doc2.setFont("helvetica","bold");doc2.setTextColor(100,100,100);
  let cx2=ml2+2;
  colH.forEach((h,i)=>{doc2.text(h,cx2,ty+3.5);cx2+=colWS[i];});
  ty+=6;

  doc2.setFont("helvetica","normal");doc2.setFontSize(5.5);
  points.forEach((p,idx)=>{
    if(ty>ph2-mb2-8){
      doc2.addPage();ty=mt2;
      // Repeat header on new page
      doc2.setFillColor(235,235,235);doc2.rect(ml2,ty,pw2-ml2-mr2,5,"F");
      doc2.setFontSize(5.5);doc2.setFont("helvetica","bold");doc2.setTextColor(100,100,100);
      cx2=ml2+2;colH.forEach((h,i)=>{doc2.text(h,cx2,ty+3.5);cx2+=colWS[i];});
      ty+=6;doc2.setFont("helvetica","normal");doc2.setFontSize(5.5);
    }
    if(idx%2===0){doc2.setFillColor(248,248,248);doc2.rect(ml2,ty-1,pw2-ml2-mr2,4.5,"F");}
    cx2=ml2+2;
    const yv=unit==="imperial"?p.yft:p.ym,xv=unit==="imperial"?p.xft:p.xm;
    const ld=unit==="imperial"?p.lbs:p.kgs,trm=unit==="imperial"?p.trimFt:p.trimM,cbl=unit==="imperial"?p.cableFt:p.cableM;
    doc2.setTextColor(140,140,140);doc2.text(String(p.num),cx2,ty+2.5);cx2+=colWS[0];
    doc2.setTextColor(60,60,60);doc2.text(p.label,cx2,ty+2.5);cx2+=colWS[1];
    doc2.text(String(yv),cx2,ty+2.5);cx2+=colWS[2];
    doc2.text(String(xv),cx2,ty+2.5);cx2+=colWS[3];
    doc2.setTextColor(80,80,80);doc2.text(p.type,cx2,ty+2.5);cx2+=colWS[4];
    const rgb=hexToRgb(moColor(p.type));doc2.setTextColor(...rgb);doc2.setFont("helvetica","bold");
    doc2.text(ld?String(ld):"—",cx2,ty+2.5);cx2+=colWS[5];
    doc2.setFont("helvetica","normal");doc2.setTextColor(120,120,120);
    doc2.text(p.notes||"",cx2,ty+2.5);cx2+=colWS[6];
    doc2.text(trm?String(trm):"",cx2,ty+2.5);cx2+=colWS[7];
    doc2.text(cbl?String(cbl):"",cx2,ty+2.5);
    ty+=4.5;
  });

  // Footer
  ty+=4;doc2.setFillColor(...ac);doc2.rect(ml2,ty,pw2-ml2-mr2,5,"F");
  doc2.setFontSize(6);doc2.setFont("helvetica","bold");doc2.setTextColor(255,255,255);
  doc2.text(`${tx.moTotalPts}: ${points.length}  |  ${tx.moTotalWeight}: ${totW.toLocaleString()} ${wL}`,ml2+2,ty+3.5);
  doc2.setFontSize(4);doc2.setTextColor(160,160,160);doc2.text("WYP Assist v1.1.0",ml2,ph2-6);

  doc2.save(`WYP_Markout_Data_${fileName||"export"}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD-IN MARKOUT PDF — Tape-Strip View
// ═══════════════════════════════════════════════════════════════════════════════
function generateLoadInPDF({points,unit,paperSize,fileName,tx,theme}){
  const hexToRgb=h=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return[r,g,b];};
  const ac=[237,0,0],sc2=theme==="usa"?[0,40,104]:[0,80,240];
  const isImp=unit==="imperial";
  const fmt=isImp?"letter":"a4";
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:fmt});
  const pw=isImp?215.9:210,ph=isImp?279.4:297;
  const ml=15,mt=15,mr=15,mb=15;
  const usableW=pw-ml-mr;

  // Filter out Stage points
  const loadInPts=points.filter(p=>p.type!=="Stage");
  if(loadInPts.length===0){doc.save(`WYP_LoadIn_${fileName||"export"}.pdf`);return;}

  const getXv=p=>isImp?p.xft:p.xm;
  const getYv=p=>isImp?p.yft:p.ym;
  const uL=isImp?"ft":"m";
  const wL=isImp?"lbs":"kgs";

  // ── Group points by Y value into rows ──
  const yTol=isImp?0.5:0.15;
  const sorted=[...loadInPts].sort((a,b)=>getYv(b)-getYv(a)); // descending Y → upstage first
  const rows=[];
  if(sorted.length>0){
    let curPts=[sorted[0]];
    let curY=getYv(sorted[0]);
    for(let i=1;i<sorted.length;i++){
      if(Math.abs(getYv(sorted[i])-curY)<=yTol){
        curPts.push(sorted[i]);
      } else {
        const avgY=curPts.reduce((s,p)=>s+getYv(p),0)/curPts.length;
        rows.push({y:avgY,points:curPts});
        curPts=[sorted[i]];
        curY=getYv(sorted[i]);
      }
    }
    const avgY=curPts.reduce((s,p)=>s+getYv(p),0)/curPts.length;
    rows.push({y:avgY,points:curPts});
  }
  // Sort each row's points by X (SR→SL, negative→positive)
  rows.forEach(r=>r.points.sort((a,b)=>getXv(a)-getXv(b)));

  // ── Layout constants ──
  const headerH=22,footerH=10;
  const clX=ml+usableW/2;
  const stripTop=mt+headerH+10;
  const stripBot=ph-mb-footerH-6;
  const stripH=stripBot-stripTop;

  // Box dimensions & rounded corner radius
  const boxW=30,boxH=16,subRowGap=2,rowGap=5,cornerR=3;
  const minBoxGap=boxW+2; // minimum center-to-center distance
  const pageLeft=ml+2+boxW/2, pageRight=pw-mr-2-boxW/2;
  const availRowW=pageRight-pageLeft; // usable width for boxes
  const maxPerSubRow=Math.max(1,Math.floor(availRowW/minBoxGap)+1);

  // Split each Y-row into sub-rows if too many boxes to fit
  // Each sub-row is an array of {p, cx} with guaranteed no overlap
  function layoutRow(pts){
    const sorted=[...pts].sort((a,b)=>getXv(a)-getXv(b));
    const subRows=[];
    for(let i=0;i<sorted.length;i+=maxPerSubRow){
      const chunk=sorted.slice(i,i+maxPerSubRow);
      // Evenly space this chunk across the available width
      const boxes=chunk.map((p,idx)=>{
        let cx;
        if(chunk.length===1){cx=clX+(getXv(p)/((Math.max(Math.abs(Math.min(...pts.map(getXv))),Math.abs(Math.max(...pts.map(getXv))))||1)))*availRowW/2;}
        else{
          // Place proportionally across page width, preserving relative X order
          const t=chunk.length>1?idx/(chunk.length-1):0.5;
          cx=pageLeft+t*availRowW;
        }
        return{p,cx};
      });
      // Final pass: ensure no overlap by greedy left-to-right placement
      for(let j=1;j<boxes.length;j++){
        if(boxes[j].cx-boxes[j-1].cx<minBoxGap){
          boxes[j].cx=boxes[j-1].cx+minBoxGap;
        }
      }
      // If rightmost box exceeds page, shift everything left
      if(boxes.length>0&&boxes[boxes.length-1].cx>pageRight){
        const shift=boxes[boxes.length-1].cx-pageRight;
        boxes.forEach(b=>{b.cx-=shift;});
      }
      // Clamp all to page bounds
      boxes.forEach(b=>{b.cx=Math.max(pageLeft,Math.min(pageRight,b.cx));});
      subRows.push(boxes);
    }
    return subRows;
  }

  // Pre-calculate sub-row counts for each Y-row to determine total visual rows
  const rowLayouts=rows.map(r=>({y:r.y,points:r.points,subRows:layoutRow(r.points)}));
  // Each Y-row's visual height: subRows * boxH + (subRows-1) * subRowGap + rowGap
  const rowVisualH=rowLayouts.map(r=>{const n=r.subRows.length;return n*boxH+(n-1)*subRowGap+rowGap;});

  // Paginate: pack rows into pages based on actual visual height
  const pages=[];
  let curPage=[],curH=0;
  for(let i=0;i<rowLayouts.length;i++){
    if(curH+rowVisualH[i]>stripH&&curPage.length>0){
      pages.push(curPage);
      curPage=[];curH=0;
    }
    curPage.push({row:rowLayouts[i],h:rowVisualH[i]});
    curH+=rowVisualH[i];
  }
  if(curPage.length>0)pages.push(curPage);
  const pagesNeeded=pages.length;

  // Total weight for footer
  const totW=isImp?loadInPts.reduce((s,p)=>s+p.lbs,0):loadInPts.reduce((s,p)=>s+p.kgs,0);

  for(let page=0;page<pagesNeeded;page++){
    if(page>0)doc.addPage();

    // ── HEADER ──
    [ac,[255,255,255],sc2,[255,255,255],ac].forEach((c,i)=>{doc.setFillColor(c[0],c[1],c[2]);doc.rect(pw/5*i,0,pw/5,3,"F");});
    doc.setFont("helvetica","bold");doc.setFontSize(14);doc.setTextColor(...ac);
    doc.text("WYP ASSIST",ml,mt+6);
    doc.setFontSize(9);doc.setTextColor(60,60,60);
    doc.text(tx.moLoadIn||"Load-In Markout",ml+52,mt+6);
    doc.setFontSize(7.5);doc.setTextColor(120,120,120);doc.setFont("helvetica","normal");
    doc.text(`${fileName||"Export"}  |  ${loadInPts.length} points  |  ${isImp?"Imperial (ft/lbs)":"Metric (m/kg)"}  |  ${new Date().toLocaleDateString()}${pagesNeeded>1?`  |  Page ${page+1}/${pagesNeeded}`:""}`,ml,mt+13);

    // ── CENTER LINE ──
    doc.setDrawColor(...ac);doc.setLineWidth(0.8);
    doc.setLineDashPattern([4,2],0);
    doc.line(clX,stripTop-6,clX,stripBot+4);
    doc.setLineDashPattern([],0);

    // CL label
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(...ac);
    doc.text(tx.moCL||"CL",clX,stripTop-8,{align:"center"});

    // SL / SR labels
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(...sc2);
    doc.text(tx.moSR||"SR",clX-24,stripTop-8,{align:"right"});
    doc.text(tx.moSL||"SL",clX+24,stripTop-8,{align:"left"});

    // UPSTAGE at top, DOWNSTAGE at bottom (positive Y = upstage)
    doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(...ac);
    doc.text(tx.moUpstage||"UPSTAGE",clX,stripTop-2,{align:"center"});
    doc.text(tx.moDownstage||"DOWNSTAGE",clX,stripBot+10,{align:"center"});

    // ── ROWS FOR THIS PAGE ──
    const pageRows=pages[page];
    let yPos=stripTop;

    pageRows.forEach(({row,h})=>{
      const subRows=row.subRows;
      const yLabel=row.y;
      const ySign=yLabel>=0?"+":"";

      // Y label on right margin (centered on this row group)
      doc.setFont("helvetica","normal");doc.setFontSize(5.5);
      doc.setTextColor(150,150,150);
      doc.text(`${ySign}${yLabel.toFixed(1)} ${uL}`,pw-mr+2,yPos+h/2+1.5);

      // Horizontal grid line at first sub-row center
      const firstCenter=yPos+boxH/2;
      doc.setDrawColor(210,210,210);doc.setLineWidth(0.1);
      doc.setLineDashPattern([1,1],0);
      doc.line(ml+8,firstCenter,pw-mr-8,firstCenter);
      doc.setLineDashPattern([],0);

      // Draw each sub-row
      subRows.forEach((boxes,si)=>{
        const subCenterY=yPos+si*(boxH+subRowGap)+boxH/2;

        // "continued" label for spill sub-rows
        if(si>0){
          doc.setFont("helvetica","italic");doc.setFontSize(4);
          doc.setTextColor(180,180,180);
          doc.text("cont.",ml+2,subCenterY+1.5);
        }

        boxes.forEach(({p,cx})=>{
          const bx=cx-boxW/2;
          const by=subCenterY-boxH/2;
          const rgb=hexToRgb(moColor(p.type));

          // Light fill (15% type color blended toward white)
          const lR=Math.round(rgb[0]*0.15+255*0.85);
          const lG=Math.round(rgb[1]*0.15+255*0.85);
          const lB=Math.round(rgb[2]*0.15+255*0.85);

          // Rounded rectangle — fill then border
          doc.setFillColor(lR,lG,lB);
          doc.roundedRect(bx,by,boxW,boxH,cornerR,cornerR,"F");
          doc.setDrawColor(rgb[0],rgb[1],rgb[2]);doc.setLineWidth(0.4);
          doc.roundedRect(bx,by,boxW,boxH,cornerR,cornerR,"S");

          // ── Content inside shape ──
          // Label (bold, type color)
          doc.setFont("helvetica","bold");doc.setFontSize(6);
          doc.setTextColor(rgb[0],rgb[1],rgb[2]);
          doc.text(p.label,cx,by+4.5,{align:"center"});

          // X offset value with +/- sign
          const xv=getXv(p);
          const xSign=xv>=0?"+":"";
          doc.setFont("helvetica","bold");doc.setFontSize(5.5);
          doc.setTextColor(40,40,40);
          doc.text(`${xSign}${xv.toFixed(1)} ${uL}`,cx,by+8.5,{align:"center"});

          // Type abbreviation
          const typeAbbr=p.type.length>12?p.type.substring(0,11)+"..":p.type;
          doc.setFont("helvetica","normal");doc.setFontSize(4);
          doc.setTextColor(100,100,100);
          doc.text(typeAbbr,cx,by+11.5,{align:"center"});

          // Weight
          const wt=isImp?p.lbs:p.kgs;
          if(wt){
            doc.setFontSize(4);doc.setTextColor(130,130,130);
            doc.text(`${wt} ${wL}`,cx,by+14.5,{align:"center"});
          }

          // Dashed leader line from box edge to center line
          doc.setDrawColor(200,200,200);doc.setLineWidth(0.1);
          doc.setLineDashPattern([0.5,0.5],0);
          if(xv>0){doc.line(bx,subCenterY,clX+1,subCenterY);}
          else if(xv<0){doc.line(bx+boxW,subCenterY,clX-1,subCenterY);}
          doc.setLineDashPattern([],0);
        });
      });

      yPos+=h;
    });

    // ── FOOTER BAR ──
    const fY=ph-mb-footerH;
    doc.setFillColor(...ac);doc.rect(ml,fY,usableW,8,"F");
    doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
    doc.text(`${tx.moTotalPts}: ${loadInPts.length}  |  ${tx.moTotalWeight}: ${totW.toLocaleString()} ${wL}  |  WYP Assist v1.1.0`,ml+3,fY+5.5);
  }

  doc.save(`WYP_LoadIn_${fileName||"export"}.pdf`);
}

// ── Column Mapper UI ──
function ColumnMapper({rawCSV,onApply,onCancel}){
  const{s,t}=useTheme();
  const[mapping,setMapping]=useState(()=>autoMatchHeaders(rawCSV.headers));
  const setField=(key,val)=>setMapping(p=>({...p,[key]:parseInt(val)}));
  const canApply=mapping.xPos>=0&&mapping.yPos>=0;
  // Preview first 3 data rows
  const preview=rawCSV.rows.slice(0,3);
  return(
    <div data-r="card" style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:16}}>🔗</span> MAP CSV COLUMNS</div>
      <div style={{fontSize:11,color:t.textSecondary,marginBottom:16}}>Match your CSV headers to the fields below. X and Y Position are required.</div>
      {/* Preview table */}
      <div data-r="tbl-wrap" style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:20}}>
        <table style={{...s.tbl,fontSize:11}}>
          <thead><tr>
            {rawCSV.headers.map((h,i)=><th key={i} style={{...s.th,fontSize:9,whiteSpace:"nowrap",minWidth:60}}><span style={{color:t.accent,marginRight:4}}>#{i}</span>{h}</th>)}
          </tr></thead>
          <tbody>
            {preview.map((row,ri)=><tr key={ri}>{rawCSV.headers.map((_,ci)=><td key={ci} style={{...s.td,fontSize:10,color:t.textSecondary,whiteSpace:"nowrap",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{row[ci]||"—"}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {/* Mapping dropdowns */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {MAP_FIELDS.map(f=>(
          <div key={f.key} style={{background:t.surfaceLight,borderRadius:6,padding:12,border:`1px solid ${f.required&&mapping[f.key]<0?"#E74C3C40":t.border}`}}>
            <label style={{...s.label,marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
              {f.label}{f.required&&<span style={{color:"#E74C3C",fontSize:9}}>*</span>}
            </label>
            <select style={{...s.input,fontSize:12,padding:"8px 10px"}} value={mapping[f.key]} onChange={e=>setField(f.key,e.target.value)}>
              <option value={-1}>— skip —</option>
              {rawCSV.headers.map((h,i)=><option key={i} value={i}>{h}</option>)}
            </select>
            {mapping[f.key]>=0&&<div style={{fontSize:9,color:t.textSecondary,marginTop:4,opacity:0.7}}>
              Preview: {preview[0]?.[mapping[f.key]]||"—"}
            </div>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:12,marginTop:20,alignItems:"center"}}>
        <button style={{...s.exportBtn,opacity:canApply?1:0.4,cursor:canApply?"pointer":"not-allowed"}} onClick={()=>canApply&&onApply(mapping)} disabled={!canApply}>
          ✓ APPLY MAPPING
        </button>
        <button style={{...s.chip(false),padding:"10px 20px",cursor:"pointer"}} onClick={onCancel}>Cancel</button>
        {!canApply&&<span style={{fontSize:10,color:"#E74C3C",letterSpacing:1}}>X and Y Position are required</span>}
      </div>
    </div>
  );
}

function MarkoutTab(){
  const{s,t,tx,lang,setTab,setSharedMotors}=useTheme();
  const[points,setPoints]=useState([]);
  const[unit,setUnit]=useState("imperial");
  const[paper,setPaper]=useState("archD");
  const[fileName,setFileName]=useState("");
  const[sortCol,setSortCol]=useState("num");
  const[sortDir,setSortDir]=useState(1);
  const[pushed,setPushed]=useState(false);
  // Flexible CSV importer state
  const[rawCSV,setRawCSV]=useState(null); // { headers, rows, delimiter }
  const[showMapper,setShowMapper]=useState(false);
  const hasData=points.length>0;
  const handleFile=e=>{
    const file=e.target.files[0];if(!file)return;
    setFileName(file.name.replace(/\.csv$/i,""));
    setPushed(false);
    const reader=new FileReader();
    reader.onload=ev=>{
      const raw=preParseCSV(ev.target.result);
      setRawCSV(raw);
      setShowMapper(true);
      setPoints([]);
    };
    reader.readAsText(file);
  };
  const handleMappingApply=(mapping)=>{
    if(!rawCSV) return;
    const{points:pts}=applyColumnMapping(rawCSV,mapping);
    setPoints(pts);
    setShowMapper(false);
  };
  const handleMappingCancel=()=>{setShowMapper(false);setRawCSV(null);};
  const handlePushToPull=()=>{
    if(!hasData)return;
    const motors=countMotorsFromCSV(points);
    setSharedMotors(motors);
    setPushed(true);
    setTimeout(()=>setTab("pull"),150);
  };
  const totWeight=unit==="imperial"?points.reduce((s,p)=>s+p.lbs,0):points.reduce((s,p)=>s+p.kgs,0);
  const wL=unit==="imperial"?"lbs":"kgs";
  const uL=unit==="imperial"?"ft":"m";
  const sorted=useMemo(()=>{
    const arr=[...points];
    const key=sortCol;
    arr.sort((a,b)=>{
      let va=a[key],vb=b[key];
      if(typeof va==="string") return va.localeCompare(vb)*sortDir;
      return ((va||0)-(vb||0))*sortDir;
    });
    return arr;
  },[points,sortCol,sortDir]);
  const doSort=col=>{if(sortCol===col)setSortDir(-sortDir);else{setSortCol(col);setSortDir(1);}};
  const types=[...new Set(points.filter(p=>p.type!=="Stage").map(p=>p.type))];
  const handleExport=()=>{if(!hasData)return;generateMarkoutPDF({points,unit,paperSize:paper,fileName,tx,theme:lang});};
  const handleExportLoadIn=()=>{if(!hasData)return;generateLoadInPDF({points,unit,paperSize:paper,fileName,tx,theme:lang});};
  return(<div>
    <div data-r="card" style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>📐</span> {tx.moTitle}</div>
      <div data-r="mo-toolbar" style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end",marginBottom:20}}>
        <div style={s.fg}><label style={s.label}>{tx.moImportCSV}</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <label style={{...s.exportBtn,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
              <span>📂</span> {tx.moImportCSV}
              <input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}}/>
            </label>
            <button style={{...s.exportBtn,background:t.secondary}} onClick={downloadMarkoutTemplate}><span>📄</span> {tx.moTemplate}</button>
          </div>
        </div>
        <div style={s.fg}><label style={s.label}>{tx.moUnit}</label><Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/></div>
        <div style={s.fg}><label style={s.label}>{tx.moPaper}</label><Chips options={["archD","a1"]} value={paper} onChange={setPaper}/></div>
      </div>
      {hasData&&<div data-r="mo-actions" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <button style={s.exportBtn} onClick={handleExport}><span>⬇</span> {tx.moExportPDF}</button>
        <button style={{...s.exportBtn,background:t.secondary}} onClick={handleExportLoadIn}><span>📋</span> {tx.moExportLoadIn}</button>
        <button style={{...s.exportBtn,background:pushed?success:t.secondary}} onClick={handlePushToPull}><span>{pushed?"✓":"📋"}</span> {pushed?tx.moPushPullDone:tx.moPushPull}</button>
      </div>}
      {hasData&&<div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={s.res}><div style={s.resVal}>{points.length}</div><div style={s.resLbl}>{tx.moTotalPts}</div></div>
        <div style={s.res}><div style={{...s.resVal,color:success}}>{totWeight.toLocaleString()}</div><div style={s.resLbl}>{tx.moTotalWeight} ({wL})</div></div>
        <div style={s.res}><div style={{...s.resVal,color:t.accent}}>{types.length}</div><div style={s.resLbl}>{tx.moType}s</div></div>
      </div>}
      {fileName&&<div style={{marginTop:12,fontSize:11,color:t.textSecondary,letterSpacing:1}}>📄 {fileName}.csv{rawCSV&&` · ${rawCSV.rows.length} rows · delimiter: "${rawCSV.delimiter==="\t"?"tab":rawCSV.delimiter}"`}</div>}
      <div style={{marginTop:12,padding:"10px 16px",background:t.surfaceLight,border:`1px solid ${t.border}`,borderRadius:6,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:11,color:t.textSecondary,letterSpacing:0.5}} onClick={()=>window.open("https://app-help.vectorworks.net/2026/eng/VW2026_Guide/Hoists/Creating_hoist_reports.htm","_blank")}>
        <span style={{fontSize:14}}>🔗</span>
        <span>{tx.moVwHelp}</span>
        <span style={{marginLeft:"auto",fontSize:9,opacity:0.5}}>↗</span>
      </div>
    </div>
    {/* Column Mapper */}
    {showMapper&&rawCSV&&<ColumnMapper rawCSV={rawCSV} onApply={handleMappingApply} onCancel={handleMappingCancel}/>}
    {hasData&&<div data-r="card" style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.moTitle} — {fileName}</div>
      <MarkoutVisualizer points={points} unit={unit} theme={t} tx={tx}/>
    </div>}
    {hasData&&<div data-r="card" style={s.card}><div style={s.cardTitle}><span>📊</span> {tx.moLabel} {tx.moType} — {points.length} {tx.moTotalPts.toLowerCase()}</div>
      <div data-r="tbl-wrap" style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={s.tbl}><thead><tr>
          {[{k:"num",l:tx.moNum},{k:"label",l:tx.moLabel},{k:unit==="imperial"?"yft":"ym",l:`${tx.moY} (${uL})`},{k:unit==="imperial"?"xft":"xm",l:`${tx.moX} (${uL})`},{k:"type",l:tx.moType},{k:unit==="imperial"?"lbs":"kgs",l:`${tx.moLoad} (${wL})`},{k:"notes",l:tx.moNotes}].map(c=>
            <th key={c.k} style={{...s.th,cursor:"pointer",userSelect:"none"}} onClick={()=>doSort(c.k)}>{c.l}{sortCol===c.k?(sortDir===1?" ▲":" ▼"):""}</th>
          )}
        </tr></thead><tbody>
          {sorted.map(p=>{
            const yv=unit==="imperial"?p.yft:p.ym, xv=unit==="imperial"?p.xft:p.xm;
            const ld=unit==="imperial"?p.lbs:p.kgs;
            return <tr key={p.num}>
              <td style={s.tdId}>{p.num}</td>
              <td style={s.td}><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:moColor(p.type),marginRight:8,verticalAlign:"middle"}}/>{p.label}</td>
              <td style={s.td}>{yv}</td>
              <td style={s.td}>{xv}</td>
              <td style={s.td}>{p.type}</td>
              <td style={s.tdA}>{ld||"—"}</td>
              <td style={{...s.td,color:t.textSecondary,fontSize:11}}>{p.notes||""}</td>
            </tr>;
          })}
        </tbody></table>
      </div>
    </div>}
    {!hasData&&<div style={{...s.card,...s.empty}}><div style={{fontSize:48,marginBottom:12,opacity:.3}}>📐</div><div style={{fontSize:14}}>{tx.moEmpty}</div></div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function LoginView({ onSwitch, onClose }) {
  const { s, t, tx } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    onClose();
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setResetSent(true); setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
      <div style={s.card}>
        <div style={s.cardTitle}><span>{resetMode ? tx.authResetPassword : tx.authLogin}</span></div>
        {resetSent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#9993;</div>
            <div style={{ fontSize: 13, color: t.textPrimary, marginBottom: 8 }}>{tx.authResetSent}</div>
            <button style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}
              onClick={() => { setResetMode(false); setResetSent(false); }}>{tx.authBack}</button>
          </div>
        ) : (
          <form onSubmit={resetMode ? handleReset : handleSubmit}>
            <Field label={tx.authEmail}>
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
            </Field>
            {!resetMode && (
              <Field label={tx.authPassword}>
                <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
              </Field>
            )}
            {error && <div style={s.warnBox(danger)}><span style={{ fontSize: 12 }}>{error}</span></div>}
            <button type="submit" style={{ ...s.exportBtn, width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "..." : resetMode ? tx.authResetPassword : tx.authLogin}
            </button>
          </form>
        )}
        {!resetSent && (
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: t.textSecondary, display: "flex", flexDirection: "column", gap: 8 }}>
            {!resetMode && (
              <div><span style={{ color: t.accent, cursor: "pointer" }} onClick={() => setResetMode(true)}>{tx.authForgot}</span></div>
            )}
            {resetMode && (
              <div><span style={{ color: t.accent, cursor: "pointer" }} onClick={() => setResetMode(false)}>{tx.authBack}</span></div>
            )}
            <div>{tx.authNoAccount}{" "}<span style={{ color: t.accent, cursor: "pointer" }} onClick={() => onSwitch("signup")}>{tx.authSignup}</span></div>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1 }}>{tx.authBack}</button>
      </div>
    </div>
  );
}

function NewPasswordView({ onClose }) {
  const { s, t, tx } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
      <div style={s.card}>
        <div style={s.cardTitle}><span>{tx.authSetNewPassword}</span></div>
        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
            <div style={{ fontSize: 13, color: t.textPrimary, marginBottom: 16 }}>{tx.authNewPasswordSuccess}</div>
            <button style={{ ...s.exportBtn, justifyContent: "center" }} onClick={onClose}>{tx.authLogin}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Field label={tx.authNewPassword}>
              <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
            </Field>
            <Field label={`${tx.authNewPassword} (confirm)`}>
              <input style={s.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password" />
            </Field>
            {error && <div style={s.warnBox(danger)}><span style={{ fontSize: 12 }}>{error}</span></div>}
            <button type="submit" style={{ ...s.exportBtn, width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "..." : tx.authSetNewPassword}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function SignupView({ onSwitch, onClose }) {
  const { s, t, tx } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setVerifyMode(true); setLoading(false);
  };

  if (verifyMode) {
    const handleResend = async () => {
      setResending(true);
      await supabase.auth.resend({ type: "signup", email });
      setResent(true); setResending(false);
    };
    return (
      <div style={{ maxWidth: 440, margin: "40px auto", padding: "0 16px" }}>
        <div style={{ ...s.card, padding: "40px 32px", textAlign: "center" }}>
          {/* Animated envelope icon */}
          <div style={{ width: 72, height: 72, margin: "0 auto 20px", borderRadius: "50%", background: `${t.accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 4L12 13L2 4"/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "inherit" }}>{tx.authVerifyTitle || "Verify Your Email"}</div>
          <div style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.6, marginBottom: 6 }}>{tx.authVerifyDesc || "We sent a verification link to"}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 20 }}>{email}</div>
          <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.6, marginBottom: 24, padding: "0 8px" }}>
            {tx.authVerifyHint || "Click the link in the email to activate your account. Check your spam folder if you don't see it."}
          </div>
          <button style={{ ...s.exportBtn, width: "100%", justifyContent: "center", marginBottom: 12 }}
            onClick={() => onSwitch("login")}>{tx.authVerifyGoLogin || "I've Verified — Sign In"}</button>
          <button
            onClick={handleResend}
            disabled={resent || resending}
            style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 20px", color: resent ? "#4ade80" : t.textSecondary, cursor: resent ? "default" : "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, width: "100%", transition: "all 0.2s" }}>
            {resent ? (tx.authVerifyResent || "✓ Email Resent") : resending ? "..." : (tx.authVerifyResend || "Resend Email")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
      <div style={s.card}>
        <div style={s.cardTitle}><span>{tx.authSignup}</span></div>
        <form onSubmit={handleSubmit}>
          <Field label={tx.authName}>
            <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" autoComplete="name" />
          </Field>
          <Field label={tx.authEmail}>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
          </Field>
          <Field label={tx.authPassword}>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" />
          </Field>
          {error && <div style={s.warnBox(danger)}><span style={{ fontSize: 12 }}>{error}</span></div>}
          <button type="submit" style={{ ...s.exportBtn, width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
            {loading ? "..." : tx.authSignup}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: t.textSecondary }}>
          {tx.authHasAccount}{" "}<span style={{ color: t.accent, cursor: "pointer" }} onClick={() => onSwitch("login")}>{tx.authLogin}</span>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1 }}>{tx.authBack}</button>
      </div>
    </div>
  );
}

function AccountView({ onClose }) {
  const { s, t, tx } = useTheme();
  const { user, subscription, isPro, signOut } = useAuth();

  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");
  const handleSubscribe = async () => {
    setSubLoading(true); setSubError("");
    try {
      const hdrs = await authHeaders();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setSubError(data.error || "Checkout failed");
    } catch (err) {
      setSubError("Could not connect to checkout");
    }
    setSubLoading(false);
  };

  const handleManage = async () => {
    const hdrs = await authHeaders();
    const res = await fetch("/api/create-portal", {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify({}),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleSignOut = () => { signOut(); onClose(); };

  return (
    <div style={{ maxWidth: 440, margin: "40px auto", padding: "0 16px" }}>
      <div style={s.card}>
        <div style={s.cardTitle}><span>{tx.authProfile}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: `${t.accent}20`, border: `2px solid ${t.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: t.accent,
          }}>
            {(user?.user_metadata?.full_name || user?.email || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>{user?.user_metadata?.full_name || ""}</div>
            <div style={{ fontSize: 12, color: t.textSecondary }}>{user?.email}</div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 3, fontSize: 10, fontWeight: 900, letterSpacing: 1.5,
            background: isPro ? `${success}20` : `${t.textSecondary}20`,
            color: isPro ? success : t.textSecondary,
            border: `1px solid ${isPro ? `${success}40` : `${t.textSecondary}30`}`,
          }}>{isPro ? tx.authProBadge : tx.authFreeBadge}</span>
        </div>

        {!isPro && (
          <div style={{
            background: `${t.accent}08`, border: `1px solid ${t.accent}30`, borderRadius: 6,
            padding: 20, marginBottom: 20, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, marginBottom: 4 }}>{tx.authSubscribe}</div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 12 }}>{tx.authProFeatures}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: t.textPrimary, marginBottom: 16 }}>{tx.authPrice}</div>
            <button style={{ ...s.exportBtn, width: "100%", justifyContent: "center" }} onClick={handleSubscribe} disabled={subLoading}>{subLoading ? "..." : tx.authSubscribe}</button>
            {subError && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 8 }}>{subError}</div>}
          </div>
        )}

        {isPro && subscription && (
          <div style={{
            background: `${success}08`, border: `1px solid ${success}30`, borderRadius: 6,
            padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>
              {subscription.cancel_at_period_end ? tx.authCanceling || "Cancels at period end" : "Active"}
            </div>
            <div style={{ fontSize: 12, color: t.textPrimary }}>
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
            <button style={{
              marginTop: 12, padding: "8px 16px", background: "none", border: `1px solid ${t.border}`,
              borderRadius: 4, color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1,
            }} onClick={handleManage}>{tx.authManage}</button>
          </div>
        )}

        <button style={{
          width: "100%", padding: "10px 0", background: "none", border: `1px solid ${t.border}`,
          borderRadius: 4, color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: 1,
        }} onClick={handleSignOut}>{tx.authLogout}</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1 }}>{tx.authBack}</button>
      </div>
    </div>
  );
}

// ── Simple Markdown Renderer ──
function MdRenderer({ source, theme: t }) {
  const elements = useMemo(() => {
    const lines = source.split("\n");
    const result = [];
    let inList = false;
    let listItems = [];
    const flushList = () => {
      if (listItems.length) {
        result.push({ type: "ul", items: [...listItems] });
        listItems = [];
      }
      inList = false;
    };
    const renderInline = (text) => {
      // Bold, inline code, then plain text
      const parts = [];
      const re = /(\*\*(.+?)\*\*|`(.+?)`)/g;
      let last = 0, m;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push({ t: "text", v: text.slice(last, m.index) });
        if (m[2]) parts.push({ t: "bold", v: m[2] });
        else if (m[3]) parts.push({ t: "code", v: m[3] });
        last = re.lastIndex;
      }
      if (last < text.length) parts.push({ t: "text", v: text.slice(last) });
      return parts;
    };
    for (const line of lines) {
      if (line.startsWith("### ")) { flushList(); result.push({ type: "h3", text: line.slice(4) }); }
      else if (line.startsWith("## ")) { flushList(); result.push({ type: "h2", text: line.slice(3) }); }
      else if (line.startsWith("# ")) { flushList(); result.push({ type: "h1", text: line.slice(2) }); }
      else if (/^[-*] /.test(line.trim())) { inList = true; listItems.push(renderInline(line.trim().slice(2))); }
      else if (/^\d+\.\s/.test(line.trim())) { inList = true; listItems.push(renderInline(line.trim().replace(/^\d+\.\s/, ""))); }
      else if (line.trim() === "") { flushList(); }
      else { flushList(); result.push({ type: "p", inline: renderInline(line) }); }
    }
    flushList();
    return result;
  }, [source]);

  const inlineStyle = (parts) => parts.map((p, i) => {
    if (p.t === "bold") return <strong key={i} style={{ color: t.textPrimary, fontWeight: 700 }}>{p.v}</strong>;
    if (p.t === "code") return <code key={i} style={{ background: `${t.accent}15`, color: t.accent, padding: "1px 5px", borderRadius: 3, fontSize: "0.9em", fontFamily: "monospace" }}>{p.v}</code>;
    return <span key={i}>{p.v}</span>;
  });

  return (
    <div style={{ lineHeight: 1.7, fontSize: 13, color: t.textSecondary }}>
      {elements.map((el, i) => {
        if (el.type === "h1") return <h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: t.accent, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px", fontFamily: "inherit", borderBottom: `2px solid ${t.accent}30`, paddingBottom: 10 }}>{el.text}</h1>;
        if (el.type === "h2") return <h2 key={i} style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, letterSpacing: 1.5, textTransform: "uppercase", margin: "24px 0 10px", fontFamily: "inherit" }}>{el.text}</h2>;
        if (el.type === "h3") return <h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: t.accent, margin: "16px 0 6px", fontFamily: "inherit" }}>{el.text}</h3>;
        if (el.type === "p") return <p key={i} style={{ margin: "0 0 10px" }}>{inlineStyle(el.inline)}</p>;
        if (el.type === "ul") return <ul key={i} style={{ margin: "0 0 12px", paddingLeft: 20 }}>{el.items.map((item, j) => <li key={j} style={{ marginBottom: 4 }}>{inlineStyle(item)}</li>)}</ul>;
        return null;
      })}
    </div>
  );
}

// ── Knowledge Base Articles ──
const KB_ARTICLES = [
  { id: "getting-started", icon: "🚀", source: kbGettingStarted },
  { id: "point-load", icon: "⚙", source: kbPointLoad },
  { id: "pull-sheet", icon: "📋", source: kbPullSheet },
  { id: "bridle-calc", icon: "△", source: kbBridleCalc },
  { id: "markout", icon: "📐", source: kbMarkout },
];

function KBDrawer({ open, onClose }) {
  const { s, t, tx } = useTheme();
  const [articleId, setArticleId] = useState(null);
  const drawerRef = useRef(null);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // Reset to list when closing
  useEffect(() => { if (!open) setArticleId(null); }, [open]);

  const article = articleId ? KB_ARTICLES.find(a => a.id === articleId) : null;
  // Extract title from first line of markdown
  const getTitle = (src) => src.split("\n")[0].replace(/^#+\s*/, "");
  // Extract first paragraph as description
  const getDesc = (src) => {
    const lines = src.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    return lines[0]?.slice(0, 100) + (lines[0]?.length > 100 ? "..." : "") || "";
  };

  const i18n = {
    title: tx.kbTitle || "Knowledge Base",
    back: tx.kbBack || "All Articles",
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, transition: "opacity 0.3s" }} />}
      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: "fixed", top: 0, right: open ? 0 : -420, width: 400, maxWidth: "90vw", height: "100vh",
        background: t.surface, borderLeft: `2px solid ${t.border}`, zIndex: 9999,
        transition: "right 0.3s ease", display: "flex", flexDirection: "column",
        boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.4)" : "none",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {article && (
              <button onClick={() => setArticleId(null)} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: 0 }}>
                ← {i18n.back}
              </button>
            )}
            {!article && <span style={{ fontSize: 14, fontWeight: 800, color: t.textPrimary, letterSpacing: 2, textTransform: "uppercase", fontFamily: "inherit" }}>{i18n.title}</span>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: 20, padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {!article ? (
            // Article list
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {KB_ARTICLES.map(a => (
                <button key={a.id} onClick={() => setArticleId(a.id)} style={{
                  background: `${t.accent}08`, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 16px",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, width: 32, textAlign: "center" }}>{a.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginBottom: 3, letterSpacing: 0.5 }}>{getTitle(a.source)}</div>
                    <div style={{ fontSize: 11, color: t.textSecondary, lineHeight: 1.4 }}>{getDesc(a.source)}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Article view
            <MdRenderer source={article.source} theme={t} />
          )}
        </div>
      </div>
    </>
  );
}

function PaywallGate({ children, onAuthView }) {
  const { s, t, tx } = useTheme();
  const { user, isPro, loading } = useAuth();

  if (loading) return <div style={{ ...s.card, ...s.empty }}><div style={{ fontSize: 14 }}>Loading...</div></div>;
  if (isPro) return children;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(3px)", opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 60, zIndex: 10,
      }}>
        <div style={{
          ...s.card, maxWidth: 400, textAlign: "center",
          background: t.surface, border: `2px solid ${t.accent}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6)`, marginBottom: 0,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.8 }}>&#128274;</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.accent, marginBottom: 8, letterSpacing: 1 }}>{tx.authSubscribe}</div>
          <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 16 }}>{tx.authProFeatures}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: t.textPrimary, marginBottom: 20 }}>{tx.authPrice}</div>
          {!user ? (
            <button style={{ ...s.exportBtn, width: "100%", justifyContent: "center" }} onClick={() => onAuthView("login")}>{tx.authLogin}</button>
          ) : (
            <button style={{ ...s.exportBtn, width: "100%", justifyContent: "center" }} onClick={async (e) => {
              const btn = e.currentTarget;
              btn.disabled = true; btn.textContent = "...";
              try {
                const hdrs = await authHeaders();
                const res = await fetch("/api/create-checkout", {
                  method: "POST",
                  headers: hdrs,
                  body: JSON.stringify({}),
                });
                const text = await res.text();
                let data;
                try { data = JSON.parse(text); } catch { alert("Server error: " + text.slice(0, 200)); btn.disabled = false; btn.textContent = tx.authSubscribe; return; }
                if (data.url) { window.location.href = data.url; return; }
                alert(data.error || "Checkout failed. Please try again.");
              } catch (err) {
                alert("Network error: " + err.message);
              }
              btn.disabled = false; btn.textContent = tx.authSubscribe;
            }}>{tx.authSubscribe}</button>
          )}
          {!user && (
            <div style={{ marginTop: 12, fontSize: 11, color: t.textSecondary }}>
              {tx.authNoAccount}{" "}
              <span style={{ color: t.accent, cursor: "pointer" }} onClick={() => onAuthView("signup")}>{tx.authSignup}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENUE DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

const VENUE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' fill='%231A1A1A'%3E%3Crect width='400' height='200'/%3E%3Ctext x='200' y='90' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%233A3A3A'%3E%F0%9F%8F%9F%3C/text%3E%3Ctext x='200' y='130' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%235A5A5A'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const VENUE_TYPE_COLORS={stadium:"#EF4444",arena:"#F59E0B",theatre:"#8B5CF6",amphitheatre:"#22C55E",convention_center:"#3B82F6",ballroom:"#EC4899",club:"#F97316",outdoor:"#10B981",other:"#6B7280"};
const VENUE_TYPE_LABELS={stadium:"Stadium",arena:"Arena",theatre:"Theatre",amphitheatre:"Amphitheatre",convention_center:"Convention Ctr",ballroom:"Ballroom",club:"Club",outdoor:"Outdoor",other:"Other"};

function VenueCard({venue,onClick}){
  const{s,t}=useTheme();
  const typeColor=VENUE_TYPE_COLORS[venue.venue_type]||t.textSecondary;
  return(
    <div onClick={onClick} style={{...s.card,cursor:"pointer",padding:0,overflow:"hidden",transition:"border-color .2s",marginBottom:0}} onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
      <div style={{position:"relative"}}>
        <img src={venue.image_url||VENUE_PLACEHOLDER} alt={venue.name} style={{width:"100%",height:140,objectFit:"cover",display:"block",background:t.surface}}/>
        {venue.venue_type&&<span style={{position:"absolute",top:8,right:8,fontSize:8,fontWeight:800,background:typeColor,color:"#fff",padding:"2px 8px",borderRadius:3,textTransform:"uppercase",letterSpacing:1}}>{VENUE_TYPE_LABELS[venue.venue_type]||venue.venue_type}</span>}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:14,fontWeight:700,color:t.textPrimary,marginBottom:4}}>{venue.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:11,color:t.textSecondary}}>{[venue.city,venue.state,venue.country].filter(Boolean).join(", ")}</div>
          {venue.capacity&&<div style={{fontSize:10,color:t.textSecondary}}>{venue.capacity.toLocaleString()} cap</div>}
        </div>
      </div>
    </div>
  );
}

function VenueList({venues,search,setSearch,typeFilter,setTypeFilter,loading,onSelect,onSubmitNew}){
  const{s,t,tx}=useTheme();
  const{user,isPro}=useAuth();
  const types=["","stadium","arena","theatre","amphitheatre","convention_center","ballroom","club","outdoor"];
  return(
    <div style={{maxWidth:1000,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:12,flexWrap:"wrap"}}>
        <div style={{fontSize:16,fontWeight:700,color:t.accent,letterSpacing:1,textTransform:"uppercase"}}>{tx.vnTitle}</div>
        {user&&isPro&&<button style={{...s.exportBtn,fontSize:11}} onClick={onSubmitNew}>{tx.vnSubmitNew}</button>}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...s.input,flex:1,minWidth:200}} value={search} onChange={e=>setSearch(e.target.value)} placeholder={tx.vnSearch}/>
        <select style={{...s.input,maxWidth:180}} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {types.filter(Boolean).map(tp=><option key={tp} value={tp}>{VENUE_TYPE_LABELS[tp]}</option>)}
        </select>
      </div>
      {loading?(
        <div style={{...s.card,textAlign:"center",padding:40}}><div style={{fontSize:13,color:t.textSecondary}}>{tx.vnLoading}</div></div>
      ):venues.length===0?(
        <div style={{...s.card,textAlign:"center",padding:40}}><div style={{fontSize:13,color:t.textSecondary}}>{tx.vnNoResults}</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {venues.map(v=><VenueCard key={v.id} venue={v} onClick={()=>onSelect(v)}/>)}
        </div>
      )}
    </div>
  );
}

function VenueDetailRow({label,value}){
  const{t}=useTheme();
  if(!value&&value!==0)return null;
  return <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}22`}}><span style={{fontSize:12,color:t.textSecondary}}>{label}</span><span style={{fontSize:12,color:t.textPrimary,fontWeight:600}}>{value}</span></div>;
}

function VenueDetail({venue,onBack,onSuggestEdit}){
  const{s,t,tx,setAuthView}=useTheme();
  const{user,isPro}=useAuth();
  const[techPacks,setTechPacks]=useState([]);
  const[uploading,setUploading]=useState(false);
  const rigLabels={counterweight:tx.vnRigCounterweight,"dead-hang":tx.vnRigDeadHang,automated:tx.vnRigAutomated,mixed:tx.vnRigMixed};
  const gridLabels={fixed:tx.vnGridFixed,variable:tx.vnGridVariable};
  const typeLabels={stadium:"Stadium",arena:"Arena",theatre:"Theatre",amphitheatre:"Amphitheatre",convention_center:"Convention Center",ballroom:"Ballroom",club:"Club",outdoor:"Outdoor",other:"Other"};
  const attachLabels={beam_clamp:"Beam Clamp",wrap_basket:"Wrap/Basket",stinger:"Stinger",dead_hang:"Dead Hang",bridle:"Bridle",mixed:"Mixed"};
  const isArenaOrStadium=venue.venue_type==="arena"||venue.venue_type==="stadium";

  useEffect(()=>{
    supabase.from("venue_tech_packs").select("*").eq("venue_id",venue.id).order("upload_date",{ascending:false})
      .then(({data})=>setTechPacks(data||[]));
  },[venue.id]);

  const uploadTechPack=async(file)=>{
    if(!file||!user)return;
    setUploading(true);
    try{
      const ext=file.name.split(".").pop();
      const path=`${venue.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const{error:upErr}=await supabase.storage.from("venue-techpacks").upload(path,file,{contentType:file.type});
      if(upErr)throw upErr;
      const{data:{publicUrl}}=supabase.storage.from("venue-techpacks").getPublicUrl(path);
      await supabase.from("venue_tech_packs").insert({venue_id:venue.id,uploaded_by:user.id,file_name:file.name,file_url:publicUrl,file_size_bytes:file.size,description:""});
      const{data}=await supabase.from("venue_tech_packs").select("*").eq("venue_id",venue.id).order("upload_date",{ascending:false});
      setTechPacks(data||[]);
    }catch(e){alert("Upload failed: "+e.message);}
    setUploading(false);
  };

  const Section=({title,children,show=true})=>{if(!show)return null;return<div style={s.card}><div style={s.cardTitle}><span>{title}</span></div>{children}</div>;};

  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:t.accent,cursor:"pointer",fontSize:12,fontWeight:600,padding:"8px 0",marginBottom:8,fontFamily:"inherit"}}>&#8592; {tx.vnBack}</button>
      <div style={s.card}>
        <img src={venue.image_url||VENUE_PLACEHOLDER} alt={venue.name} style={{width:"100%",height:220,objectFit:"cover",borderRadius:4,marginBottom:16,display:"block",background:t.surface}}/>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
          <div style={{fontSize:18,fontWeight:700,color:t.textPrimary}}>{venue.name}</div>
          {venue.venue_type&&<span style={{fontSize:9,fontWeight:700,background:`${t.accent}20`,color:t.accent,padding:"2px 8px",borderRadius:3,textTransform:"uppercase",letterSpacing:1}}>{typeLabels[venue.venue_type]||venue.venue_type}</span>}
        </div>
        <div style={{fontSize:12,color:t.textSecondary,marginBottom:4}}>{[venue.city,venue.state,venue.country].filter(Boolean).join(", ")}</div>
        {venue.capacity&&<div style={{fontSize:11,color:t.textSecondary}}>Capacity: {venue.capacity.toLocaleString()}</div>}
      </div>
      <PaywallGate onAuthView={setAuthView}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Section title={tx.vnContact} show={!!(venue.contact_name||venue.contact_phone||venue.contact_email||venue.website)}>
            <VenueDetailRow label={tx.vnContactName} value={venue.contact_name}/>
            <VenueDetailRow label={tx.vnContactPhone} value={venue.contact_phone}/>
            <VenueDetailRow label={tx.vnContactEmail} value={venue.contact_email}/>
            <VenueDetailRow label={tx.vnWebsite} value={venue.website}/>
          </Section>
          <Section title={tx.vnLoadingDock} show={!!(venue.dock_description||venue.dock_restrictions||venue.dock_height_ft||venue.dock_truck_access)}>
            <VenueDetailRow label={tx.vnDockDesc} value={venue.dock_description}/>
            <VenueDetailRow label={tx.vnDockRestrictions} value={venue.dock_restrictions}/>
            <VenueDetailRow label={tx.vnDockHeight} value={venue.dock_height_ft}/>
            <VenueDetailRow label={tx.vnTruckAccess} value={venue.dock_truck_access}/>
            <VenueDetailRow label="Freight Elevator" value={venue.freight_elevator?"Yes":"No"}/>
            {venue.freight_elevator&&<>
              <VenueDetailRow label="Elevator Dimensions" value={venue.freight_elevator_dimensions}/>
              <VenueDetailRow label="Elevator Capacity (lbs)" value={venue.freight_elevator_capacity_lbs}/>
            </>}
          </Section>
          <Section title={tx.vnStageDims} show={!!(venue.stage_width_ft||venue.stage_depth_ft||venue.proscenium_height_ft||venue.grid_height_ft||venue.wing_space_ft)}>
            <VenueDetailRow label={tx.vnStageWidth} value={venue.stage_width_ft}/>
            <VenueDetailRow label={tx.vnStageDepth} value={venue.stage_depth_ft}/>
            <VenueDetailRow label={tx.vnProscHeight} value={venue.proscenium_height_ft}/>
            <VenueDetailRow label={tx.vnGridHeight} value={venue.grid_height_ft}/>
            <VenueDetailRow label={tx.vnWingSpace} value={venue.wing_space_ft}/>
          </Section>
          {isArenaOrStadium&&<Section title="Floor / Field Dimensions" show={!!(venue.floor_length_ft||venue.floor_width_ft||venue.floor_type||venue.floor_load_capacity_psf)}>
            <VenueDetailRow label="Floor Length (ft)" value={venue.floor_length_ft}/>
            <VenueDetailRow label="Floor Width (ft)" value={venue.floor_width_ft}/>
            <VenueDetailRow label="Floor Type" value={venue.floor_type}/>
            <VenueDetailRow label="Floor Load Capacity (PSF)" value={venue.floor_load_capacity_psf}/>
          </Section>}
          {isArenaOrStadium&&<Section title="Vomitory / Floor Access" show={!!(venue.vomitory_count||venue.vomitory_details||venue.floor_access_description)}>
            <VenueDetailRow label="Vom Count" value={venue.vomitory_count}/>
            <VenueDetailRow label="Vom Width (ft)" value={venue.vomitory_width_ft}/>
            <VenueDetailRow label="Vom Height (ft)" value={venue.vomitory_height_ft}/>
            {venue.vomitory_details&&<div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap",marginTop:8}}>{venue.vomitory_details}</div>}
            {venue.floor_access_description&&<><VenueDetailRow label="Floor Access"/><div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap",marginTop:4}}>{venue.floor_access_description}</div></>}
          </Section>}
          <Section title={tx.vnSteelGrid} show={!!(venue.grid_type||venue.grid_capacity_total_lbs||venue.rigging_type||venue.num_line_sets||venue.steel_type||venue.attachment_type)}>
            <VenueDetailRow label={tx.vnGridType} value={gridLabels[venue.grid_type]||venue.grid_type}/>
            <VenueDetailRow label={tx.vnGridCapTotal} value={venue.grid_capacity_total_lbs}/>
            <VenueDetailRow label={tx.vnGridCapPerPoint} value={venue.grid_capacity_per_point_lbs}/>
            <VenueDetailRow label={tx.vnGridSpacing} value={venue.grid_spacing_ft}/>
            <VenueDetailRow label={tx.vnTrimLow} value={venue.trim_height_low_ft}/>
            <VenueDetailRow label={tx.vnTrimHigh} value={venue.trim_height_high_ft}/>
            <VenueDetailRow label={tx.vnNumLineSets} value={venue.num_line_sets}/>
            <VenueDetailRow label={tx.vnRiggingType} value={rigLabels[venue.rigging_type]||venue.rigging_type}/>
            <VenueDetailRow label="Steel Type" value={venue.steel_type}/>
            <VenueDetailRow label="Steel Manufacturer" value={venue.steel_manufacturer}/>
            <VenueDetailRow label="Beam Spacing (ft)" value={venue.beam_spacing_ft}/>
            <VenueDetailRow label="Beam Orientation" value={venue.beam_orientation}/>
            <VenueDetailRow label="Attachment Type" value={attachLabels[venue.attachment_type]||venue.attachment_type}/>
            <VenueDetailRow label="Chain Hoist Inventory" value={venue.chain_hoist_inventory}/>
            {venue.house_rigging_notes&&<div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap",marginTop:8,borderTop:`1px solid ${t.border}22`,paddingTop:8}}>{venue.house_rigging_notes}</div>}
          </Section>
          <Section title="Rigging Labor" show={!!(venue.iatse_local||venue.rigging_labor_provider||venue.rigging_labor_contact)}>
            <VenueDetailRow label="IATSE Local" value={venue.iatse_local}/>
            <VenueDetailRow label="Rigging Provider" value={venue.rigging_labor_provider}/>
            <VenueDetailRow label="Contact" value={venue.rigging_labor_contact}/>
            <VenueDetailRow label="Phone" value={venue.rigging_labor_phone}/>
            <VenueDetailRow label="Email" value={venue.rigging_labor_email}/>
            {venue.rigging_labor_notes&&<div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap",marginTop:8}}>{venue.rigging_labor_notes}</div>}
          </Section>
          <Section title="Stagehands" show={!!(venue.stagehand_provider||venue.stagehand_contact)}>
            <VenueDetailRow label="Provider" value={venue.stagehand_provider}/>
            <VenueDetailRow label="Contact" value={venue.stagehand_contact}/>
            <VenueDetailRow label="Phone" value={venue.stagehand_phone}/>
            <VenueDetailRow label="Email" value={venue.stagehand_email}/>
            <VenueDetailRow label="Minimum Call (hrs)" value={venue.stagehand_min_call}/>
            {venue.stagehand_notes&&<div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap",marginTop:8}}>{venue.stagehand_notes}</div>}
          </Section>
          <Section title="Tech Packs" show={true}>
            {techPacks.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {techPacks.map(tp=>(
                  <div key={tp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.border}22`}}>
                    <a href={tp.file_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:t.accent,textDecoration:"underline"}}>{tp.file_name}</a>
                    <span style={{fontSize:10,color:t.textSecondary}}>{new Date(tp.upload_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ):(
              <div style={{fontSize:12,color:t.textSecondary}}>No tech packs uploaded yet</div>
            )}
            {venue.tech_pack_url&&!techPacks.length&&<a href={venue.tech_pack_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:t.accent,textDecoration:"underline",marginTop:8,display:"block"}}>{tx.vnDownloadTechPack}</a>}
            {user&&<div style={{marginTop:12}}>
              <label style={{display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:11,color:t.accent,fontWeight:600}}>
                {uploading?"Uploading...":"Upload Tech Pack"}
                <input type="file" accept=".pdf,.dwg,.dxf" style={{display:"none"}} disabled={uploading} onChange={e=>{if(e.target.files[0])uploadTechPack(e.target.files[0]);}}/>
              </label>
            </div>}
          </Section>
          {venue.notes&&<Section title={tx.vnNotes}><div style={{fontSize:12,color:t.textSecondary,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{venue.notes}</div></Section>}
          {isPro&&<button style={{...s.exportBtn,justifyContent:"center"}} onClick={()=>onSuggestEdit(venue)}>{tx.vnSuggestEdit}</button>}
        </div>
      </PaywallGate>
    </div>
  );
}

function VenueSubmitForm({editVenue,onBack,onSubmitted}){
  const{s,t,tx}=useTheme();
  const defaultFields={name:"",city:"",state:"",country:"US",venue_type:"",capacity:"",contact_name:"",contact_phone:"",contact_email:"",website:"",dock_description:"",dock_restrictions:"",dock_height_ft:"",dock_truck_access:"",freight_elevator:false,freight_elevator_dimensions:"",freight_elevator_capacity_lbs:"",stage_width_ft:"",stage_depth_ft:"",proscenium_height_ft:"",grid_height_ft:"",wing_space_ft:"",floor_length_ft:"",floor_width_ft:"",floor_type:"",floor_load_capacity_psf:"",vomitory_count:"",vomitory_width_ft:"",vomitory_height_ft:"",vomitory_details:"",floor_access_description:"",grid_type:"",grid_capacity_total_lbs:"",grid_capacity_per_point_lbs:"",grid_spacing_ft:"",trim_height_low_ft:"",trim_height_high_ft:"",num_line_sets:"",rigging_type:"",steel_type:"",steel_manufacturer:"",beam_spacing_ft:"",beam_orientation:"",attachment_type:"",chain_hoist_inventory:"",house_rigging_notes:"",iatse_local:"",rigging_labor_provider:"",rigging_labor_contact:"",rigging_labor_phone:"",rigging_labor_email:"",rigging_labor_notes:"",stagehand_provider:"",stagehand_contact:"",stagehand_phone:"",stagehand_email:"",stagehand_min_call:"",stagehand_notes:"",notes:""};
  const[form,setForm]=useState(()=>{
    if(editVenue){const f={};Object.keys(defaultFields).forEach(k=>{f[k]=editVenue[k]||defaultFields[k];});return f;}
    return{...defaultFields};
  });
  const[techPackFile,setTechPackFile]=useState(null);
  const[status,setStatus]=useState("idle"); // idle|submitting|done|error
  const[error,setError]=useState("");

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!form.name||!form.city||!form.country){setError(tx.vnRequired+": "+tx.vnName+", "+tx.vnCity+", "+tx.vnCountry);return;}
    setStatus("submitting");setError("");
    try{
      let techPackPath=null;
      if(techPackFile){
        const ext=techPackFile.name.split(".").pop();
        const path=`${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const{error:upErr}=await supabase.storage.from("venue-techpacks").upload(path,techPackFile,{contentType:"application/pdf"});
        if(upErr)throw new Error("Upload failed: "+upErr.message);
        const{data:{publicUrl}}=supabase.storage.from("venue-techpacks").getPublicUrl(path);
        techPackPath=publicUrl;
      }
      const hdrs=await authHeaders();
      const res=await fetch("/api/venue-submit",{method:"POST",headers:hdrs,body:JSON.stringify({submission_type:editVenue?"edit":"new",venue_id:editVenue?.id||null,data:{...form,tech_pack_url:techPackPath||editVenue?.tech_pack_url||null}})});
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"Submit failed");}
      setStatus("done");
    }catch(err){setError(err.message);setStatus("error");}
  };

  const gridOpts=["fixed","variable"];
  const rigOpts=["counterweight","dead-hang","automated","mixed"];
  const gridLabels={fixed:tx.vnGridFixed,variable:tx.vnGridVariable};
  const rigLabels={counterweight:tx.vnRigCounterweight,"dead-hang":tx.vnRigDeadHang,automated:tx.vnRigAutomated,mixed:tx.vnRigMixed};

  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:t.accent,cursor:"pointer",fontSize:12,fontWeight:600,padding:"8px 0",marginBottom:8,fontFamily:"inherit"}}>&#8592; {tx.vnBack}</button>
      <div style={s.card}>
        <div style={s.cardTitle}><span>{editVenue?tx.vnSubmitEditTitle:tx.vnSubmitTitle}</span></div>
        {status==="done"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:28,marginBottom:8}}>&#10003;</div>
            <div style={{fontSize:13,color:t.textPrimary,marginBottom:16}}>{tx.vnSubmitSuccess}</div>
            <button style={{...s.exportBtn,justifyContent:"center"}} onClick={onSubmitted}>{tx.vnBack}</button>
          </div>
        ):(
          <form onSubmit={handleSubmit}>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:8}}>General</div>
            <div style={s.g2}>
              <Field label={tx.vnName+"*"}><input style={s.input} value={form.name} onChange={e=>upd("name",e.target.value)}/></Field>
              <Field label="Venue Type"><select style={s.input} value={form.venue_type} onChange={e=>upd("venue_type",e.target.value)}><option value="">Select…</option>{["stadium","arena","theatre","amphitheatre","convention_center","ballroom","club","outdoor","other"].map(o=><option key={o} value={o}>{VENUE_TYPE_LABELS[o]}</option>)}</select></Field>
              <Field label={tx.vnCity+"*"}><input style={s.input} value={form.city} onChange={e=>upd("city",e.target.value)}/></Field>
              <Field label={tx.vnState}><input style={s.input} value={form.state} onChange={e=>upd("state",e.target.value)}/></Field>
              <Field label={tx.vnCountry+"*"}><input style={s.input} value={form.country} onChange={e=>upd("country",e.target.value)}/></Field>
              <Field label="Capacity"><input style={s.input} type="number" value={form.capacity} onChange={e=>upd("capacity",e.target.value)}/></Field>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnContact}</div>
            <div style={s.g2}>
              <Field label={tx.vnContactName}><input style={s.input} value={form.contact_name} onChange={e=>upd("contact_name",e.target.value)}/></Field>
              <Field label={tx.vnContactPhone}><input style={s.input} value={form.contact_phone} onChange={e=>upd("contact_phone",e.target.value)}/></Field>
              <Field label={tx.vnContactEmail}><input style={s.input} type="email" value={form.contact_email} onChange={e=>upd("contact_email",e.target.value)}/></Field>
              <Field label={tx.vnWebsite}><input style={s.input} value={form.website} onChange={e=>upd("website",e.target.value)}/></Field>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnLoadingDock}</div>
            <div style={s.g2}>
              <Field label={tx.vnDockDesc}><input style={s.input} value={form.dock_description} onChange={e=>upd("dock_description",e.target.value)}/></Field>
              <Field label={tx.vnDockRestrictions}><input style={s.input} value={form.dock_restrictions} onChange={e=>upd("dock_restrictions",e.target.value)}/></Field>
              <Field label={tx.vnDockHeight}><input style={s.input} type="number" value={form.dock_height_ft} onChange={e=>upd("dock_height_ft",e.target.value)}/></Field>
              <Field label={tx.vnTruckAccess}><input style={s.input} value={form.dock_truck_access} onChange={e=>upd("dock_truck_access",e.target.value)}/></Field>
            </div>
            <div style={s.g2}>
              <Field label="Freight Elevator"><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={form.freight_elevator} onChange={e=>upd("freight_elevator",e.target.checked)} style={{width:16,height:16,accentColor:t.accent}}/><span style={{fontSize:12,color:t.textSecondary}}>Has freight elevator</span></label></Field>
              {form.freight_elevator&&<><Field label="Elevator Dimensions"><input style={s.input} placeholder="e.g. 8'W x 12'D x 10'H" value={form.freight_elevator_dimensions} onChange={e=>upd("freight_elevator_dimensions",e.target.value)}/></Field>
              <Field label="Elevator Capacity (lbs)"><input style={s.input} type="number" value={form.freight_elevator_capacity_lbs} onChange={e=>upd("freight_elevator_capacity_lbs",e.target.value)}/></Field></>}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnStageDims}</div>
            <div style={s.g2}>
              <Field label={tx.vnStageWidth}><input style={s.input} type="number" value={form.stage_width_ft} onChange={e=>upd("stage_width_ft",e.target.value)}/></Field>
              <Field label={tx.vnStageDepth}><input style={s.input} type="number" value={form.stage_depth_ft} onChange={e=>upd("stage_depth_ft",e.target.value)}/></Field>
              <Field label={tx.vnProscHeight}><input style={s.input} type="number" value={form.proscenium_height_ft} onChange={e=>upd("proscenium_height_ft",e.target.value)}/></Field>
              <Field label={tx.vnGridHeight}><input style={s.input} type="number" value={form.grid_height_ft} onChange={e=>upd("grid_height_ft",e.target.value)}/></Field>
              <Field label={tx.vnWingSpace}><input style={s.input} type="number" value={form.wing_space_ft} onChange={e=>upd("wing_space_ft",e.target.value)}/></Field>
            </div>
            {(form.venue_type==="arena"||form.venue_type==="stadium")&&<>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>Floor / Field Dimensions</div>
            <div style={s.g2}>
              <Field label="Floor Length (ft)"><input style={s.input} type="number" value={form.floor_length_ft} onChange={e=>upd("floor_length_ft",e.target.value)}/></Field>
              <Field label="Floor Width (ft)"><input style={s.input} type="number" value={form.floor_width_ft} onChange={e=>upd("floor_width_ft",e.target.value)}/></Field>
              <Field label="Floor Type"><input style={s.input} placeholder="e.g. Concrete, Sport Court" value={form.floor_type} onChange={e=>upd("floor_type",e.target.value)}/></Field>
              <Field label="Floor Load Capacity (PSF)"><input style={s.input} type="number" value={form.floor_load_capacity_psf} onChange={e=>upd("floor_load_capacity_psf",e.target.value)}/></Field>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>Vomitory / Floor Access</div>
            <div style={s.g2}>
              <Field label="Vom Count"><input style={s.input} type="number" value={form.vomitory_count} onChange={e=>upd("vomitory_count",e.target.value)}/></Field>
              <Field label="Vom Width (ft)"><input style={s.input} type="number" value={form.vomitory_width_ft} onChange={e=>upd("vomitory_width_ft",e.target.value)}/></Field>
              <Field label="Vom Height (ft)"><input style={s.input} type="number" value={form.vomitory_height_ft} onChange={e=>upd("vomitory_height_ft",e.target.value)}/></Field>
            </div>
            <Field label="Vomitory Details"><textarea style={{...s.input,minHeight:60,resize:"vertical"}} placeholder="Describe vom locations, restrictions..." value={form.vomitory_details} onChange={e=>upd("vomitory_details",e.target.value)}/></Field>
            <Field label="Floor Access Description"><textarea style={{...s.input,minHeight:60,resize:"vertical"}} placeholder="Drive-on access, ramps, tunnel access..." value={form.floor_access_description} onChange={e=>upd("floor_access_description",e.target.value)}/></Field>
            </>}
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnSteelGrid}</div>
            <Field label={tx.vnGridType}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{gridOpts.map(o=><button type="button" key={o} style={s.chip(form.grid_type===o)} onClick={()=>upd("grid_type",o)}>{gridLabels[o]}</button>)}</div></Field>
            <div style={s.g2}>
              <Field label={tx.vnGridCapTotal}><input style={s.input} type="number" value={form.grid_capacity_total_lbs} onChange={e=>upd("grid_capacity_total_lbs",e.target.value)}/></Field>
              <Field label={tx.vnGridCapPerPoint}><input style={s.input} type="number" value={form.grid_capacity_per_point_lbs} onChange={e=>upd("grid_capacity_per_point_lbs",e.target.value)}/></Field>
              <Field label={tx.vnGridSpacing}><input style={s.input} type="number" value={form.grid_spacing_ft} onChange={e=>upd("grid_spacing_ft",e.target.value)}/></Field>
              <Field label={tx.vnTrimLow}><input style={s.input} type="number" value={form.trim_height_low_ft} onChange={e=>upd("trim_height_low_ft",e.target.value)}/></Field>
              <Field label={tx.vnTrimHigh}><input style={s.input} type="number" value={form.trim_height_high_ft} onChange={e=>upd("trim_height_high_ft",e.target.value)}/></Field>
              <Field label={tx.vnNumLineSets}><input style={s.input} type="number" value={form.num_line_sets} onChange={e=>upd("num_line_sets",e.target.value)}/></Field>
            </div>
            <Field label={tx.vnRiggingType}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{rigOpts.map(o=><button type="button" key={o} style={s.chip(form.rigging_type===o)} onClick={()=>upd("rigging_type",o)}>{rigLabels[o]}</button>)}</div></Field>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>Steel Details</div>
            <div style={s.g2}>
              <Field label="Steel Type"><input style={s.input} placeholder="e.g. I-beam, Box truss" value={form.steel_type} onChange={e=>upd("steel_type",e.target.value)}/></Field>
              <Field label="Steel Manufacturer"><input style={s.input} value={form.steel_manufacturer} onChange={e=>upd("steel_manufacturer",e.target.value)}/></Field>
              <Field label="Beam Spacing (ft)"><input style={s.input} type="number" value={form.beam_spacing_ft} onChange={e=>upd("beam_spacing_ft",e.target.value)}/></Field>
              <Field label="Beam Orientation"><input style={s.input} placeholder="e.g. N-S, E-W, Radial" value={form.beam_orientation} onChange={e=>upd("beam_orientation",e.target.value)}/></Field>
            </div>
            <Field label="Attachment Type"><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["beam_clamp","wrap_basket","stinger","dead_hang","bridle","mixed"].map(o=><button type="button" key={o} style={s.chip(form.attachment_type===o)} onClick={()=>upd("attachment_type",o)}>{{beam_clamp:"Beam Clamp",wrap_basket:"Wrap/Basket",stinger:"Stinger",dead_hang:"Dead Hang",bridle:"Bridle",mixed:"Mixed"}[o]}</button>)}</div></Field>
            <div style={s.g2}>
              <Field label="Chain Hoist Inventory"><input style={s.input} placeholder="e.g. 40x 1-ton CM Lodestar" value={form.chain_hoist_inventory} onChange={e=>upd("chain_hoist_inventory",e.target.value)}/></Field>
            </div>
            <Field label="House Rigging Notes"><textarea style={{...s.input,minHeight:60,resize:"vertical"}} value={form.house_rigging_notes} onChange={e=>upd("house_rigging_notes",e.target.value)}/></Field>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>Rigging Labor</div>
            <div style={s.g2}>
              <Field label="IATSE Local"><input style={s.input} placeholder="e.g. IATSE Local 1" value={form.iatse_local} onChange={e=>upd("iatse_local",e.target.value)}/></Field>
              <Field label="Rigging Provider"><input style={s.input} value={form.rigging_labor_provider} onChange={e=>upd("rigging_labor_provider",e.target.value)}/></Field>
              <Field label="Contact Name"><input style={s.input} value={form.rigging_labor_contact} onChange={e=>upd("rigging_labor_contact",e.target.value)}/></Field>
              <Field label="Phone"><input style={s.input} value={form.rigging_labor_phone} onChange={e=>upd("rigging_labor_phone",e.target.value)}/></Field>
              <Field label="Email"><input style={s.input} type="email" value={form.rigging_labor_email} onChange={e=>upd("rigging_labor_email",e.target.value)}/></Field>
            </div>
            <Field label="Rigging Labor Notes"><textarea style={{...s.input,minHeight:60,resize:"vertical"}} value={form.rigging_labor_notes} onChange={e=>upd("rigging_labor_notes",e.target.value)}/></Field>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>Stagehands</div>
            <div style={s.g2}>
              <Field label="Stagehand Provider"><input style={s.input} value={form.stagehand_provider} onChange={e=>upd("stagehand_provider",e.target.value)}/></Field>
              <Field label="Contact Name"><input style={s.input} value={form.stagehand_contact} onChange={e=>upd("stagehand_contact",e.target.value)}/></Field>
              <Field label="Phone"><input style={s.input} value={form.stagehand_phone} onChange={e=>upd("stagehand_phone",e.target.value)}/></Field>
              <Field label="Email"><input style={s.input} type="email" value={form.stagehand_email} onChange={e=>upd("stagehand_email",e.target.value)}/></Field>
              <Field label="Minimum Call (hrs)"><input style={s.input} type="number" value={form.stagehand_min_call} onChange={e=>upd("stagehand_min_call",e.target.value)}/></Field>
            </div>
            <Field label="Stagehand Notes"><textarea style={{...s.input,minHeight:60,resize:"vertical"}} value={form.stagehand_notes} onChange={e=>upd("stagehand_notes",e.target.value)}/></Field>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnTechPack}</div>
            <Field label={tx.vnUploadTechPack}><input type="file" accept=".pdf,.dwg,.dxf" onChange={e=>setTechPackFile(e.target.files[0]||null)} style={{fontSize:11,color:t.textSecondary}}/></Field>
            <div style={{fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:16}}>{tx.vnNotes}</div>
            <Field label={tx.vnGeneralNotes}><textarea style={{...s.input,minHeight:80,resize:"vertical"}} value={form.notes} onChange={e=>upd("notes",e.target.value)}/></Field>
            {error&&<div style={{fontSize:12,color:"#E74C3C",marginTop:8}}>{error}</div>}
            <button type="submit" style={{...s.exportBtn,width:"100%",justifyContent:"center",marginTop:16}} disabled={status==="submitting"}>
              {status==="submitting"?tx.vnSubmitting:status==="error"?tx.vnSubmitError:tx.vnSubmit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function VenueTab(){
  const{s,t,tx}=useTheme();
  const[view,setView]=useState("list");
  const[venues,setVenues]=useState([]);
  const[selectedVenue,setSelectedVenue]=useState(null);
  const[search,setSearch]=useState("");
  const[typeFilter,setTypeFilter]=useState("");
  const[loading,setLoading]=useState(true);
  const[editVenue,setEditVenue]=useState(null);

  useEffect(()=>{
    supabase.from("venues").select("id,name,city,state,country,image_url,venue_type,capacity").eq("status","approved").order("name")
      .then(({data,error})=>{setVenues(data||[]);setLoading(false);});
  },[]);

  const filtered=venues.filter(v=>{
    const q=search.toLowerCase();
    const matchesSearch=v.name.toLowerCase().includes(q)||v.city.toLowerCase().includes(q)||(v.state||"").toLowerCase().includes(q);
    const matchesType=!typeFilter||v.venue_type===typeFilter;
    return matchesSearch&&matchesType;
  });

  const openDetail=async(venue)=>{
    const{data}=await supabase.from("venues").select("*").eq("id",venue.id).single();
    if(data){setSelectedVenue(data);setView("detail");}
  };

  if(view==="detail"&&selectedVenue)return <VenueDetail venue={selectedVenue} onBack={()=>{setSelectedVenue(null);setView("list");}} onSuggestEdit={v=>{setEditVenue(v);setView("submit");}}/>;
  if(view==="submit")return <VenueSubmitForm editVenue={editVenue} onBack={()=>{setEditVenue(null);setView("list");}} onSubmitted={()=>{setEditVenue(null);setView("list");}}/>;
  return <VenueList venues={filtered} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} loading={loading} onSelect={openDetail} onSubmitNew={()=>{setEditVenue(null);setView("submit");}}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function WYPAssist(){
  const[lang,setLang]=useState("usa");const[tab,setTab]=useState("load");
  const[waiverAccepted,setWaiverAccepted]=useState(()=>localStorage.getItem("wyp_waiver")==="1");const[waiverChecked,setWaiverChecked]=useState(false);
  const acceptWaiver=useCallback(()=>{setWaiverAccepted(true);localStorage.setItem("wyp_waiver","1");},[]);
  // Shared Pull Sheet motor state — can be set from Markout tab
  const[sharedMotors,setSharedMotors]=useState(null);
  // Auth state
  const[authView,setAuthView]=useState(null); // null | "login" | "signup" | "account" | "newpassword"
  const[checkoutMsg,setCheckoutMsg]=useState(null);
  const[kbOpen,setKbOpen]=useState(false);
  const { user, isPro, isAdmin, loading: authLoading, refreshSubscription } = useAuth();
  // Listen for password recovery event
  useEffect(()=>{
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setAuthView("newpassword");
    });
    return () => subscription.unsubscribe();
  },[]);
  // Handle checkout return
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("checkout")==="success"){
      window.history.replaceState({},"",window.location.pathname);
      setCheckoutMsg("pending");
      const poll=setInterval(()=>refreshSubscription(),2000);
      setTimeout(()=>{clearInterval(poll);setCheckoutMsg(null);},12000);
    }
    if(params.get("checkout")==="cancel"){
      window.history.replaceState({},"",window.location.pathname);
    }
  },[]);
  // Clear checkout message once subscription activates
  useEffect(()=>{if(isPro&&checkoutMsg)setCheckoutMsg(null);},[isPro,checkoutMsg]);
  const theme=THEMES[lang];const styles=mkS(theme);const tx=i18n[lang];
  const Ico=({d,sz=14})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:3,flexShrink:0}}><path d={d}/></svg>;
  const TabIcons={
    load:<Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>,
    pull:<Ico d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4"/>,
    bridle:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:3,flexShrink:0}}><path d="M12 2L2 22h20L12 2Z"/></svg>,
    markout:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:3,flexShrink:0}}><path d="M21 3L14.5 21l-3.5-8-8-3.5L21 3Z"/></svg>,
    venues:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:3,flexShrink:0}}><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>,
    admin:<Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
  };
  const tabList=[{id:"load",icon:TabIcons.load,label:tx.tabLoad},{id:"pull",icon:TabIcons.pull,label:tx.tabPull,pro:true},{id:"bridle",icon:TabIcons.bridle,label:tx.tabBridle,pro:true},{id:"markout",icon:TabIcons.markout,label:tx.tabMarkout,pro:true},{id:"venues",icon:TabIcons.venues,label:tx.tabVenues,pro:true,beta:true},...(isAdmin?[{id:"admin",icon:TabIcons.admin,label:"Admin"}]:[])];

  const ctx=useMemo(()=>({s:styles,t:theme,lang,tx,setTab,setAuthView,sharedMotors,setSharedMotors}),[lang,sharedMotors,setAuthView]);
  return(
    <ThemeCtx.Provider value={ctx}>
      <div style={styles.app}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          input:focus,select:focus{border-color:${theme.accent}!important;box-shadow:0 0 0 2px ${theme.accent}30!important}
          button:hover{opacity:0.92;filter:brightness(1.1)}button:active{transform:scale(0.97);filter:brightness(0.95)}
          input[type=number]::-webkit-inner-spin-button{opacity:1}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${theme.bg}}::-webkit-scrollbar-thumb{background:${theme.border};border-radius:3px}
          @media(max-width:900px){
            [data-r="header-inner"]{padding:14px 16px!important;gap:10px!important}
            [data-r="header-nav-wrap"] nav button{padding:8px 10px!important;font-size:9px!important;white-space:nowrap!important}
            [data-r="logo-sub"]{font-size:8px!important;letter-spacing:3px!important}
          }
          @media(max-width:768px){
            [data-r="header-inner"]{padding:12px 14px!important;gap:8px!important}
            [data-r="header-top"]{gap:8px!important}
            [data-r="header-nav-wrap"]{justify-content:center!important}
            [data-r="header-nav-wrap"] nav{flex-wrap:wrap!important;justify-content:center!important;gap:4px!important;width:100%!important}
            [data-r="header-nav-wrap"] nav button{padding:8px 8px!important;font-size:9px!important;flex:1 1 auto!important;min-width:0!important;white-space:nowrap!important}
            [data-r="lang-toggle"]{padding:6px 8px!important;font-size:9px!important}
            [data-r="auth-btn"]{padding:6px 8px!important;font-size:9px!important}
            [data-r="main-area"]{padding:16px 10px!important}
            [data-r="card"]{padding:16px 12px!important;overflow-x:hidden!important}
            [data-r="g2"]{grid-template-columns:1fr!important}
            [data-r="g3"]{grid-template-columns:1fr!important}
            [data-r="g4"]{grid-template-columns:1fr 1fr!important}
            [data-r="mo-toolbar"]{flex-direction:column!important;align-items:stretch!important}
            [data-r="mo-actions"]{flex-direction:column!important}
            [data-r="mo-actions"] button{width:100%!important;justify-content:center!important}
            [data-r="res-row"]{grid-template-columns:1fr!important}
            [data-r="custom-load-row"]{flex-wrap:wrap!important}
            [data-r="custom-load-row"] input{flex:1!important;min-width:60px!important}
            [data-r="export-row"]{flex-direction:column!important}
            [data-r="export-row"] button{width:100%!important;justify-content:center!important}
            [data-r="tbl-wrap"]{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
            [data-r="tbl-wrap"] table{min-width:600px!important}
            [data-r="logo-sub"]{font-size:7.5px!important;letter-spacing:2px!important;white-space:normal!important}
          }
          @media(max-width:480px){
            [data-r="g4"]{grid-template-columns:1fr!important}
            [data-r="header-nav-wrap"] nav button{font-size:8px!important;padding:7px 6px!important;letter-spacing:0.5px!important}
            [data-r="logo-text"]{font-size:18px!important}
            [data-r="logo-sub"]{display:none!important}
            [data-r="lang-toggle"] span:nth-child(2){display:none!important}
            [data-r="lang-toggle"]{padding:6px 8px!important}
            [data-r="auth-btn"]{padding:5px 7px!important;font-size:8px!important}
            [data-r="kb-btn"]{padding:5px 7px!important}
            [data-r="kb-btn"] svg{width:13px!important;height:13px!important}
          }
        `}</style>
        <FlagStripe theme={lang}/>
        <header style={styles.header}><div data-r="header-inner" style={styles.headerInner}>
          <div data-r="header-top" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
            <div style={styles.logo}>
              <img src="/wyp-logo-192.png" alt="WYP" style={styles.logoIcon}/>
              <div style={{minWidth:0,flex:1}}><div data-r="logo-text" style={{...styles.logoText,fontFamily:"'Orbitron',sans-serif"}}>{tx.appName}</div><div data-r="logo-sub" style={styles.logoSub}>{tx.appSub}</div></div>
            </div>
            <div data-r="header-actions" style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button data-r="lang-toggle" style={styles.langBtn(true)} onClick={()=>setLang(lang==="usa"?"pr":"usa")}>
                <span>{lang==="usa"?"🇺🇸":"🇵🇷"}</span>
                <span style={{fontSize:11}}>{lang==="usa"?"English":"Español"}</span>
              </button>
              <button data-r="kb-btn" onClick={()=>setKbOpen(true)} title={tx.kbTitle} style={{...styles.langBtn(false),padding:"7px 9px"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </button>
              {user ? (
                <button data-r="auth-btn" style={{...styles.langBtn(false),display:"flex",alignItems:"center",gap:5}} onClick={()=>setAuthView("account")}>
                  <span style={{width:22,height:22,borderRadius:"50%",background:`${theme.accent}30`,color:theme.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>
                    {(user.user_metadata?.full_name||user.email||"?")[0].toUpperCase()}
                  </span>
                  <span style={{fontSize:8,fontWeight:900,letterSpacing:1,padding:"2px 5px",borderRadius:2,background:isPro?`${success}20`:`${theme.textSecondary}20`,color:isPro?success:theme.textSecondary}}>
                    {isPro?tx.authProBadge:tx.authFreeBadge}
                  </span>
                </button>
              ) : (
                <button data-r="auth-btn" style={styles.langBtn(false)} onClick={()=>setAuthView("login")}>
                  <span style={{fontSize:11}}>{tx.authLogin}</span>
                </button>
              )}
            </div>
          </div>
          <div data-r="header-nav-wrap" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%"}}>
            <nav style={styles.nav}>{tabList.map(tb=><button key={tb.id} style={{...styles.navBtn(tab===tb.id),display:"inline-flex",alignItems:"center"}} onClick={()=>setTab(tb.id)}>
              {tb.icon}{tb.label}
              {tb.pro&&!isPro&&<span style={{fontSize:7,background:theme.accent,color:"#fff",padding:"1px 4px",borderRadius:2,marginLeft:4,fontWeight:900,letterSpacing:0.5}}>PRO</span>}
              {tb.beta&&<span style={{fontSize:7,background:"#FF8C00",color:"#fff",padding:"1px 4px",borderRadius:2,marginLeft:4,fontWeight:900,letterSpacing:0.5}}>BETA</span>}
            </button>)}</nav>
          </div>
        </div></header>
        <FlagStripe theme={lang}/>
        <main data-r="main-area" style={styles.main}>
          {checkoutMsg&&(
            <div style={{...styles.disc,background:`${success}12`,borderColor:`${success}40`,color:isPro?success:theme.textSecondary,textAlign:"center",fontWeight:600}}>
              {isPro?tx.authCheckoutSuccess:tx.authCheckoutPending}
            </div>
          )}
          {authView==="login"&&<LoginView onSwitch={setAuthView} onClose={()=>setAuthView(null)}/>}
          {authView==="signup"&&<SignupView onSwitch={setAuthView} onClose={()=>setAuthView(null)}/>}
          {authView==="account"&&<AccountView onClose={()=>setAuthView(null)}/>}
          {authView==="newpassword"&&<NewPasswordView onClose={()=>setAuthView(null)}/>}
          {!authView&&!waiverAccepted?(
            <div style={{maxWidth:680,margin:"40px auto",padding:"0 16px"}}>
              <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,padding:"32px 28px",boxShadow:"0 4px 24px rgba(0,0,0,.4)"}}>
                <div style={{textAlign:"center",marginBottom:24}}>
                  <img src="/wyp-logo-192.png" alt="WYP" style={{width:48,height:48,borderRadius:"50%",marginBottom:12}}/>
                  <div style={{fontSize:16,fontWeight:700,color:theme.accent,letterSpacing:1,textTransform:"uppercase"}}>{tx.waiverTitle}</div>
                </div>
                <div style={{fontSize:12,color:theme.textSecondary,lineHeight:1.7,display:"flex",flexDirection:"column",gap:12}}>
                  <p>{tx.waiverBody1}</p>
                  <p>{tx.waiverBody2}</p>
                  <p>{tx.waiverBody3}</p>
                  <p style={{color:danger,fontWeight:600}}>{tx.waiverBody4}</p>
                  <p style={{fontWeight:600,color:theme.text}}>{tx.waiverBody5}</p>
                  <ul style={{margin:"0 0 0 20px",display:"flex",flexDirection:"column",gap:4}}>
                    <li>{tx.waiverBullet1}</li>
                    <li>{tx.waiverBullet2}</li>
                    <li>{tx.waiverBullet3}</li>
                    <li>{tx.waiverBullet4}</li>
                  </ul>
                  <p>{tx.waiverBody6}</p>
                  <p style={{fontWeight:600}}>{tx.waiverBody7}</p>
                </div>
                <div style={{marginTop:24,padding:"16px 20px",background:theme.surfaceLight,border:`1px solid ${theme.border}`,borderRadius:6}}>
                  <div style={{fontSize:12,fontWeight:700,color:theme.text,marginBottom:10}}>{tx.waiverAgreeTitle}</div>
                  <ul style={{fontSize:11,color:theme.textSecondary,margin:"0 0 0 18px",lineHeight:1.8}}>
                    <li>{tx.waiverAgree1}</li>
                    <li>{tx.waiverAgree2}</li>
                    <li>{tx.waiverAgree3}</li>
                    <li>{tx.waiverAgree4}</li>
                  </ul>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:10,marginTop:20,cursor:"pointer",fontSize:12,color:theme.text,padding:"12px 16px",background:waiverChecked?`${theme.accent}15`:theme.surfaceLight,border:`1px solid ${waiverChecked?theme.accent:theme.border}`,borderRadius:6,transition:"all .2s"}}>
                  <input type="checkbox" checked={waiverChecked} onChange={e=>setWaiverChecked(e.target.checked)} style={{width:18,height:18,accentColor:theme.accent,cursor:"pointer"}}/>
                  <span>{tx.waiverCheckbox}</span>
                </label>
                <button disabled={!waiverChecked} onClick={acceptWaiver} style={{marginTop:16,width:"100%",padding:"14px 0",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",background:waiverChecked?theme.accent:`${theme.textSecondary}30`,color:waiverChecked?"#fff":`${theme.textSecondary}60`,border:"none",borderRadius:6,cursor:waiverChecked?"pointer":"not-allowed",transition:"all .2s"}}>{tx.waiverBtn}</button>
              </div>
            </div>
          ):!authView&&<>
          <div style={styles.disc}>{tx.disclaimer}</div>
          {tab==="load"&&<PointLoadTab/>}
          {tab==="pull"&&<PaywallGate onAuthView={setAuthView}><PullSheetTab/></PaywallGate>}
          {tab==="bridle"&&<PaywallGate onAuthView={setAuthView}><BridleTab/></PaywallGate>}
          {tab==="markout"&&<PaywallGate onAuthView={setAuthView}><MarkoutTab/></PaywallGate>}
          {tab==="venues"&&<VenueTab/>}
          {tab==="admin"&&isAdmin&&<Suspense fallback={<div style={{textAlign:"center",padding:40,color:theme.textSecondary}}>Loading admin panel…</div>}><AdminPanel/></Suspense>}
          </>}
          <footer style={{textAlign:"center",padding:"40px 20px 24px",borderTop:`1px solid ${theme.border}`,marginTop:40,background:theme.bg}}>
            <img src="/wyp-logo-192.png" alt="WYP" style={{width:32,height:32,borderRadius:"50%",marginBottom:8}}/>
            <div style={{fontSize:11,color:theme.textSecondary,letterSpacing:2,textTransform:"uppercase"}}>{tx.footer1}</div>
            <div style={{fontSize:10,color:`${theme.textSecondary}60`,marginTop:4,marginBottom:16}}>{tx.footer2}</div>
            <div style={{maxWidth:720,margin:"0 auto"}}><div style={{fontSize:9,color:`${theme.textSecondary}45`,lineHeight:1.7,textAlign:"left",padding:"16px 20px",background:theme.surface,border:`1px solid ${theme.border}60`,borderRadius:6}}>{tx.footerDisclaimer}</div></div>
          </footer>
        </main>
        <KBDrawer open={kbOpen} onClose={()=>setKbOpen(false)}/>
      </div>
    </ThemeCtx.Provider>
  );
}
