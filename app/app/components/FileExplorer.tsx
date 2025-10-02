import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  listFiles,
  loadFile,
  removeFile,
  renameFile,
  useFileStorage,
} from "../../utils/storage";

export function FileExplorer({
  selected,
  onSelect,
  onNew,
  onRenamed,
  onDeleted,
  refreshKey,
}: {
  selected: string;
  onSelect: (name: string, content: string) => void;
  onNew: () => void;
  onRenamed?: (oldName: string, newName: string) => void;
  onDeleted?: (name: string) => void;
  refreshKey?: number;
}) {
  const { files, setFiles } = useFileStorage();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  const refreshFiles = () => {
    const names = listFiles();
    setFiles(names);
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) refreshFiles();
  }, [refreshKey]);

  const loadFromPicker = (name: string) => {
    const result = loadFile(name);
    if (result.ok) {
      onSelect(name, result.content);
      Alert.alert("Loaded", result.message);
    } else {
      Alert.alert("Load failed", result.message);
    }
  };

  const deleteFromPicker = (name: string) => {
    removeFile(name);
    if (name === selected) {
      onNew();
    }
    onDeleted?.(name);
    refreshFiles();
  };

  const startRename = (name: string) => {
    setRenaming(name);
    setRenameDraft(name);
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
      if (selected === res.oldName) {
        onRenamed?.(res.oldName, res.newName);
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

  const header = useMemo(
    () => (
      <View className="px-3 pt-3 pb-2 flex-row items-center justify-between">
        <Text className="text-white">Files</Text>
        <Pressable
          onPress={onNew}
          className="px-2 py-1 rounded-md"
          style={{ backgroundColor: "#6b7280" }}
        >
          <Text className="text-white">New</Text>
        </Pressable>
      </View>
    ),
    [onNew]
  );

  return (
    <View className="w-56 border-r" style={{ borderColor: "#1f2937" }}>
      {header}
      <ScrollView style={{ flex: 1 }}>
        {files.length === 0 ? (
          <Text className="text-white px-3 py-2 opacity-70">No files yet</Text>
        ) : (
          files.map((name) => {
            const isActive = name === selected;
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
  );
}
