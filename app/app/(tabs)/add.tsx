import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { loadFile, saveFile } from "../../utils/storage";

export default function AddScreen() {
  const [filename, setFilename] = useState("untitled.grpl");
  const [content, setContent] = useState("");

  const save = () => {
    const result = saveFile(filename, content);
    if (result.ok) {
      Alert.alert("Saved", result.message);
    } else {
      Alert.alert("Save failed", result.message);
    }
  };

  const load = () => {
    const result = loadFile(filename);
    if (result.ok) {
      setContent(result.content);
      Alert.alert("Loaded", result.message);
    } else {
      Alert.alert("Load failed", result.message);
    }
  };

  const reset = () => {
    setFilename("untitled.grpl");
    setContent("");
  };

  const monoFont = useMemo(() => {
    if (Platform.OS === "ios") return "Menlo";
    if (Platform.OS === "android") return "monospace";
    return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  }, []);

  return (
    <View className="flex-1 bg-[#25292e]">
      <View className="px-3 pt-3 pb-2 flex-row items-center gap-2">
        <Text className="text-white mr-2">File</Text>
        <TextInput
          value={filename}
          onChangeText={setFilename}
          placeholder="filename.grpl"
          placeholderTextColor="#9aa0a6"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-white px-3 py-2 rounded-md"
          style={{ backgroundColor: "#1e1e1e" }}
        />
        <Pressable
          onPress={save}
          className="px-3 py-2 rounded-md"
          style={{ backgroundColor: "#3b82f6" }}
        >
          <Text className="text-white">Save</Text>
        </Pressable>
        <Pressable
          onPress={load}
          className="px-3 py-2 rounded-md"
          style={{ backgroundColor: "#10b981" }}
        >
          <Text className="text-white">Load</Text>
        </Pressable>
        <Pressable
          onPress={reset}
          className="px-3 py-2 rounded-md"
          style={{ backgroundColor: "#6b7280" }}
        >
          <Text className="text-white">New</Text>
        </Pressable>
      </View>

      <View className="flex-1 px-3 pb-3">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-white p-3 rounded-md"
            style={{
              backgroundColor: "#1e1e1e",
              fontFamily: monoFont as any,
              minHeight: 300,
            }}
            textAlignVertical="top"
            placeholder="// Start typing your .grpl here"
            placeholderTextColor="#9aa0a6"
          />
        </ScrollView>
      </View>
    </View>
  );
}
