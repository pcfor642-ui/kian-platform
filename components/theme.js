export const LIGHT_THEME = {
  blue: "#21506E",
  blueSoft: "#E7EFF2",
  purple: "#1E8F82",
  purpleSoft: "#E6F4F1",
  bg: "#FAF7F1",
  surface: "#FFFFFF",
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
  blue: "#5AA1C7",
  blueSoft: "#1C3140",
  purple: "#3FB6A6",
  purpleSoft: "#163732",
  bg: "#15191E",
  surface: "#1E242B",
  text: "#F1EFE8",
  textSoft: "#B7B2A4",
  textFaint: "#807A6C",
  border: "#333B43",
  success: "#4CB98A",
  successSoft: "#173A2D",
  warning: "#D99A4E",
  warningSoft: "#3A2C16",
  danger: "#E17E6C",
  dangerSoft: "#3D231E",
  amber: "#D0913F",
  amberSoft: "#3A2C16",
};

// Mutated in place on theme toggle; components read T.xxx at render time so a
// root-level re-render after mutation is enough to repaint everywhere.
export const T = { ...LIGHT_THEME };

export function applyTheme(dark) {
  Object.assign(T, dark ? DARK_THEME : LIGHT_THEME);
}

export const FONT = "'Vazirmatn', 'IRANSans', sans-serif";
