import { useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function GraphScreen() {
  const webviewRef = useRef<WebView>(null);
  const source = useMemo(() => {
    return require("../../assets/webview/graph/index.html");
  }, []);

  return (
    <View className="flex-1 bg-[#25292e]">
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={source}
        allowFileAccess
        allowingReadAccessToURL={"/"}
        javaScriptEnabled
        domStorageEnabled
        onMessage={() => {}}
      />
    </View>
  );
}
