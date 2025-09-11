import React from "react";
import "reactflow/dist/style.css";
import { useEdgesState, useNodesState, Connection, Edge } from "reactflow";
import { GraphView, addEdgeToEdgesList } from "graph-view";

export default function GraphScreen() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 150, y: 100 }, data: { label: "Node 2" } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2" },
  ]);
  const onConnect = (params: Connection | Edge) =>
    setEdges((eds) => addEdgeToEdgesList(params, eds));

  return (
    <div style={{ height: "100vh" }}>
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
