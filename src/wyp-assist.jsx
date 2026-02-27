import { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import { jsPDF } from "jspdf";
import emailjs from "@emailjs/browser";

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
  // ── Misc Hardware ──
  "RIG19-10": { name: "3 Level Cable Hanger", cat: "misc" },
  "RIGZZ-24": { name: 'Side Arm 6" Theatrical', cat: "sidearm" },
  "RIGZZ-25": { name: 'Side Arm 12" Theatrical', cat: "sidearm" },
  "RIGZZ-26": { name: 'Side Arm 18" Theatrical', cat: "sidearm" },
  "RIGZZ-G1": { name: 'Ratchet Strap 2" - Endless', cat: "misc" },
  "RIGZZ-I1": { name: "Hand Line 100'", cat: "misc" },
  "RIGZZ-I2": { name: "Sheave", cat: "misc" },
  "RIGZZ-I3": { name: "Carabiner Locking", cat: "misc" },
};

// Per-hoist auto-calculated items (keyed by catalog ID)
// For ≤1 Ton: 5/8" shackle & pear ring, 3/8" steel
// For >1 Ton: 3/4" shackle & pear ring, 1/2" steel
export const HOIST_GEAR_LIGHT = {
  "RIG10-00": { per: 7, round5: true, label: 'Shackle 5/8"' },
  "RIG10-05": { per: 1, label: 'Pear Ring 5/8" Crosby' },
  "RIG11-20": { per: 2, label: "S.T.A.C. Chain 3'" },
  "RIG10-50": { per: 2, label: 'Steel 3/8" Cable 2\'' },
  "RIG10-55": { per: 4, label: 'Steel 3/8" Cable 5\'' },
  "RIG10-60": { per: 4, label: 'Steel 3/8" Cable 10\'' },
  "RIG10-65": { per: 2, label: 'Steel 3/8" Cable 20\'' },
  "RIG11-30": { per: 2.5, roundUp: true, label: "Burlap" },
};
export const HOIST_GEAR_HEAVY = {
  "RIG17-10": { per: 7, round5: true, label: 'Shackle 3/4"' },
  "RIG17-20": { per: 1, label: 'Pear Ring 3/4"' },
  "RIG11-20": { per: 2, label: "S.T.A.C. Chain 3'" },
  "RIG17-25": { per: 2, label: 'Steel 1/2" Cable 2\'' },
  "RIG17-30": { per: 4, label: 'Steel 1/2" Cable 5\'' },
  "RIG17-40": { per: 4, label: 'Steel 1/2" Cable 10\'' },
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
      { id: "RIGZZ-24", label: 'Side Arm 6"' }, { id: "RIGZZ-25", label: 'Side Arm 12"' },
      { id: "RIGZZ-26", label: 'Side Arm 18"' },
    ],
  },
  {
    key: "misc", titleEN: "Misc Hardware", titleES: "Hardware Misceláneo",
    items: [
      { id: "RIG19-10", label: "Cable Hanger" },
      { id: "RIGZZ-G1", label: "Ratchet Strap" }, { id: "RIGZZ-I1", label: "Hand Line 100'" },
      { id: "RIGZZ-I2", label: "Sheave" }, { id: "RIGZZ-I3", label: "Carabiner" },
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
    footer1:"WYP Assist v1.0",footer2:"Professional rigging calculations for entertainment industry",
    plTitle:"Hoist Point Load Calculator",plSystemType:"System Type",plTotalLoad:"Total Load",plNumPoints:"Number of Hoist Points",plSpanLength:"Span Length",plChordAngle:"Chord Angle",plRadius:"Radius",plArcAngle:"Arc Angle (° — 360 for full circle)",plDropHeight:"Drop Height",plResults:"Results",plPerPoint:"per point",plDesignLoad:"Design Load",plHoistPoints:"Hoist Points",plSystemDetails:"System Details",plNotes:"Notes",plConfig:"Rigging Configuration",plVisual:"System Diagram",
    straight:"Straight",curved:"Curved",circular:"Circular",vertical:"Vertical",
    straightNote:"Even distribution assumed along straight truss/pipe",straightNote2:"End points ~60% avg, mid points ~115% avg (beam loading)",curvedNote1:"Curve correction factor",curvedNote2:"Outer points carry proportionally higher loads on curves",circularEndNote:"end points carry ~20% more",circularNote:"Circular rigs distribute load evenly when full 360°",verticalNote1:"Vertical loads include 1.25x dynamic factor for movement",verticalNote2:"Account for shock loading during accel/decel",openArc:"Open arc",
    psTitle:"Pull Sheet Generator",psProject:"Project Name",psVenue:"Venue",psChainSystem:"Chain Hoist System",psSystemType:"System Type",psMotorCounts:"Motor Counts",psHardware:"Hardware",psSteelCable:"Steel",psTotalHoists:"Total Hoists",psOnSystem:"on",psSystem:"system",psPullSheet:"Pull Sheet",psProject2:"Project",psVenue2:"Venue",psChainSys2:"Chain System",psBreakdown:"Breakdown by Motor Type",psMotors:"Motors",psItem:"Item",psSize:"Cat. ID",psQty:"Qty",
    psGrandTotals:"Grand Totals — All Gear",psTotalChain:"Total Chain Hoists",psEmpty:"Add motors above to generate your pull sheet",psExportPDF:"Export PDF",psShowDate:"Show Date",psReturnDate:"Return Date",psCountry:"Country / Region",psD8:"D8 / D8+ Rated",psD8Warn:"\u26A0 D8/D8+ RATED SYSTEM REQUIRED",psSendQuote:"Send for Quote",psName:"Your Name",psEmail:"Your Email",psRequired:"Required",psSending:"Sending\u2026",psSent:"Sent \u2713",psSendFail:"Failed \u2014 Retry",
    psAddons:"Additional Equipment",psAddonSub:"Add quantities for optional gear",
    brTitle:"Bridle Calculator",brType:"Bridle Type",brConfig:"Configuration",brDimensions:"Dimensions",brBeamSpacing:"Distance Between Beams",brLoadWeight:"Load Weight",brPickSpacing:"Pick Point Spacing",brHeadroom:"Available Headroom",brThirdLeg:"Third Leg Offset",brHoistType:"Hoist Type (for gear list)",brMotorRating:"Motor Rating",brResults:"Bridle Results",brLegLength:"Leg Length",brIncAngle:"Included Angle",brApexHeight:"Apex Height",brPerLeg:"per Leg",brHorizForce:"Horizontal Force",brLegs:"Legs",brThirdLegLen:"Third Leg Length",brNotes:"Rigging Notes",brVisual:"Bridle Diagram",
    brNote1:"Always verify beam/structure capacity before loading. Angles above 90° significantly increase leg tension.",brNote2:"Horizontal forces must be resolved by the structure. Confirm breast line capacity if used.",brNote3:"Arena bridles: ensure all four attachment points are at equal elevation.",brGearList:"Bridle Gear List",brAngleWarn:"ANGLE WARNING",brAngleWarnText:"Included angle exceeds 120°. Leg loads increase dramatically. Consider wider beam spacing or more headroom.",brError:"Beam spacing must be > pick point spacing.",brEmpty:"Enter dimensions above to calculate bridle geometry",
    twoLeg:"2-Leg",threeLeg:"3-Leg",arena:"Arena (4-Leg)",sameSpreahalf:"Same as half-spread",
    gridIron:"Grid / Iron",beam:"Beam",load:"Load",
    tabMarkout:"Markout",moTitle:"Markout Generator",moImportCSV:"Import CSV",moExportPDF:"Export PDF",moUnit:"Units",moPaper:"Paper Size",moTotalPts:"Total Points",moTotalWeight:"Total Weight",moUpstage:"UPSTAGE",moDownstage:"DOWNSTAGE",moStageLeft:"STAGE LEFT",moStageRight:"STAGE RIGHT",moCL:"CL",moLabel:"Label",moType:"Type",moLoad:"Load",moNotes:"Notes",moTrim:"Trim",moCable:"Cable",moEmpty:"Import a CSV file to generate your markout sheet",moLegend:"Legend",moNum:"#",moY:"Y",moX:"X",moPushPull:"Push to Pull Sheet",moPushPullDone:"Sent to Pull Sheet",
  },
  pr: {
    appName:"WYP ASSIST",appSub:"Herramientas de Aparejo para Entretenimiento",tabLoad:"Carga Puntual",tabPull:"Hoja de Tiro",tabBridle:"Calc. Brida",
    disclaimer:"⚠ Todos los cálculos son estimaciones para planificación. Verifique con un ingeniero estructural calificado. Factor de seguridad mínimo de 5:1.",
    footer1:"WYP Assist v1.0",footer2:"Cálculos profesionales de aparejo para entretenimiento",
    plTitle:"Calculadora de Carga Puntual",plSystemType:"Tipo de Sistema",plTotalLoad:"Carga Total",plNumPoints:"Número de Puntos",plSpanLength:"Longitud del Tramo",plChordAngle:"Ángulo de Cuerda",plRadius:"Radio",plArcAngle:"Ángulo de Arco (° — 360 para círculo)",plDropHeight:"Altura de Caída",plResults:"Resultados",plPerPoint:"por punto",plDesignLoad:"Carga de Diseño",plHoistPoints:"Puntos de Polipasto",plSystemDetails:"Detalles del Sistema",plNotes:"Notas",plConfig:"Configuración de Aparejo",plVisual:"Diagrama del Sistema",
    straight:"Recto",curved:"Curvo",circular:"Circular",vertical:"Vertical",
    straightNote:"Distribución uniforme a lo largo de truss/tubo recto",straightNote2:"Puntos finales ~60%, puntos medios ~115%",curvedNote1:"Factor de corrección de curva",curvedNote2:"Puntos exteriores cargan más en curvas",circularEndNote:"puntos finales ~20% más",circularNote:"Circular distribuye carga uniforme a 360°",verticalNote1:"Cargas verticales: factor dinámico 1.25x",verticalNote2:"Considere carga de impacto en aceleración",openArc:"Arco abierto",
    psTitle:"Generador de Hoja de Tiro",psProject:"Nombre del Proyecto",psVenue:"Lugar",psChainSystem:"Sistema de Polipasto",psSystemType:"Tipo de Sistema",psMotorCounts:"Conteo de Motores",psHardware:"Herrajes",psSteelCable:"Acero",psTotalHoists:"Total Polipastos",psOnSystem:"en",psSystem:"sistema",psPullSheet:"Hoja de Tiro",psProject2:"Proyecto",psVenue2:"Lugar",psChainSys2:"Sistema de Cadena",psBreakdown:"Desglose por Tipo de Motor",psMotors:"Motores",psItem:"Artículo",psSize:"Cat. ID",psQty:"Cant.",
    psGrandTotals:"Totales Generales — Todo el Equipo",psTotalChain:"Total Polipastos",psEmpty:"Agregue motores para generar la hoja",psExportPDF:"Exportar PDF",psShowDate:"Fecha del Show",psReturnDate:"Fecha de Devolución",psCountry:"País / Región",psD8:"D8 / D8+ Clasificado",psD8Warn:"\u26A0 SE REQUIERE SISTEMA CLASIFICADO D8/D8+",psSendQuote:"Enviar para Cotización",psName:"Tu Nombre",psEmail:"Tu Correo",psRequired:"Requerido",psSending:"Enviando\u2026",psSent:"Enviado \u2713",psSendFail:"Error \u2014 Reintentar",
    psAddons:"Equipo Adicional",psAddonSub:"Agregue cantidades para equipo opcional",
    brTitle:"Calculadora de Brida",brType:"Tipo de Brida",brConfig:"Configuración",brDimensions:"Dimensiones",brBeamSpacing:"Distancia Entre Vigas",brLoadWeight:"Peso de Carga",brPickSpacing:"Espaciado de Puntos",brHeadroom:"Altura Disponible",brThirdLeg:"Desplazamiento 3ra Pata",brHoistType:"Tipo de Polipasto (para equipo)",brMotorRating:"Capacidad del Motor",brResults:"Resultados de Brida",brLegLength:"Longitud de Pata",brIncAngle:"Ángulo Incluido",brApexHeight:"Altura del Ápice",brPerLeg:"por Pata",brHorizForce:"Fuerza Horizontal",brLegs:"Patas",brThirdLegLen:"Longitud 3ra Pata",brNotes:"Notas de Aparejo",brVisual:"Diagrama de Brida",
    brNote1:"Verifique capacidad de viga/estructura. Ángulos >90° aumentan tensión.",brNote2:"Fuerzas horizontales resueltas por la estructura. Confirme línea de pecho.",brNote3:"Arena: cuatro puntos a misma elevación.",brGearList:"Lista de Equipo de Brida",brAngleWarn:"ADVERTENCIA DE ÁNGULO",brAngleWarnText:"Ángulo >120°. Cargas aumentan dramáticamente.",brError:"Espaciado de vigas debe ser > espaciado de puntos.",brEmpty:"Ingrese dimensiones para calcular",
    twoLeg:"2-Patas",threeLeg:"3-Patas",arena:"Arena (4-Patas)",sameSpreahalf:"Igual que mitad de extensión",
    gridIron:"Parrilla",beam:"Viga",load:"Carga",
    tabMarkout:"Marcado",moTitle:"Generador de Marcado",moImportCSV:"Importar CSV",moExportPDF:"Exportar PDF",moUnit:"Unidades",moPaper:"Tamaño Papel",moTotalPts:"Total Puntos",moTotalWeight:"Peso Total",moUpstage:"FONDO",moDownstage:"FRENTE",moStageLeft:"IZQUIERDA",moStageRight:"DERECHA",moCL:"LC",moLabel:"Etiqueta",moType:"Tipo",moLoad:"Carga",moNotes:"Notas",moTrim:"Trim",moCable:"Cable",moEmpty:"Importe un archivo CSV para generar su hoja de marcado",moLegend:"Leyenda",moNum:"#",moY:"Y",moX:"X",moPushPull:"Enviar a Hoja de Tiro",moPushPullDone:"Enviado a Hoja de Tiro",
  },
};

const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const CHAIN_SYSTEMS = ["60'", "80'", "125'"];
const MOTOR_TYPES = [".25 Ton", ".5 Ton", "1 Ton", "2 Ton"];
const COUNTRIES = ["N & S America", "Europe", "United Kingdom", "Australia", "Asia"];

// EmailJS configuration — replace with your actual credentials
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
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

// Crosshair lines for hoist symbols
function SvgCrosshair({cx,cy,r,stroke}){
  const ext=r*1.6;
  return <g>
    <line x1={cx-ext} y1={cy} x2={cx+ext} y2={cy} stroke={stroke||"#000"} strokeWidth={0.4} opacity={0.5}/>
    <line x1={cx} y1={cy-ext} x2={cx} y2={cy+ext} stroke={stroke||"#000"} strokeWidth={0.4} opacity={0.5}/>
  </g>;
}

export function parseMarkoutCSV(text){
  const lines=text.trim().split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2) return {points:[],errors:["File is empty or has no data rows"]};
  const hdr=lines[0].split(",").map(h=>h.trim());
  const iNum=0,iLabel=1,iYm=2,iXm=3,iYft=4,iXft=5,iType=6,iLbs=7,iKgs=8,iNotes=9,iTrimFt=10,iTrimM=11,iCableFt=12,iCableM=13;
  const points=[],errors=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(",").map(c=>c.trim());
    const num=parseInt(cols[iNum]);
    if(isNaN(num)) continue; // skip summary/blank rows
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
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
function mkS(t) {
  return {
    app:{fontFamily:"'IBM Plex Mono','Fira Code',monospace",background:t.bg,color:t.textPrimary,minHeight:"100vh"},
    header:{background:t.headerGradient,borderBottom:`3px solid ${t.accent}`,position:"sticky",top:0,zIndex:100},
    headerInner:{maxWidth:1260,margin:"0 auto",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},
    logo:{display:"flex",alignItems:"center",gap:14},
    logoIcon:{width:48,height:48,background:t.accentGradient,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:"#fff",boxShadow:`0 4px 20px ${t.accent}40`},
    logoText:{fontSize:24,fontWeight:900,letterSpacing:3,color:t.textPrimary},
    logoSub:{fontSize:9,color:t.textSecondary,letterSpacing:4,textTransform:"uppercase",marginTop:2},
    nav:{display:"flex",gap:4,flexWrap:"nowrap",flexShrink:0},
    navBtn:(a)=>({padding:"10px 12px",textAlign:"center",whiteSpace:"nowrap",background:a?`linear-gradient(180deg,${t.accent} 0%,${t.accent}CC 100%)`:"transparent",color:a?"#fff":t.textSecondary,border:a?`2px solid ${t.accent}`:`2px solid ${t.border}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:a?900:600,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s",boxShadow:a?`0 2px 8px ${t.accent}50,inset 0 1px 0 rgba(255,255,255,0.15)`:"none",textShadow:a?"0 1px 2px rgba(0,0,0,0.3)":"none",borderBottom:a?`2px solid ${t.accent}80`:`2px solid ${t.border}`}),
    langBtn:(a)=>({padding:"8px 10px",background:a?t.secondary:"transparent",color:a?"#fff":t.textSecondary,border:a?`2px solid ${t.secondary}`:`2px solid ${t.border}`,borderRadius:2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?800:500,transition:"all .15s",display:"flex",alignItems:"center",gap:4,boxShadow:a?`0 2px 8px ${t.secondary}40,inset 0 1px 0 rgba(255,255,255,0.15)`:"none",letterSpacing:a?1:0}),
    main:{maxWidth:1200,margin:"0 auto",padding:"32px 24px"},
    card:{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:28,marginBottom:20,boxShadow:t.cardGlow},
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
    disc:{marginBottom:24,padding:"12px 16px",background:`${t.accent}08`,border:`1px solid ${t.accent}20`,borderRadius:6,fontSize:11,color:t.textSecondary,letterSpacing:0.5},
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
const Field = ({label,children,style})=>{const{s}=useTheme();return<div style={{...s.fg,...style}}><label style={s.label}>{label}</label>{children}</div>;};
const Inp = ({value,onChange,type="number",placeholder,step,min})=>{const{s}=useTheme();return<input style={s.input} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} step={step} min={min}/>;};
const Chips = ({options,value,onChange})=>{const{s}=useTheme();return<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{options.map(o=><button key={o} style={s.chip(value===o)} onClick={()=>onChange(o)}>{o}</button>)}</div>;};
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
// SVG DIAGRAMS (same as before, abbreviated)
// ═══════════════════════════════════════════════════════════════════════════════
function PointLoadDiagram({rigType,numPoints,pointLoad,unit}){
  const{t,tx}=useTheme();const N=parseInt(numPoints)||3;const pL=parseFloat(pointLoad)||0;
  const uW=unit==="imperial"?"lbs":"kg";const w=520,h=320;const ac=t.accent,dim=t.textSecondary,sec=t.secondary;
  if(rigType==="straight"){const padX=60,tY=80,sp=(w-padX*2)/Math.max(N-1,1);const pts=Array.from({length:N},(_,i)=>padX+i*sp);
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={padX-10} y={20} width={w-padX*2+20} height={12} rx={2} fill={dim} opacity={0.3}/><text x={w/2} y={16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>{pts.map((x,i)=><line key={`ch${i}`} x1={x} y1={32} x2={x} y2={tY-8} stroke={dim} strokeWidth={1.5} strokeDasharray="4 3"/>)}<rect x={padX-6} y={tY-8} width={w-padX*2+12} height={16} rx={3} fill="none" stroke={ac} strokeWidth={2}/><text x={w/2} y={tY+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">TRUSS</text>{pts.map((x,i)=>(<g key={i}><circle cx={x} cy={tY+8} r={5} fill={ac}/><line x1={x} y1={tY+18} x2={x} y2={tY+80} stroke={ac} strokeWidth={2} markerEnd="url(#ah)"/><rect x={x-28} y={tY+86} width={56} height={22} rx={3} fill={ac} opacity={0.15}/><text x={x} y={tY+101} textAnchor="middle" fill={ac} fontSize="10" fontFamily="inherit" fontWeight="700">{pL} {uW}</text><text x={x} y={tY+120} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">P{i+1}</text></g>))}<line x1={pts[0]} y1={h-30} x2={pts[pts.length-1]} y2={h-30} stroke={dim} strokeWidth={1}/><text x={w/2} y={h-16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit">{N} points</text></svg>);}
  if(rigType==="curved"){const cx=w/2,cy=60,r=160;const startA=Math.PI*0.85,endA=Math.PI*0.15;const pts=Array.from({length:N},(_,i)=>{const ang=startA+(endA-startA)*(i/Math.max(N-1,1));return{x:cx+r*Math.cos(ang),y:cy+r*Math.sin(ang)};});const arcS={x:cx+r*Math.cos(startA),y:cy+r*Math.sin(startA)},arcE={x:cx+r*Math.cos(endA),y:cy+r*Math.sin(endA)};
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={40} y={10} width={w-80} height={12} rx={2} fill={dim} opacity={0.3}/><text x={w/2} y={8} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text><path d={`M ${arcS.x} ${arcS.y} A ${r} ${r} 0 0 0 ${arcE.x} ${arcE.y}`} fill="none" stroke={ac} strokeWidth={2.5}/>{pts.map((p,i)=>(<g key={i}><line x1={p.x} y1={22} x2={p.x} y2={p.y-6} stroke={dim} strokeWidth={1.2} strokeDasharray="4 3"/><circle cx={p.x} cy={p.y} r={5} fill={ac}/><line x1={p.x} y1={p.y+8} x2={p.x} y2={p.y+65} stroke={ac} strokeWidth={2} markerEnd="url(#ah2)"/><text x={p.x} y={p.y+82} textAnchor="middle" fill={ac} fontSize="10" fontFamily="inherit" fontWeight="700">{pL} {uW}</text></g>))}</svg>);}
  if(rigType==="circular"){const cx=w/2,cy=h/2-10,r=100;const pts=Array.from({length:N},(_,i)=>{const a=(Math.PI*2*i)/N-Math.PI/2;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};});
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah3" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill={ac}/></marker></defs><circle cx={cx} cy={cy} r={r} fill="none" stroke={ac} strokeWidth={2.5}/>{pts.map((p,i)=>{const dx=(p.x-cx)/r,dy=(p.y-cy)/r;const ax=p.x+dx*55,ay=p.y+dy*55;return(<g key={i}><circle cx={p.x} cy={p.y} r={5} fill={ac}/><line x1={p.x+dx*8} y1={p.y+dy*8} x2={ax-dx*6} y2={ay-dy*6} stroke={ac} strokeWidth={1.5} markerEnd="url(#ah3)"/><text x={ax+dx*8} y={ay+dy*4+4} textAnchor="middle" fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">{pL}</text></g>);})}<text x={cx} y={h-8} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit">{N} points · 360°</text></svg>);}
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="ah4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={80} y={20} width={w-160} height={14} rx={2} fill={dim} opacity={0.3}/><text x={w/2} y={16} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">{tx.gridIron}</text>{Array.from({length:Math.min(N,4)},(_,i)=>{const x=140+i*70;return(<g key={i}><line x1={x} y1={34} x2={x} y2={60} stroke={dim} strokeWidth={1.2} strokeDasharray="4 3"/><rect x={x-8} y={60} width={16} height={24} rx={2} fill={sec} opacity={0.6}/><text x={x} y={76} textAnchor="middle" fill="#fff" fontSize="7" fontFamily="inherit">M</text><line x1={x} y1={84} x2={x} y2={230} stroke={dim} strokeWidth={1.5} strokeDasharray="6 2"/><circle cx={x} cy={230} r={4} fill={ac}/></g>);})}<rect x={120} y={240} width={Math.min(N,4)*70+20} height={14} rx={3} fill="none" stroke={ac} strokeWidth={2}/><line x1={w/2} y1={256} x2={w/2} y2={290} stroke={ac} strokeWidth={2} markerEnd="url(#ah4)"/><text x={w/2} y={306} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="700">{pL} {uW}/pt</text></svg>);
}

function BridleDiagram({bridleType,result,unit}){
  const{t,tx}=useTheme();if(!result||result.err) return null;
  const ac=t.accent,sec=t.secondary,dim=t.textSecondary;
  const dL=unit==="imperial"?"ft":"m",wL=unit==="imperial"?"lbs":"kg";const w=520,h=360;
  if(bridleType==="2"||bridleType==="3"){const beamY=50,apexY=160,loadY=280,cx=w/2,spread=140,lB=cx-spread,rB=cx+spread;const legs=bridleType==="2"?[{bx:lB},{bx:rB}]:[{bx:lB},{bx:rB},{bx:cx}];
    return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><defs><marker id="bah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={ac}/></marker></defs><rect x={lB-30} y={beamY-6} width={60} height={12} rx={2} fill={sec} opacity={0.6}/><rect x={rB-30} y={beamY-6} width={60} height={12} rx={2} fill={sec} opacity={0.6}/><text x={lB} y={beamY-12} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">{tx.beam} A</text><text x={rB} y={beamY-12} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">{tx.beam} B</text>{bridleType==="3"&&<><rect x={cx-20} y={beamY-6} width={40} height={12} rx={2} fill={sec} opacity={0.4}/><text x={cx} y={beamY-12} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">C</text></>}{legs.map((leg,i)=><line key={i} x1={leg.bx} y1={beamY+6} x2={cx} y2={apexY} stroke={ac} strokeWidth={2.5}/>)}{legs.map((leg,i)=><circle key={`c${i}`} cx={leg.bx} cy={beamY+6} r={5} fill={ac}/>)}<circle cx={cx} cy={apexY} r={7} fill={ac} stroke="#fff" strokeWidth={1.5}/><text x={cx+14} y={apexY+4} fill={ac} fontSize="9" fontFamily="inherit" fontWeight="700">APEX</text><line x1={cx} y1={apexY+7} x2={cx} y2={loadY-14} stroke={dim} strokeWidth={1.5} strokeDasharray="5 3"/><rect x={cx-50} y={loadY-14} width={100} height={28} rx={4} fill="none" stroke={ac} strokeWidth={2}/><text x={cx} y={loadY+5} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="700">{result.lpl} {wL}</text><line x1={cx} y1={loadY+16} x2={cx} y2={loadY+40} stroke={ac} strokeWidth={2} markerEnd="url(#bah)"/><path d={`M ${cx-25} ${apexY-20} A 30 30 0 0 1 ${cx+25} ${apexY-20}`} fill="none" stroke={warning} strokeWidth={1.5}/><text x={cx} y={apexY-28} textAnchor="middle" fill={warning} fontSize="10" fontFamily="inherit" fontWeight="700">{result.ia}°</text><text x={(lB+cx)/2-20} y={(beamY+apexY)/2} fill={ac} fontSize="10" fontFamily="inherit" fontWeight="600" transform={`rotate(-45 ${(lB+cx)/2-20} ${(beamY+apexY)/2})`}>L={result.ll} {dL}</text><line x1={lB} y1={h-22} x2={rB} y2={h-22} stroke={dim} strokeWidth={1}/><text x={cx} y={h-8} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">{tx.brBeamSpacing}</text></svg>);}
  const cx=w/2,cy=h/2-20,sp=100;const corners=[[-sp,-sp],[sp,-sp],[sp,sp],[-sp,sp]].map(([dx,dy])=>({x:cx+dx,y:cy+dy}));
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:540}}><text x={cx} y={20} textAnchor="middle" fill={dim} fontSize="10" fontFamily="inherit" letterSpacing="2">ARENA — TOP VIEW</text><rect x={cx-sp} y={cy-sp} width={sp*2} height={sp*2} fill="none" stroke={dim} strokeWidth={1} strokeDasharray="6 3"/>{corners.map((c,i)=>(<g key={i}><line x1={c.x} y1={c.y} x2={cx} y2={cy} stroke={ac} strokeWidth={2.5}/><circle cx={c.x} cy={c.y} r={8} fill={sec} opacity={0.6}/><text x={c.x} y={c.y+4} textAnchor="middle" fill="#fff" fontSize="8" fontFamily="inherit" fontWeight="700">{String.fromCharCode(65+i)}</text></g>))}<circle cx={cx} cy={cy} r={20} fill={ac} opacity={0.2} stroke={ac} strokeWidth={2}/><text x={cx} y={cy+4} textAnchor="middle" fill={ac} fontSize="10" fontFamily="inherit" fontWeight="700">{tx.load}</text><text x={cx} y={cy+38} textAnchor="middle" fill={ac} fontSize="11" fontFamily="inherit" fontWeight="700">{result.lpl} {wL}/leg</text><text x={cx} y={h-10} textAnchor="middle" fill={dim} fontSize="9" fontFamily="inherit">L={result.ll} {dL} · {result.ia}°</text></svg>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
function generatePDF({projectName,venue,chainSystem,totalHoists,hoistLines,addonItems,tx,theme,showDate,returnDate,country,d8,userName,userEmail}){
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
      newPageIfNeeded(14);
      doc.setFillColor(231,76,60);doc.rect(ml,y,pw-ml-mr,10,'F');
      doc.setFontSize(13);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      doc.text(tx.psD8Warn,ml+(pw-ml-mr)/2,y+7,{align:"center"});
      y+=14;
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
  const labels={straight:tx.straight,curved:tx.curved,circular:tx.circular};
  const uW=unit==="imperial"?"lbs":"kg",uD=unit==="imperial"?"ft":"m";
  const res=useMemo(()=>{
    const W=parseFloat(load),N=parseInt(pts);if(!W||!N||N<1)return null;let pL,notes=[],det={};
    if(rig==="straight"){pL=W/N;det.span=parseFloat(span)||0;notes.push(tx.straightNote);if(N>=2){det.endLoad=(pL*.6).toFixed(1);det.midLoad=(pL*1.15).toFixed(1);notes.push(tx.straightNote2);}}
    else if(rig==="curved"){const a=(parseFloat(chord)||0)*Math.PI/180;const cf=a>0?(2*Math.sin(a/2))/a:1;pL=(W/N)/cf;det.curveFactor=cf.toFixed(3);notes.push(`${tx.curvedNote1}: ${cf.toFixed(3)}`);notes.push(tx.curvedNote2);}
    else if(rig==="circular"){const r=parseFloat(rad)||0,a=parseFloat(arc)||360;det.circumference=(a*Math.PI/180*r).toFixed(1);det.arcAngle=a;pL=W/N;if(a<360){det.endPointLoad=(pL*1.2).toFixed(1);notes.push(`${tx.openArc} (${a}°): ${tx.circularEndNote}`);}notes.push(tx.circularNote);}
    else{pL=W/N;det.dropHeight=parseFloat(drop)||0;det.dynamicLoad=(pL*1.25).toFixed(1);notes.push(tx.verticalNote1);notes.push(tx.verticalNote2);}
    return{pL:pL.toFixed(1),dL:(pL*5).toFixed(1),notes,det};
  },[rig,load,pts,span,chord,rad,arc,drop,tx]);
  return(<div>
    <div style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>⚙</span> {tx.plTitle}</div>
      <Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/>
      <div style={s.secTitle}>{tx.plConfig}</div>
      <Field label={tx.plSystemType}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{RIG_KEYS.map(k=><button key={k} style={s.chip(rig===k)} onClick={()=>setRig(k)}>{labels[k]}</button>)}</div></Field>
      <div style={s.g3}>
        <Field label={`${tx.plTotalLoad} (${uW})`}><Inp value={load} onChange={setLoad} placeholder="0"/></Field>
        <Field label={tx.plNumPoints}><Inp value={pts} onChange={setPts} placeholder="0" step="1"/></Field>
        {rig==="straight"&&<Field label={`${tx.plSpanLength} (${uD})`}><Inp value={span} onChange={setSpan} placeholder="0"/></Field>}
        {rig==="curved"&&<Field label={`${tx.plChordAngle} (°)`}><Inp value={chord} onChange={setChord} placeholder="0"/></Field>}
        {rig==="circular"&&<Field label={`${tx.plRadius} (${uD})`}><Inp value={rad} onChange={setRad} placeholder="0"/></Field>}
      </div>
      {rig==="circular"&&<Field label={tx.plArcAngle} style={{marginTop:8}}><Inp value={arc} onChange={setArc} placeholder="360"/></Field>}
    </div>
    {res&&(<div style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.plResults} — {labels[rig]}</div>
      <div style={s.diagWrap}><div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.plVisual}</div><PointLoadDiagram rigType={rig} numPoints={pts} pointLoad={res.pL} unit={unit}/></div>
      <div style={{...s.g3,marginTop:20}}>
        <div style={s.res}><div style={s.resVal}>{res.pL}</div><div style={s.resLbl}>{uW} {tx.plPerPoint}</div></div>
        <div style={s.res}><div style={{...s.resVal,color:danger}}>{res.dL}</div><div style={s.resLbl}>{tx.plDesignLoad} (5:1 SF)</div></div>
        <div style={s.res}><div style={{...s.resVal,color:success}}>{pts}</div><div style={s.resLbl}>{tx.plHoistPoints}</div></div>
      </div>
      {Object.keys(res.det).length>0&&<div style={{marginTop:20}}><div style={s.secTitle}>{tx.plSystemDetails}</div><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{Object.entries(res.det).map(([k,v])=><div key={k} style={s.pill}><span style={{color:t.textSecondary,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{k.replace(/([A-Z])/g,' $1')}: </span><span style={{color:t.accent,fontWeight:700}}>{v}</span></div>)}</div></div>}
      {res.notes.length>0&&<div style={{marginTop:20}}><div style={s.secTitle}>{tx.plNotes}</div>{res.notes.map((n,i)=><div key={i} style={s.note}>{n}</div>)}</div>}
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

  const pdfParams=()=>({projectName:pn,venue:vn,chainSystem:cs,totalHoists:tot,hoistLines,addonItems,tx,theme:lang,showDate,returnDate,country,d8,userName,userEmail});

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
      await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,{
        to_emails:"MRich@christielites.com,costa@wypproductions.com,evan@rodecap.co",
        from_name:userName,
        from_email:userEmail,
        project_name:pn||"Untitled",
        venue:vn||"—",
        show_date:showDate,
        return_date:returnDate||"N/A",
        country:country,
        d8_status:d8?tx.psD8Warn:"Standard",
        total_hoists:String(tot),
        chain_system:cs,
        pdf_attachment:pdfBase64,
      },EMAILJS_PUBLIC_KEY);
      setSendStatus("sent");
      setTimeout(()=>setSendStatus(null),4000);
    }catch(err){
      console.error("EmailJS error:",err);
      setSendStatus("error");
      setTimeout(()=>setSendStatus(null),5000);
    }
  };

  const sendBtnLabel=sendStatus==="sending"?tx.psSending:sendStatus==="sent"?tx.psSent:sendStatus==="error"?tx.psSendFail:tx.psSendQuote;
  const sendBtnColor=sendStatus==="sent"?success:sendStatus==="error"?danger:t.secondary;

  return(<div>
    <div style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:18}}>📋</span> {tx.psTitle}</div>
      <div style={s.g2}>
        <Field label={tx.psProject}><Inp type="text" value={pn} onChange={setPn} placeholder="..."/></Field>
        <Field label={tx.psVenue}><Inp type="text" value={vn} onChange={setVn} placeholder="..."/></Field>
      </div>

      {/* Show Date / Return Date / Country */}
      <div style={{...s.g3,marginTop:16}}>
        <Field label={<>{tx.psShowDate} <span style={{color:danger,fontSize:10}}>*</span></>}>
          <input type="date" style={s.input} value={showDate} onChange={e=>setShowDate(e.target.value)}/>
        </Field>
        <Field label={tx.psReturnDate}>
          <input type="date" style={s.input} value={returnDate} onChange={e=>setReturnDate(e.target.value)}/>
        </Field>
        <Field label={tx.psCountry}><Chips options={COUNTRIES} value={country} onChange={setCountry}/></Field>
      </div>

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
        <span style={{color:danger,fontWeight:900,fontSize:13,letterSpacing:1.5,textTransform:"uppercase",animation:"pulse 1.5s ease-in-out infinite"}}>{tx.psD8Warn}</span>
      </div>}

      <div style={s.secTitle}>{tx.psMotorCounts}</div>
      <div style={s.g4}>
        {MOTOR_TYPES.map(ty=>{const isH=parseFloat(ty)>1;return(
          <div key={ty} style={s.mCard}>
            <div style={{fontSize:13,fontWeight:700,color:t.accent,marginBottom:4}}>{ty}</div>
            <div style={{fontSize:9,color:t.textSecondary,marginBottom:12}}>{isH?'3/4" · 1/2"':'5/8" · 3/8"'}</div>
            <div style={s.ctr}><button style={s.ctrBtn} onClick={()=>mc(ty,-1)}>−</button><input type="number" min="0" style={s.ctrVal} value={m[ty]} onChange={e=>{const v=parseInt(e.target.value);setM(p=>({...p,[ty]:isNaN(v)?0:Math.max(0,v)}));}} onFocus={e=>e.target.select()}/><button style={s.ctrBtn} onClick={()=>mc(ty,1)}>+</button></div>
          </div>);})}
      </div>
      <div style={{marginTop:16,textAlign:"center"}}>
        <span style={{fontSize:14,color:t.textSecondary}}>{tx.psTotalHoists}: </span>
        <span style={{fontSize:22,fontWeight:900,color:t.accent}}>{tot}</span>
        <span style={{fontSize:12,color:t.textSecondary,marginLeft:8}}>{tx.psOnSystem} {cs} {tx.psSystem}</span>
      </div>
    </div>

    {/* ── ADD-ONS SECTION ── */}
    <div style={s.card}>
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
    <div style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:16}}>📧</span> {tx.psSendQuote}</div>
      <div style={s.g2}>
        <Field label={<>{tx.psName} <span style={{color:danger,fontSize:10}}>*</span></>}><Inp type="text" value={userName} onChange={setUserName} placeholder="..."/></Field>
        <Field label={<>{tx.psEmail} <span style={{color:danger,fontSize:10}}>*</span></>}><Inp type="email" value={userEmail} onChange={setUserEmail} placeholder="name@example.com"/></Field>
      </div>
      <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap",alignItems:"center"}}>
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
      <div style={s.card}>
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
            <table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
              <tbody>{l.items.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table>
          </div>
        ))}</>}

        {/* Add-on items */}
        {addonItems.length>0&&<>
          <div style={s.secTitle}>{tx.psAddons}</div>
          <div style={s.bCard}>
            <table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
              <tbody>{addonItems.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table>
          </div>
        </>}

        {/* Grand totals */}
        <div style={s.secTitle}>{tx.psGrandTotals}</div>
        <div style={s.gtWrap}>
          <table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
            <tbody>
              {grandTotals.map(([catId,{name,qty}],i)=><tr key={i}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}
              {tot>0&&<tr style={{background:`${t.accent}10`}}><td style={{...s.td,fontWeight:700,color:t.accent}} colSpan={2}>{tx.psTotalChain} ({cs})</td><td style={{...s.tdA,fontSize:18}}>{tot}</td></tr>}
            </tbody></table>
        </div>
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
  const[ps,setPs]=useState("");const[hr,setHr]=useState("");
  const[ht,setHt]=useState(".5 Ton");const[tlo,setTlo]=useState("");
  const dL=unit==="imperial"?"ft":"m",wL=unit==="imperial"?"lbs":"kg";
  const res=useMemo(()=>{
    const D=parseFloat(bs),W=parseFloat(lw),P=parseFloat(ps),H=parseFloat(hr);
    if(!D||!W||!P||!H)return null;const hs=(D-P)/2;if(hs<0)return{err:tx.brError};
    const ll=Math.sqrt(hs*hs+H*H),ia=2*Math.atan2(hs,H)*180/Math.PI;
    const n=bt==="2"?2:bt==="3"?3:4;const lpl=(W/n)*(ll/H),hf=(W/n)*(hs/H);
    const base={ll:ll.toFixed(2),ia:ia.toFixed(1),ah:H.toFixed(2),lpl:lpl.toFixed(1),hf:hf.toFixed(1),n,W,sw:ia>120};
    if(bt==="3"){const o=parseFloat(tlo)||hs;base.tll=Math.sqrt(o*o+H*H).toFixed(2);}return base;
  },[bt,bs,lw,ps,hr,tlo,tx]);
  const bg=useMemo(()=>{
    if(!res||res.err)return null;const c=res.n;const items=calcHoistGear(ht,c);return items;
  },[res,ht]);
  return(<div>
    <div style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>△</span> {tx.brTitle}</div>
      <Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/>
      <div style={s.secTitle}>{tx.brType}</div>
      <Field label={tx.brConfig}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{bOpts.map(b=><button key={b.k} style={s.chip(bt===b.k)} onClick={()=>setBt(b.k)}>{b.l}</button>)}</div></Field>
      <div style={s.secTitle}>{tx.brDimensions}</div>
      <div style={s.g2}>
        <Field label={`${tx.brBeamSpacing} (${dL})`}><Inp value={bs} onChange={setBs} placeholder="0"/></Field>
        <Field label={`${tx.brLoadWeight} (${wL})`}><Inp value={lw} onChange={setLw} placeholder="0"/></Field>
        <Field label={`${tx.brPickSpacing} (${dL})`}><Inp value={ps} onChange={setPs} placeholder="0"/></Field>
        <Field label={`${tx.brHeadroom} (${dL})`}><Inp value={hr} onChange={setHr} placeholder="0"/></Field>
      </div>
      {bt==="3"&&<Field label={`${tx.brThirdLeg} (${dL})`}><Inp value={tlo} onChange={setTlo} placeholder={tx.sameSpreahalf}/></Field>}
      <div style={{...s.secTitle,marginTop:24}}>{tx.brHoistType}</div>
      <Field label={tx.brMotorRating}><Chips options={MOTOR_TYPES} value={ht} onChange={setHt}/></Field>
    </div>
    {res&&!res.err&&(<>
      <div style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.brResults} — {bOpts.find(b=>b.k===bt)?.l}</div>
        {res.sw&&<div style={s.warnBox(danger)}><span style={{fontSize:20}}>⚠</span><div><div style={{color:danger,fontWeight:700,fontSize:13}}>{tx.brAngleWarn}</div><div style={{color:t.textSecondary,fontSize:12}}>{tx.brAngleWarnText}</div></div></div>}
        <div style={s.diagWrap}><div style={{fontSize:10,color:t.textSecondary,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>{tx.brVisual}</div><BridleDiagram bridleType={bt} result={res} unit={unit}/></div>
        <div style={{...s.g3,marginTop:20}}>
          <div style={s.res}><div style={s.resVal}>{res.ll}</div><div style={s.resLbl}>{tx.brLegLength} ({dL})</div></div>
          <div style={s.res}><div style={{...s.resVal,color:res.sw?danger:success}}>{res.ia}°</div><div style={s.resLbl}>{tx.brIncAngle}</div></div>
          <div style={s.res}><div style={s.resVal}>{res.ah}</div><div style={s.resLbl}>{tx.brApexHeight} ({dL})</div></div>
        </div>
        <div style={{...s.g3,marginTop:12}}>
          <div style={s.res}><div style={s.resVal}>{res.lpl}</div><div style={s.resLbl}>{wL} {tx.brPerLeg}</div></div>
          <div style={s.res}><div style={{...s.resVal,color:warning}}>{res.hf}</div><div style={s.resLbl}>{tx.brHorizForce} ({wL})</div></div>
          <div style={s.res}><div style={{...s.resVal,color:success}}>{res.n}</div><div style={s.resLbl}>{tx.brLegs}</div></div>
        </div>
        {res.tll&&<div style={{...s.res,marginTop:12,display:"inline-block"}}><div style={s.resVal}>{res.tll}</div><div style={s.resLbl}>{tx.brThirdLegLen} ({dL})</div></div>}
        <div style={{marginTop:24}}><div style={s.secTitle}>{tx.brNotes}</div><div style={s.note}>{tx.brNote1}</div><div style={s.note}>{tx.brNote2}</div>{bt==="4"&&<div style={s.note}>{tx.brNote3}</div>}</div>
      </div>
      {bg&&(
        <div style={s.card}><div style={s.cardTitle}><span>⛓</span> {tx.brGearList} — {ht}</div>
          <table style={s.tbl}><thead><tr><th style={s.th}>{tx.psSize}</th><th style={s.th}>{tx.psItem}</th><th style={{...s.th,textAlign:"right"}}>{tx.psQty}</th></tr></thead>
            <tbody>{bg.map(({catId,name,qty},idx)=><tr key={idx}><td style={s.tdId}>{catId}</td><td style={s.td}>{name}</td><td style={s.tdA}>{qty}</td></tr>)}</tbody></table>
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
  doc.text(`${tx.moTotalPts}: ${points.length}  |  ${tx.moTotalWeight}: ${totW.toLocaleString()} ${wL}  |  WYP Assist v1.0`,ml+3,ph-mb+2);

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
  doc2.setFontSize(4);doc2.setTextColor(160,160,160);doc2.text("WYP Assist v1.0",ml2,ph2-6);

  doc2.save(`WYP_Markout_Data_${fileName||"export"}.pdf`);
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
  const hasData=points.length>0;
  const handleFile=e=>{
    const file=e.target.files[0];if(!file)return;
    setFileName(file.name.replace(/\.csv$/i,""));
    setPushed(false);
    const reader=new FileReader();
    reader.onload=ev=>{const{points:pts,errors}=parseMarkoutCSV(ev.target.result);setPoints(pts);};
    reader.readAsText(file);
  };
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
  return(<div>
    <div style={s.card}><div style={s.cardTitle}><span style={{fontSize:18}}>📐</span> {tx.moTitle}</div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end",marginBottom:20}}>
        <div style={s.fg}><label style={s.label}>{tx.moImportCSV}</label>
          <label style={{...s.exportBtn,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
            <span>📂</span> {tx.moImportCSV}
            <input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}}/>
          </label>
        </div>
        <div style={s.fg}><label style={s.label}>{tx.moUnit}</label><Chips options={["imperial","metric"]} value={unit} onChange={setUnit}/></div>
        <div style={s.fg}><label style={s.label}>{tx.moPaper}</label><Chips options={["archD","a1"]} value={paper} onChange={setPaper}/></div>
        {hasData&&<button style={s.exportBtn} onClick={handleExport}><span>⬇</span> {tx.moExportPDF}</button>}
        {hasData&&<button style={{...s.exportBtn,background:pushed?success:t.secondary}} onClick={handlePushToPull}><span>{pushed?"✓":"📋"}</span> {pushed?tx.moPushPullDone:tx.moPushPull}</button>}
      </div>
      {hasData&&<div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={s.res}><div style={s.resVal}>{points.length}</div><div style={s.resLbl}>{tx.moTotalPts}</div></div>
        <div style={s.res}><div style={{...s.resVal,color:success}}>{totWeight.toLocaleString()}</div><div style={s.resLbl}>{tx.moTotalWeight} ({wL})</div></div>
        <div style={s.res}><div style={{...s.resVal,color:t.accent}}>{types.length}</div><div style={s.resLbl}>{tx.moType}s</div></div>
      </div>}
      {fileName&&<div style={{marginTop:12,fontSize:11,color:t.textSecondary,letterSpacing:1}}>📄 {fileName}.csv</div>}
    </div>
    {hasData&&<div style={s.card}><div style={s.cardTitle}><span>◆</span> {tx.moTitle} — {fileName}</div>
      <MarkoutVisualizer points={points} unit={unit} theme={t} tx={tx}/>
    </div>}
    {hasData&&<div style={s.card}><div style={s.cardTitle}><span>📊</span> {tx.moLabel} {tx.moType} — {points.length} {tx.moTotalPts.toLowerCase()}</div>
      <div style={{overflowX:"auto"}}>
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
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function WYPAssist(){
  const[lang,setLang]=useState("usa");const[tab,setTab]=useState("load");
  // Shared Pull Sheet motor state — can be set from Markout tab
  const[sharedMotors,setSharedMotors]=useState(null);
  const theme=THEMES[lang];const styles=mkS(theme);const tx=i18n[lang];
  const tabList=[{id:"load",icon:"⚙",label:tx.tabLoad},{id:"pull",icon:"📋",label:tx.tabPull},{id:"bridle",icon:"△",label:tx.tabBridle},{id:"markout",icon:"📐",label:tx.tabMarkout}];
  const ctx=useMemo(()=>({s:styles,t:theme,lang,tx,setTab,sharedMotors,setSharedMotors}),[lang,sharedMotors]);
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
        `}</style>
        <FlagStripe theme={lang}/>
        <header style={styles.header}><div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><span style={{fontFamily:"'Orbitron',sans-serif"}}>W</span></div>
            <div><div style={{...styles.logoText,fontFamily:"'Orbitron',sans-serif"}}>{tx.appName}</div><div style={styles.logoSub}>{tx.appSub}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"nowrap",flexShrink:0}}>
            <nav style={styles.nav}>{tabList.map(tb=><button key={tb.id} style={styles.navBtn(tab===tb.id)} onClick={()=>setTab(tb.id)}>{tb.icon} {tb.label}</button>)}</nav>
            <div style={{height:28,width:1,background:theme.border,flexShrink:0}}/>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button style={styles.langBtn(lang==="usa")} onClick={()=>setLang("usa")}><span>🇺🇸</span><span style={{fontSize:11}}>EN</span></button>
              <button style={styles.langBtn(lang==="pr")} onClick={()=>setLang("pr")}><span>🇵🇷</span><span style={{fontSize:11}}>ES</span></button>
            </div>
          </div>
        </div></header>
        <FlagStripe theme={lang}/>
        <main style={styles.main}>
          <div style={styles.disc}>{tx.disclaimer}</div>
          {tab==="load"&&<PointLoadTab/>}
          {tab==="pull"&&<PullSheetTab/>}
          {tab==="bridle"&&<BridleTab/>}
          {tab==="markout"&&<MarkoutTab/>}
          <footer style={{textAlign:"center",padding:"40px 0 20px",borderTop:`1px solid ${theme.border}`,marginTop:40}}>
            <div style={{fontSize:24,marginBottom:8}}>{lang==="usa"?"🇺🇸":"🇵🇷"}</div>
            <div style={{fontSize:11,color:theme.textSecondary,letterSpacing:2,textTransform:"uppercase"}}>{tx.footer1}</div>
            <div style={{fontSize:10,color:`${theme.textSecondary}60`,marginTop:4}}>{tx.footer2}</div>
          </footer>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}
