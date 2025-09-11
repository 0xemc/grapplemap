import React, { useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  addEdge,
} from "reactflow";

export type GraphViewProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect?: (connection: Connection | Edge) => void;
  className?: string;
  style?: React.CSSProperties;
  fitView?: boolean;
};

export function GraphView(props: GraphViewProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    className,
    style,
    fitView,
  } = props;
  const handleConnect = onConnect || ((params) => undefined);

  return (
    <div className={className} style={{ height: "100%", ...style }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => handleConnect(params as Connection)}
        fitView={fitView}
        onInit={(inst) => {
          if (fitView) inst.fitView({ padding: 0.2 });
        }}
      >
        <MiniMap />
        <Controls />
        <Background color="#555" />
      </ReactFlow>
    </div>
  );
}

export function addEdgeToEdgesList(
  params: Connection | Edge,
  edgesList: Edge[]
): Edge[] {
  return addEdge(params, edgesList);
}

// A stateful graph app that manages nodes/edges and handles RN WebView postMessage
export type GraphAppMessage =
  | { type: "addNode"; label?: string }
  | { type: "setGraph"; nodes: Node[]; edges: Edge[] }
  | { type: "ping" };

export function GraphApp() {
  const [nodes, setNodes, onNodesChange] = (
    require("reactflow") as typeof import("reactflow")
  ).useNodesState([
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 150, y: 100 }, data: { label: "Node 2" } },
  ]);
  const [edges, setEdges, onEdgesChange] = (
    require("reactflow") as typeof import("reactflow")
  ).useEdgesState([{ id: "e1-2", source: "1", target: "2" }]);
  const onConnect = (params: Connection | Edge) =>
    setEdges((eds) => addEdgeToEdgesList(params, eds));

  useEffect(() => {
    (window as any).ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "ready" })
    );
    const handler = (e: MessageEvent) => {
      try {
        const msg: GraphAppMessage = JSON.parse((e as any).data);
        if (msg.type === "addNode") {
          const id = String(nodes.length + 1);
          setNodes((ns: Node[]) =>
            ns.concat({
              id,
              position: { x: Math.random() * 250, y: Math.random() * 250 },
              data: { label: msg.label || `Node ${id}` },
            })
          );
        } else if (msg.type === "setGraph") {
          setNodes(msg.nodes);
          setEdges(msg.edges);
        } else if (msg.type === "ping") {
          (window as any).ReactNativeWebView?.postMessage(
            JSON.stringify({ type: "pong" })
          );
        }
      } catch {}
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
