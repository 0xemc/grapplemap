import React, { useMemo } from "react";
import { Platform, ScrollView, TextInput, View } from "react-native";
import { GrplHighlighter, defaultColors } from "./GrplHighlighter";

export function IdeEditor({
  value,
  onChange,
  monoFont,
  fontSize = 14,
}: {
  value: string;
  onChange: (text: string) => void;
  monoFont: string;
  fontSize?: number;
}) {
  const highlighted = useMemo(
    () => (
      <GrplHighlighter
        text={value}
        monoFont={monoFont as unknown as string}
        fontSize={fontSize}
        colors={defaultColors}
      />
    ),
    [value, monoFont, fontSize]
  );

  return (
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
        <View pointerEvents="none" style={{ padding: 12 }}>
          {highlighted}
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
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
              fontSize,
              lineHeight: fontSize * 1.4,
            },
            Platform.OS === "web" ? ({ caretColor: "#ffffff" } as any) : null,
          ]}
          textAlignVertical="top"
          selectionColor="#2563eb"
          placeholder="// Start typing your .grpl here"
          placeholderTextColor="#9aa0a6"
        />
      </View>
    </ScrollView>
  );
}

export default IdeEditor;
