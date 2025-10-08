import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { IdeEditor } from "../components/IdeEditor";
import { FileExplorer } from "../components/FileExplorer";
import { loadFile, saveFile, useFileStorage } from "../../utils/storage";
import { useMonoFont } from "@/utils/fonts";

// highlighting/editor overlay extracted to components

export default function AddScreen() {
  const [filename, setFilename] = useState("untitled.grpl");
  const [content, setContent] = useState("");
  const { files } = useFileStorage();
  // Sidebar rename state handled in FileExplorer

  const save = () => {
    const result = saveFile(filename, content);
    if (result.ok) {
      Alert.alert("Saved", result.message);
    } else {
      Alert.alert("Save failed", result.message);
    }
  };

  const reset = () => {
    setFilename("untitled.grpl");
    setContent("");
  };

  const monoFont = useMonoFont();

  const editorFontSize = 14;

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

  // Auto-open the first file if nothing is selected yet
  useEffect(() => {
    if (files.length > 0 && filename === "untitled.grpl" && content === "") {
      loadFromPicker(files[0]);
    }
  }, [files]);

  return (
    <View className="flex-1 bg-[#25292e] flex-row">
      {/* Side panel */}
      <FileExplorer
        selected={filename}
        onNew={reset}
        onSelect={(name, fileContent) => {
          setFilename(name);
          setContent(fileContent);
        }}
        onRenamed={(oldName, newName) => {
          if (filename === oldName) setFilename(newName);
        }}
      />

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
        </View>

        <View className="flex-1 px-3 pb-3">
          <IdeEditor
            value={content}
            onChange={setContent}
            monoFont={monoFont as any}
            fontSize={editorFontSize}
          />
        </View>
      </View>
    </View>
  );
}
