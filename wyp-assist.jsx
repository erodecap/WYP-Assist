import { useState, useMemo, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
const CAT = {
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
const HOIST_GEAR_LIGHT = {
  "RIG10-00": { per: 7, round5: true, label: 'Shackle 5/8"' },
  "RIG10-05": { per: 1, label: 'Pear Ring 5/8" Crosby' },
  "RIG11-20": { per: 2, label: "S.T.A.C. Chain 3'" },
  "RIG10-50": { per: 2, label: 'Steel 3/8" Cable 2\'' },
  "RIG10-55": { per: 4, label: 'Steel 3/8" Cable 5\'' },
  "RIG10-60": { per: 4, label: 'Steel 3/8" Cable 10\'' },
  "RIG10-65": { per: 2, label: 'Steel 3/8" Cable 20\'' },
  "RIG11-30": { per: 2.5, roundUp: true, label: "Burlap" },
};
const HOIST_GEAR_HEAVY = {
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
  usa: { accent: "#BF0A30", accentLight: "#E8253A", secondary: "#002868", bg: "#0C0C0C", surface: "#1A1A1A", surfaceLight: "#242424", border: "#3A3A3A", textPrimary: "#F5F5F5", textSecondary: "#9A9A9A", headerGradient: "linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 50%, #1A1A1A 100%)", cardGlow: "0 0 40px rgba(191,10,48,0.06)", accentGradient: "linear-gradient(135deg, #BF0A30 0%, #E8253A 100%)" },
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
    psGrandTotals:"Grand Totals — All Gear",psTotalChain:"Total Chain Hoists",psEmpty:"Add motors above to generate your pull sheet",psExportPDF:"Export PDF",
    psAddons:"Additional Equipment",psAddonSub:"Add quantities for optional gear",
    brTitle:"Bridle Calculator",brType:"Bridle Type",brConfig:"Configuration",brDimensions:"Dimensions",brBeamSpacing:"Distance Between Beams",brLoadWeight:"Load Weight",brPickSpacing:"Pick Point Spacing",brHeadroom:"Available Headroom",brThirdLeg:"Third Leg Offset",brHoistType:"Hoist Type (for gear list)",brMotorRating:"Motor Rating",brResults:"Bridle Results",brLegLength:"Leg Length",brIncAngle:"Included Angle",brApexHeight:"Apex Height",brPerLeg:"per Leg",brHorizForce:"Horizontal Force",brLegs:"Legs",brThirdLegLen:"Third Leg Length",brNotes:"Rigging Notes",brVisual:"Bridle Diagram",
    brNote1:"Always verify beam/structure capacity before loading. Angles above 90° significantly increase leg tension.",brNote2:"Horizontal forces must be resolved by the structure. Confirm breast line capacity if used.",brNote3:"Arena bridles: ensure all four attachment points are at equal elevation.",brGearList:"Bridle Gear List",brAngleWarn:"ANGLE WARNING",brAngleWarnText:"Included angle exceeds 120°. Leg loads increase dramatically. Consider wider beam spacing or more headroom.",brError:"Beam spacing must be > pick point spacing.",brEmpty:"Enter dimensions above to calculate bridle geometry",
    twoLeg:"2-Leg",threeLeg:"3-Leg",arena:"Arena (4-Leg)",sameSpreahalf:"Same as half-spread",
    gridIron:"Grid / Iron",beam:"Beam",load:"Load",
  },
  pr: {
    appName:"WYP ASSIST",appSub:"Herramientas de Aparejo para Entretenimiento",tabLoad:"Carga Puntual",tabPull:"Hoja de Tiro",tabBridle:"Calc. Brida",
    disclaimer:"⚠ Todos los cálculos son estimaciones para planificación. Verifique con un ingeniero estructural calificado. Factor de seguridad mínimo de 5:1.",
    footer1:"WYP Assist v1.0",footer2:"Cálculos profesionales de aparejo para entretenimiento",
    plTitle:"Calculadora de Carga Puntual",plSystemType:"Tipo de Sistema",plTotalLoad:"Carga Total",plNumPoints:"Número de Puntos",plSpanLength:"Longitud del Tramo",plChordAngle:"Ángulo de Cuerda",plRadius:"Radio",plArcAngle:"Ángulo de Arco (° — 360 para círculo)",plDropHeight:"Altura de Caída",plResults:"Resultados",plPerPoint:"por punto",plDesignLoad:"Carga de Diseño",plHoistPoints:"Puntos de Polipasto",plSystemDetails:"Detalles del Sistema",plNotes:"Notas",plConfig:"Configuración de Aparejo",plVisual:"Diagrama del Sistema",
    straight:"Recto",curved:"Curvo",circular:"Circular",vertical:"Vertical",
    straightNote:"Distribución uniforme a lo largo de truss/tubo recto",straightNote2:"Puntos finales ~60%, puntos medios ~115%",curvedNote1:"Factor de corrección de curva",curvedNote2:"Puntos exteriores cargan más en curvas",circularEndNote:"puntos finales ~20% más",circularNote:"Circular distribuye carga uniforme a 360°",verticalNote1:"Cargas verticales: factor dinámico 1.25x",verticalNote2:"Considere carga de impacto en aceleración",openArc:"Arco abierto",
    psTitle:"Generador de Hoja de Tiro",psProject:"Nombre del Proyecto",psVenue:"Lugar",psChainSystem:"Sistema de Polipasto",psSystemType:"Tipo de Sistema",psMotorCounts:"Conteo de Motores",psHardware:"Herrajes",psSteelCable:"Acero",psTotalHoists:"Total Polipastos",psOnSystem:"en",psSystem:"sistema",psPullSheet:"Hoja de Tiro",psProject2:"Proyecto",psVenue2:"Lugar",psChainSys2:"Sistema de Cadena",psBreakdown:"Desglose por Tipo de Motor",psMotors:"Motores",psItem:"Artículo",psSize:"Cat. ID",psQty:"Cant.",
    psGrandTotals:"Totales Generales — Todo el Equipo",psTotalChain:"Total Polipastos",psEmpty:"Agregue motores para generar la hoja",psExportPDF:"Exportar PDF",
    psAddons:"Equipo Adicional",psAddonSub:"Agregue cantidades para equipo opcional",
    brTitle:"Calculadora de Brida",brType:"Tipo de Brida",brConfig:"Configuración",brDimensions:"Dimensiones",brBeamSpacing:"Distancia Entre Vigas",brLoadWeight:"Peso de Carga",brPickSpacing:"Espaciado de Puntos",brHeadroom:"Altura Disponible",brThirdLeg:"Desplazamiento 3ra Pata",brHoistType:"Tipo de Polipasto (para equipo)",brMotorRating:"Capacidad del Motor",brResults:"Resultados de Brida",brLegLength:"Longitud de Pata",brIncAngle:"Ángulo Incluido",brApexHeight:"Altura del Ápice",brPerLeg:"por Pata",brHorizForce:"Fuerza Horizontal",brLegs:"Patas",brThirdLegLen:"Longitud 3ra Pata",brNotes:"Notas de Aparejo",brVisual:"Diagrama de Brida",
    brNote1:"Verifique capacidad de viga/estructura. Ángulos >90° aumentan tensión.",brNote2:"Fuerzas horizontales resueltas por la estructura. Confirme línea de pecho.",brNote3:"Arena: cuatro puntos a misma elevación.",brGearList:"Lista de Equipo de Brida",brAngleWarn:"ADVERTENCIA DE ÁNGULO",brAngleWarnText:"Ángulo >120°. Cargas aumentan dramáticamente.",brError:"Espaciado de vigas debe ser > espaciado de puntos.",brEmpty:"Ingrese dimensiones para calcular",
    twoLeg:"2-Patas",threeLeg:"3-Patas",arena:"Arena (4-Patas)",sameSpreahalf:"Igual que mitad de extensión",
    gridIron:"Parrilla",beam:"Viga",load:"Carga",
  },
};

const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const CHAIN_SYSTEMS = ["60'", "80'", "125'"];
const MOTOR_TYPES = [".25 Ton", ".5 Ton", "1 Ton", "2 Ton"];
function r5(n) { return Math.ceil(n / 5) * 5; }
function rU(n) { return Math.ceil(n); }
const danger = "#E74C3C", success = "#2ECC71", warning = "#E67E22";

function calcHoistGear(motorType, count) {
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
    nav:{display:"flex",gap:4,flexWrap:"wrap"},
    navBtn:(a)=>({padding:"10px 20px",background:a?t.accent:"transparent",color:a?"#fff":t.textSecondary,border:`1px solid ${a?t.accent:t.border}`,borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:a?800:500,letterSpacing:1.2,textTransform:"uppercase",transition:"all .2s"}),
    langBtn:(a)=>({padding:"8px 14px",background:a?t.secondary:"transparent",color:a?"#fff":t.textSecondary,border:`1px solid ${a?t.secondary:t.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?700:500,transition:"all .2s",display:"flex",alignItems:"center",gap:6}),
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
    chip:(a)=>({padding:"8px 16px",background:a?`${t.accent}18`:t.surfaceLight,color:a?t.accent:t.textSecondary,border:`1px solid ${a?t.accent:t.border}`,borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?700:500,letterSpacing:1,transition:"all .2s"}),
    ctr:{display:"inline-flex",alignItems:"center",border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"},
    ctrBtn:{width:34,height:34,background:t.surfaceLight,border:"none",color:t.textPrimary,cursor:"pointer",fontFamily:"inherit",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"},
    ctrVal:{width:42,height:34,background:t.surface,borderLeft:`1px solid ${t.border}`,borderRight:`1px solid ${t.border}`,color:t.accent,fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"},
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
    exportBtn:{padding:"12px 28px",background:t.accent,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:8,transition:"all .2s"},
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
      <div style={s.ctrVal}>{value}</div>
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
function generatePDF({projectName,venue,chainSystem,totalHoists,hoistLines,addonItems,tx,theme}){
  const scr=document.createElement('script');scr.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  scr.onload=()=>{
    const{jsPDF}=window.jspdf;const doc=new jsPDF('p','mm','letter');
    const pw=215.9,ml=18,mr=18;let y=4;
    const ac=theme==="usa"?[191,10,48]:[237,0,0],sc2=theme==="usa"?[0,40,104]:[0,80,240];
    // Flag stripe
    [[ac],[255,255,255],[sc2],[255,255,255],[ac]].forEach((c,i)=>{doc.setFillColor(...c[0]?c:[c]);doc.setFillColor(...(i===0||i===4?ac:i===2?sc2:[255,255,255]));doc.rect(pw/5*i,0,pw/5,4,'F');});
    y=14;doc.setFont('helvetica','bold');doc.setFontSize(22);doc.setTextColor(...ac);doc.text('WYP ASSIST',ml,y);
    y+=6;doc.setFontSize(9);doc.setTextColor(120,120,120);doc.text(tx.appSub.toUpperCase(),ml,y);
    y+=4;doc.setFontSize(16);doc.setTextColor(40,40,40);doc.text(tx.psPullSheet,ml,y+8);y+=14;
    // Info
    doc.setFillColor(245,245,245);doc.rect(ml,y,pw-ml-mr,22,'F');doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(80,80,80);let iy=y+7;
    if(projectName){doc.text(`${tx.psProject2}: ${projectName}`,ml+4,iy);iy+=6;}
    if(venue){doc.text(`${tx.psVenue2}: ${venue}`,ml+4,iy);iy+=6;}
    doc.text(`${tx.psChainSys2}: ${chainSystem}  |  ${tx.psTotalHoists}: ${totalHoists}`,ml+4,iy);y+=28;
    doc.text(`Date: ${new Date().toLocaleDateString()}`,pw-mr-40,y-24);

    // Per-type tables
    hoistLines.forEach(line=>{
      if(y>240){doc.addPage();y=14;}
      doc.setFillColor(...ac);doc.rect(ml,y,pw-ml-mr,7,'F');
      doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      doc.text(`${line.ty} ${tx.psMotors}  (x${line.c})`,ml+3,y+5);y+=10;
      // Header
      doc.setFillColor(235,235,235);doc.rect(ml,y,pw-ml-mr,6,'F');
      doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(100,100,100);
      doc.text('CAT. ID',ml+3,y+4);doc.text(tx.psItem.toUpperCase(),ml+32,y+4);doc.text(tx.psQty.toUpperCase(),pw-mr-12,y+4);y+=8;
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      line.items.forEach(({catId,name,qty},idx)=>{
        if(idx%2===0){doc.setFillColor(250,250,250);doc.rect(ml,y-3,pw-ml-mr,6,'F');}
        doc.setTextColor(140,140,140);doc.text(catId,ml+3,y+1);
        doc.setTextColor(60,60,60);doc.text(name,ml+32,y+1);
        doc.setTextColor(...ac);doc.setFont('helvetica','bold');doc.text(String(qty),pw-mr-8,y+1);doc.setFont('helvetica','normal');
        y+=6;
      });y+=6;
    });

    // Add-ons
    const activeAddons=addonItems.filter(a=>a.qty>0);
    if(activeAddons.length>0){
      if(y>220){doc.addPage();y=14;}
      y+=2;doc.setFillColor(...sc2);doc.rect(ml,y,pw-ml-mr,7,'F');
      doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      doc.text(tx.psAddons.toUpperCase(),ml+3,y+5);y+=10;
      doc.setFillColor(235,235,235);doc.rect(ml,y,pw-ml-mr,6,'F');
      doc.setFontSize(8);doc.setTextColor(100,100,100);
      doc.text('CAT. ID',ml+3,y+4);doc.text(tx.psItem.toUpperCase(),ml+32,y+4);doc.text(tx.psQty.toUpperCase(),pw-mr-12,y+4);y+=8;
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      activeAddons.forEach(({catId,name,qty},idx)=>{
        if(idx%2===0){doc.setFillColor(250,250,250);doc.rect(ml,y-3,pw-ml-mr,6,'F');}
        doc.setTextColor(140,140,140);doc.text(catId,ml+3,y+1);
        doc.setTextColor(60,60,60);doc.text(name,ml+32,y+1);
        doc.setTextColor(...ac);doc.setFont('helvetica','bold');doc.text(String(qty),pw-mr-8,y+1);doc.setFont('helvetica','normal');
        y+=6;
      });
    }

    // Grand totals
    if(y>220){doc.addPage();y=14;}
    y+=4;doc.setFillColor(...ac);doc.rect(ml,y,pw-ml-mr,8,'F');
    doc.setFontSize(11);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
    doc.text(tx.psGrandTotals,ml+3,y+6);y+=12;
    // Merge all items by catId
    const merged={};
    hoistLines.forEach(l=>l.items.forEach(({catId,name,qty})=>{merged[catId]=(merged[catId]||{name,qty:0});merged[catId].qty+=qty;}));
    activeAddons.forEach(({catId,name,qty})=>{merged[catId]=(merged[catId]||{name,qty:0});merged[catId].qty+=qty;});
    doc.setFontSize(9);
    Object.entries(merged).filter(([,v])=>v.qty>0).forEach(([catId,{name,qty}],idx)=>{
      if(y>270){doc.addPage();y=14;}
      if(idx%2===0){doc.setFillColor(245,245,250);doc.rect(ml,y-3,pw-ml-mr,6,'F');}
      doc.setFont('helvetica','normal');doc.setTextColor(140,140,140);doc.text(catId,ml+3,y+1);
      doc.setTextColor(60,60,60);doc.text(name,ml+32,y+1);
      doc.setFont('helvetica','bold');doc.setTextColor(...ac);doc.text(String(qty),pw-mr-8,y+1);y+=6;
    });
    y+=2;doc.setFillColor(...ac);doc.rect(ml,y,pw-ml-mr,8,'F');doc.setFontSize(10);doc.setTextColor(255,255,255);
    doc.text(`${tx.psTotalChain} (${chainSystem})`,ml+3,y+6);doc.setFontSize(14);doc.text(String(totalHoists),pw-mr-14,y+6);
    // Footer
    doc.setFontSize(7);doc.setTextColor(160,160,160);doc.text(`${tx.footer1} | ${tx.footer2}`,ml,279.4-8);
    doc.save(`WYP_PullSheet_${projectName||'export'}.pdf`);
  };document.head.appendChild(scr);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: POINT LOAD
// ═══════════════════════════════════════════════════════════════════════════════
const RIG_KEYS=["straight","curved","circular","vertical"];
function PointLoadTab(){
  const{s,t,tx}=useTheme();
  const[rig,setRig]=useState("straight");const[load,setLoad]=useState("");const[pts,setPts]=useState("");
  const[span,setSpan]=useState("");const[chord,setChord]=useState("");const[rad,setRad]=useState("");
  const[arc,setArc]=useState("");const[drop,setDrop]=useState("");const[unit,setUnit]=useState("imperial");
  const labels={straight:tx.straight,curved:tx.curved,circular:tx.circular,vertical:tx.vertical};
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
        {rig==="vertical"&&<Field label={`${tx.plDropHeight} (${uD})`}><Inp value={drop} onChange={setDrop} placeholder="0"/></Field>}
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
  const{s,t,tx,lang}=useTheme();
  const[cs,setCs]=useState("60'");
  const[m,setM]=useState({".25 Ton":0,".5 Ton":0,"1 Ton":0,"2 Ton":0});
  const[pn,setPn]=useState("");const[vn,setVn]=useState("");
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

  const handleExport=()=>{if(!hasData)return;generatePDF({projectName:pn,venue:vn,chainSystem:cs,totalHoists:tot,hoistLines,addonItems,tx,theme:lang});};

  return(<div>
    <div style={s.card}>
      <div style={s.cardTitle}><span style={{fontSize:18}}>📋</span> {tx.psTitle}</div>
      <div style={s.g2}>
        <Field label={tx.psProject}><Inp type="text" value={pn} onChange={setPn} placeholder="..."/></Field>
        <Field label={tx.psVenue}><Inp type="text" value={vn} onChange={setVn} placeholder="..."/></Field>
      </div>
      <div style={s.secTitle}>{tx.psChainSystem}</div>
      <Field label={tx.psSystemType}><Chips options={CHAIN_SYSTEMS} value={cs} onChange={setCs}/></Field>
      <div style={s.secTitle}>{tx.psMotorCounts}</div>
      <div style={s.g4}>
        {MOTOR_TYPES.map(ty=>{const isH=parseFloat(ty)>1;return(
          <div key={ty} style={s.mCard}>
            <div style={{fontSize:13,fontWeight:700,color:t.accent,marginBottom:4}}>{ty}</div>
            <div style={{fontSize:9,color:t.textSecondary,marginBottom:12}}>{isH?'3/4" · 1/2"':'5/8" · 3/8"'}</div>
            <div style={s.ctr}><button style={s.ctrBtn} onClick={()=>mc(ty,-1)}>−</button><div style={s.ctrVal}>{m[ty]}</div><button style={s.ctrBtn} onClick={()=>mc(ty,1)}>+</button></div>
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

    {/* ── PULL SHEET OUTPUT ── */}
    {hasData?(
      <div style={s.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <div style={{...s.cardTitle,marginBottom:0,paddingBottom:0,borderBottom:"none"}}><span>◆</span> {tx.psPullSheet}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {pn&&<span style={s.badge(t.accent)}>{pn}</span>}
            <button style={s.exportBtn} onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {tx.psExportPDF}
            </button>
          </div>
        </div>
        {(pn||vn)&&<div style={{marginBottom:20,padding:12,background:t.surfaceLight,borderRadius:4}}>{pn&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psProject2}:</span> {pn}</div>}{vn&&<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psVenue2}:</span> {vn}</div>}<div style={{fontSize:13}}><span style={{color:t.textSecondary}}>{tx.psChainSys2}:</span> {cs}</div></div>}

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
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function WYPAssist(){
  const[lang,setLang]=useState("usa");const[tab,setTab]=useState("load");
  const theme=THEMES[lang];const styles=mkS(theme);const tx=i18n[lang];
  const tabList=[{id:"load",icon:"⚙",label:tx.tabLoad},{id:"pull",icon:"📋",label:tx.tabPull},{id:"bridle",icon:"△",label:tx.tabBridle}];
  const ctx=useMemo(()=>({s:styles,t:theme,lang,tx}),[lang]);
  return(
    <ThemeCtx.Provider value={ctx}>
      <div style={styles.app}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          input:focus,select:focus{border-color:${theme.accent}!important;box-shadow:0 0 0 2px ${theme.accent}30!important}
          button:hover{opacity:0.88}button:active{transform:scale(0.97)}
          input[type=number]::-webkit-inner-spin-button{opacity:1}
          ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${theme.bg}}::-webkit-scrollbar-thumb{background:${theme.border};border-radius:3px}
        `}</style>
        <FlagStripe theme={lang}/>
        <header style={styles.header}><div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><span style={{fontFamily:"'Orbitron',sans-serif"}}>W</span></div>
            <div><div style={{...styles.logoText,fontFamily:"'Orbitron',sans-serif"}}>{tx.appName}</div><div style={styles.logoSub}>{tx.appSub}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <nav style={styles.nav}>{tabList.map(tb=><button key={tb.id} style={styles.navBtn(tab===tb.id)} onClick={()=>setTab(tb.id)}>{tb.icon} {tb.label}</button>)}</nav>
            <div style={{height:28,width:1,background:theme.border}}/>
            <div style={{display:"flex",gap:6}}>
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
