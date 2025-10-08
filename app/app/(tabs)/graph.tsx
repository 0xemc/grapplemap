import { View, Platform } from "react-native";
import GraphView from "../components/GraphView";
import { useIsFocused } from "@react-navigation/native";

export default function GraphScreen() {
  const isFocused = useIsFocused();

  return (
    <View
      className="flex-1 relative bg-[#25292e]"
      style={Platform.OS === "web" ? { height: "100%" } : undefined}
    >
      {isFocused ? <GraphView focused={isFocused} /> : null}
    </View>
  );
}
