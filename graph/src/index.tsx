import React from "react";
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
