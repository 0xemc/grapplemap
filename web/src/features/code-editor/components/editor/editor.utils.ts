import { matchTransition } from "$lib/utils/transitionParser";
import { linter } from "@codemirror/lint";
import type { EditorView } from "@codemirror/view";

export function toggleLineComments(view: EditorView): boolean {
    const doc = view.state.doc;
    const ranges = view.state.selection.ranges;

    // Collect unique lines touched by any selection range
    const seen = new Set<number>();
    const lines = [];
    for (const r of ranges) {
        const fromLine = doc.lineAt(r.from).number;
        const toLine = doc.lineAt(r.to).number;
        for (let n = fromLine; n <= toLine; n++) {
            if (!seen.has(n)) {
                lines.push(doc.line(n));
                seen.add(n);
            }
        }
    }
    if (lines.length === 0) return false;

    const allCommented = lines.every(l => /^\s*\/\//.test(l.text));
    const changes: { from: number; to: number; insert: string }[] = [];

    if (allCommented) {
        // Uncomment: remove the first '//' after any leading whitespace
        for (const l of lines) {
            const wsLen = (l.text.match(/^\s*/)?.[0].length) ?? 0;
            if (l.text.slice(wsLen, wsLen + 2) === '//') {
                changes.push({ from: l.from + wsLen, to: l.from + wsLen + 2, insert: '' });
            }
        }
    } else {
        // Comment: insert '//' after leading whitespace (preserves indentation)
        for (const l of lines) {
            const wsLen = (l.text.match(/^\s*/)?.[0].length) ?? 0;
            const pos = l.from + wsLen;
            changes.push({ from: pos, to: pos, insert: '//' });
        }
    }

    if (!changes.length) return false;
    view.dispatch({ changes });
    return true;
}



export const grammarLint = linter(async (view) => {
    const text = view.state.doc.toString();
    const m = await matchTransition(text);
    if (!m.failed()) return [];

    const interval = m.getInterval?.();
    const from = interval?.startIdx ?? 0;
    const to = Math.min(from + 1, view.state.doc.length);
    return [
        {
            from,
            to,
            severity: 'error',
            message: m.message ?? 'Syntax error'
        }
    ];
});