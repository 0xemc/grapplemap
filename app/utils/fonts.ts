import { Platform } from "react-native";

export const useMonoFont = () => {
  if (Platform.OS === "ios") return "Menlo";
  if (Platform.OS === "android") return "monospace";
  return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
};
