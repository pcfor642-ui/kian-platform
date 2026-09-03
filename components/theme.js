export const LIGHT_THEME = {
  blue: "#21506E",
  blueSoft: "#E7EFF2",
  purple: "#1E8F82",
  purpleSoft: "#E6F4F1",
  bg: "#FAF7F1",
  surface: "#FFFFFF",
  glass: "rgba(255,255,255,0.68)",
  glassBorder: "rgba(255,255,255,0.85)",
  text: "#20242B",
  textSoft: "#6E6A60",
  textFaint: "#9C9686",
  border: "#E7E1D3",
  success: "#2E9E6D",
  successSoft: "#E8F5EE",
  warning: "#C9812E",
  warningSoft: "#F7ECDC",
  danger: "#C1503B",
  dangerSoft: "#F7E7E2",
  amber: "#B8722A",
  amberSoft: "#F3E4D2",
};

export const DARK_THEME = {
  blue: "#5FA8E0",
  blueSoft: "#16232F",
  purple: "#45C7B5",
  purpleSoft: "#12302B",
  bg: "#0C0F14",
  surface: "#161A21",
  glass: "rgba(22,26,33,0.65)",
  glassBorder: "rgba(255,255,255,0.08)",
  text: "#F3F1EA",
  textSoft: "#B8B3A6",
  textFaint: "#7C7768",
  border: "#2A2F38",
  success: "#4FCB92",
  successSoft: "#123023",
  warning: "#E0A559",
  warningSoft: "#332512",
  danger: "#E6836F",
  dangerSoft: "#331E19",
  amber: "#DA9A48",
  amberSoft: "#332512",
};

// Mutated in place on theme toggle; components read T.xxx at render time so a
// root-level re-render after mutation is enough to repaint everywhere.
export const T = { ...LIGHT_THEME };

export function applyTheme(dark) {
  Object.assign(T, dark ? DARK_THEME : LIGHT_THEME);
}

export const FONT = "'Vazirmatn', 'IRANSans', sans-serif";
