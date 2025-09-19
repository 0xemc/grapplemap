import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { loadFile, saveFile, listFiles, removeFile } from "../../utils/storage";

export default function AddScreen() {
  const [filename, setFilename] = useState("untitled.grpl");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<string[]>([]);

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

  const refreshFiles = () => {
    const names = listFiles();
    setFiles(names);
  };

  const loadFromPicker = (name: string) => {
    const result = loadFile(name);
    if (result.ok) {
      setFilename(name);
      setContent(result.content);
      Alert.alert("Loaded", result.message);
    } else {
      Alert.alert("Load failed", result.message);
    }
  };

  const deleteFromPicker = (name: string) => {
    removeFile(name);
    if (name === filename) {
      reset();
    }
    refreshFiles();
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <View className="flex-1 bg-[#25292e] flex-row">
      {/* Side panel */}
      <View className="w-56 border-r" style={{ borderColor: "#1f2937" }}>
        <View className="px-3 pt-3 pb-2 flex-row items-center justify-between">
          <Text className="text-white">Files</Text>
          <Pressable
            onPress={refreshFiles}
            className="px-2 py-1 rounded-md"
            style={{ backgroundColor: "#374151" }}
          >
            <Text className="text-white">Refresh</Text>
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {files.length === 0 ? (
            <Text className="text-white px-3 py-2 opacity-70">
              No files yet
            </Text>
          ) : (
            files.map((name) => (
              <View
                key={name}
                className="px-3 py-2 flex-row items-center justify-between"
              >
                <Pressable
                  onPress={() => loadFromPicker(name)}
                  className="flex-1 mr-2"
                >
                  <Text className="text-white" numberOfLines={1}>
                    {name}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => deleteFromPicker(name)}
                  className="px-2 py-1 rounded-md"
                  style={{ backgroundColor: "#b91c1c" }}
                >
                  <Text className="text-white">Del</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Editor area */}
      <View className="flex-1">
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
            role="button"
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
    </View>
  );
}
