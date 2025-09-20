import React, { useMemo } from "react";
import { Text } from "react-native";

export type HighlightSegment = { text: string; style?: any };

export type EditorColors = {
  default: string;
  tag: string;
  arrow: string;
  stepNum: string;
  title: string;
  position: string;
};

const defaultEditorColors: EditorColors = {
  default: "#e5e7eb",
  tag: "#c7c8c977",
  arrow: "#f59e0baa",
  stepNum: "#e5e7eb77",
  title: "#60a5fa",
  position: "#e5e7eb",
};

function isTitleLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (/^\d+\.\s/.test(trimmed)) return false;
  if (trimmed.startsWith("[")) return false;
  if (trimmed.includes("->")) return false;
  return true;
}

function tokenizeLine(line: string, colors: EditorColors): HighlightSegment[] {
  if (/^\s*\[[^\]]+\]\s*$/.test(line)) {
    return [{ text: line, style: { color: colors.tag } }];
  }

  if (isTitleLine(line)) {
    return [{ text: line, style: { color: colors.title } }];
  }

  const segments: HighlightSegment[] = [];

  const stepMatch = line.match(/^(\s*)(\d+)(\.)\s*/);
  let idx = 0;
  if (stepMatch) {
    const [full, leading, num, dot] = stepMatch;
    if (leading) segments.push({ text: leading });
    segments.push({ text: num, style: { color: colors.stepNum } });
    segments.push({ text: dot + " " });
    idx = full.length;
  }

  const remainderForArrow = line.slice(idx);
  const arrowIndex = remainderForArrow.indexOf("->");
  if (arrowIndex !== -1) {
    const left = remainderForArrow.slice(0, arrowIndex);
    const right = remainderForArrow.slice(arrowIndex + 2);
    if (left) segments.push({ text: left, style: { color: colors.position } });
    segments.push({ text: "->", style: { color: colors.arrow } });
    if (right)
      segments.push({ text: right, style: { color: colors.position } });
    return segments.length === 0 ? [{ text: "" }] : segments;
  }

  const remainder = line.slice(idx);
  const tokenRegex = /(\[[^\]]+\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(remainder)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ text: remainder.slice(lastIndex, m.index) });
    }
    const token = m[0];
    segments.push({ text: token, style: { color: colors.tag } });
    lastIndex = m.index + token.length;
  }
  if (lastIndex < remainder.length) {
    segments.push({ text: remainder.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ text: "" });
  }

  return segments;
}

export function GrplHighlighter({
  text,
  monoFont,
  fontSize = 14,
  colors = defaultEditorColors,
}: {
  text: string;
  monoFont: string;
  fontSize?: number;
  colors?: EditorColors;
}) {
  const lines = useMemo(() => text.split("\n"), [text]);
  return (
    <Text
      style={{
        color: colors.default,
        fontFamily: monoFont as any,
        fontSize,
        lineHeight: fontSize * 1.4,
      }}
    >
      {lines.map((line, i) => (
        <Text key={i}>
          {tokenizeLine(line, colors).map((seg, j) => (
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

export const defaultColors = defaultEditorColors;
