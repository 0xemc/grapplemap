import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
// remove: import "@xyflow/react/dist/style.css";

type Props = { focused?: boolean };

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function GraphView({ focused }: Props) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((es) => addEdge(params, es)),
    []
  );

  const doFit = useCallback(() => {
    if (!rfInstance) return;
    // two RAFs to ensure styles/layout are fully applied
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          rfInstance.updateNodeInternals(nodes.map((n) => n.id));
          rfInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
        } catch {}
      })
    );
  }, [rfInstance, nodes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) doFit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doFit]);

  useEffect(() => {
    if (focused) doFit();
  }, [focused, doFit]);

  useEffect(() => {
    const onResize = () => doFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [doFit]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        onlyRenderVisibleElements={false}
        onInit={(inst) => {
          setRfInstance(inst);
          doFit();
        }}
      />
    </div>
  );
}
