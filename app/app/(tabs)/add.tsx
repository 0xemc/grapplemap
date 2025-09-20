import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  loadFile,
  saveFile,
  listFiles,
  removeFile,
  renameFile,
} from "../../utils/storage";

// Syntax highlighting utilities for .grpl content
type HighlightSegment = { text: string; style?: any };

const editorColors = {
  default: "#e5e7eb",
  tag: "#c7c8c977",
  arrow: "#f59e0baa",
  // arrow: "#e5e7eb",
  stepNum: "#e5e7eb77",
  title: "#60a5fa",
  position: "#e5e7eb",
};

function isTitleLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (/^\d+\.\s/.test(trimmed)) return false; // step line
  if (trimmed.startsWith("[")) return false; // tag line
  if (trimmed.includes("->")) return false; // from_to line
  return true;
}

function tokenizeLine(line: string): HighlightSegment[] {
  // Tag-only line like: [url: http://something]
  if (/^\s*\[[^\]]+\]\s*$/.test(line)) {
    return [{ text: line, style: { color: editorColors.tag } }];
  }

  // Title lines get a single styled segment
  if (isTitleLine(line)) {
    return [{ text: line, style: { color: editorColors.title } }];
  }

  const segments: HighlightSegment[] = [];

  // Handle leading step number like: "1. ", "2.  ", including leading spaces
  const stepMatch = line.match(/^(\s*)(\d+)(\.)\s*/);
  let idx = 0;
  if (stepMatch) {
    const [full, leading, num, dot] = stepMatch;
    if (leading) segments.push({ text: leading });
    segments.push({ text: num, style: { color: editorColors.stepNum } });
    segments.push({ text: dot + " " });
    idx = full.length;
  }

  // If the remainder contains an arrow, highlight positions on both sides
  const remainderForArrow = line.slice(idx);
  const arrowIndex = remainderForArrow.indexOf("->");
  if (arrowIndex !== -1) {
    const left = remainderForArrow.slice(0, arrowIndex);
    const right = remainderForArrow.slice(arrowIndex + 2);
    if (left)
      segments.push({ text: left, style: { color: editorColors.position } });
    segments.push({ text: "->", style: { color: editorColors.arrow } });
    if (right)
      segments.push({ text: right, style: { color: editorColors.position } });
    return segments.length === 0 ? [{ text: "" }] : segments;
  }

  // Tokenizer that highlights bracketed tags in the remainder
  const remainder = line.slice(idx);
  const tokenRegex = /(\[[^\]]+\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(remainder)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ text: remainder.slice(lastIndex, m.index) });
    }
    const token = m[0];
    if (token === "->") {
      segments.push({ text: token, style: { color: editorColors.arrow } });
    } else {
      // bracketed tag
      segments.push({ text: token, style: { color: editorColors.tag } });
    }
    lastIndex = m.index + token.length;
  }
  if (lastIndex < remainder.length) {
    segments.push({ text: remainder.slice(lastIndex) });
  }

  // If no segments were added (empty line), preserve it
  if (segments.length === 0) {
    segments.push({ text: "" });
  }

  return segments;
}

function renderHighlighted(text: string, monoFont: string, fontSize: number) {
  const lines = text.split("\n");
  return (
    <Text
      style={{
        color: editorColors.default,
        fontFamily: monoFont as any,
        fontSize,
        lineHeight: fontSize * 1.4,
      }}
    >
      {lines.map((line, i) => (
        <Text key={i}>
          {tokenizeLine(line).map((seg, j) => (
            <Text key={j} style={seg.style}>
              {seg.text}
            </Text>
          ))}
          {i < lines.length - 1 ? "\n" : ""}
        </Text>
      ))}
    </Text>
  );
}

export default function AddScreen() {
  const [filename, setFilename] = useState("untitled.grpl");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  const save = () => {
    const result = saveFile(filename, content);
    if (result.ok) {
      Alert.alert("Saved", result.message);
      // Ensure the sidebar reflects newly saved files
      refreshFiles();
    } else {
      Alert.alert("Save failed", result.message);
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

  const editorFontSize = 14;

  const highlighted = useMemo(
    () =>
      renderHighlighted(content, monoFont as unknown as string, editorFontSize),
    [content, monoFont]
  );

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

  const startRename = (name: string) => {
    setRenaming(name);
    setRenameDraft(name);
    // Focus on the inputRef: set focus to the filename input when starting a rename
    setTimeout(() => {
      if (inputRef && typeof inputRef.current?.focus === "function") {
        inputRef.current?.focus();
      }
    }, 0);
  };

  const commitRename = () => {
    if (renaming == null) return;
    const res = renameFile(renaming, renameDraft);
    if (res.ok) {
      if (filename === res.oldName) {
        setFilename(res.newName);
      }
      Alert.alert("Renamed", res.message);
      setRenaming(null);
      setRenameDraft("");
      refreshFiles();
    } else {
      Alert.alert("Rename failed", res.message);
    }
  };

  const cancelRename = () => {
    setRenaming(null);
    setRenameDraft("");
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  // Auto-open the first file if nothing is selected yet
  useEffect(() => {
    if (files.length > 0 && filename === "untitled.grpl" && content === "") {
      loadFromPicker(files[0]);
    }
  }, [files]);

  return (
    <View className="flex-1 bg-[#25292e] flex-row">
      {/* Side panel */}
      <View className="w-56 border-r" style={{ borderColor: "#1f2937" }}>
        <View className="px-3 pt-3 pb-2 flex-row items-center justify-between">
          <Text className="text-white">Files</Text>
          <Pressable
            onPress={reset}
            className="px-2 py-1 rounded-md"
            style={{ backgroundColor: "#6b7280" }}
          >
            <Text className="text-white">New</Text>
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {files.length === 0 ? (
            <Text className="text-white px-3 py-2 opacity-70">
              No files yet
            </Text>
          ) : (
            files.map((name) => {
              const isActive = name === filename;
              return (
                <View
                  key={name}
                  className="px-3 py-2 flex-row items-center justify-between"
                  style={{
                    backgroundColor: isActive ? "#374151" : "transparent",
                    borderLeftWidth: isActive ? 3 : 3,
                    borderLeftColor: isActive ? "#3b82f6" : "transparent",
                    position: renaming === name ? "relative" : undefined,
                    zIndex: renaming === name ? 50 : undefined,
                  }}
                >
                  {renaming === name ? (
                    <View className="flex-1 flex-row items-center gap-2">
                      <TextInput
                        ref={inputRef}
                        value={renameDraft}
                        onChangeText={setRenameDraft}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onKeyPress={(e) => {
                          if (e.nativeEvent.key === "Enter") {
                            commitRename();
                          }
                        }}
                        className="flex-1 text-white px-2 py-1 rounded w-2"
                        style={{ backgroundColor: "#1f2937" }}
                      />
                      <Pressable
                        onPress={commitRename}
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: "#10b981" }}
                      >
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </Pressable>
                      <Pressable
                        onPress={cancelRename}
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: "#6b7280" }}
                      >
                        <Ionicons name="close" size={12} color="#ffffff" />
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => loadFromPicker(name)}
                        className="flex-1 mr-2"
                      >
                        <Text
                          className="text-white"
                          numberOfLines={1}
                          style={{ fontWeight: isActive ? "600" : "400" }}
                        >
                          {name}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => startRename(name)}
                        className="px-1 py-1 rounded-md"
                      >
                        <Ionicons
                          name="create-outline"
                          size={12}
                          color="#ffffff"
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => deleteFromPicker(name)}
                        className="px-2 py-1 rounded-md"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={12}
                          color="#ffffff"
                        />
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })
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
        </View>

        <View className="flex-1 px-3 pb-3">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                position: "relative",
                backgroundColor: "#1e1e1e",
                borderRadius: 6,
                minHeight: 300,
                height: "100%",
              }}
            >
              {/* Highlighted layer */}
              <View pointerEvents="none" style={{ padding: 12 }}>
                {highlighted}
              </View>

              {/* Transparent input overlay */}
              <TextInput
                value={content}
                onChangeText={setContent}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    padding: 12,
                    color: "transparent",
                    fontFamily: monoFont as any,
                    fontSize: editorFontSize,
                    lineHeight: editorFontSize * 1.4,
                  },
                  Platform.OS === "web"
                    ? ({ caretColor: "#ffffff" } as any)
                    : null,
                ]}
                textAlignVertical="top"
                selectionColor="#2563eb"
                placeholder="// Start typing your .grpl here"
                placeholderTextColor="#9aa0a6"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
