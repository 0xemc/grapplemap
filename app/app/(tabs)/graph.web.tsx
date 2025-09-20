import { View } from "react-native";
import "reactflow/dist/style.css";
import { GraphApp } from "graph-view";

export default function GraphScreen() {
  return (
    <View className="flex-1 bg-[#25292e]">
      <div style={{ height: "100%" }}>
        <GraphApp />
      </div>
    </View>
  );
}
