import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GraphView, addEdgeToEdgesList } from "graph-view";
import { useNodesState, useEdgesState, Connection, Edge } from "reactflow";

type Message =
  | { type: "addNode"; label?: string }
  | { type: "setGraph"; nodes: any[]; edges: any[] }
  | { type: "ping" };

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "2", position: { x: 150, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = (params: Connection | Edge) =>
    setEdges((eds) => addEdgeToEdgesList(params, eds));

  useEffect(() => {
    (window as any).ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "ready" })
    );
    const handler = (e: MessageEvent) => {
      try {
        const msg: Message = JSON.parse((e as any).data);
        if (msg.type === "addNode") {
          const id = String(nodes.length + 1);
          setNodes((ns) =>
            ns.concat({
              id,
              position: { x: Math.random() * 250, y: Math.random() * 250 },
              data: { label: msg.label || `Node ${id}` },
            })
          );
        } else if (msg.type === "setGraph") {
          setNodes(msg.nodes as any);
          setEdges(msg.edges as any);
        } else if (msg.type === "ping") {
          (window as any).ReactNativeWebView?.postMessage(
            JSON.stringify({ type: "pong" })
          );
        }
      } catch (err) {}
    };
    window.addEventListener("message", handler);
    document.addEventListener("message", handler as any);
    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("message", handler as any);
    };
  }, [nodes.length, setNodes, setEdges]);

  return (
    <div style={{ height: "100%" }}>
      <GraphView
        nodes={nodes as any}
        edges={edges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
