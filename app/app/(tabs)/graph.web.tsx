import React from "react";
import "reactflow/dist/style.css";
import { GraphApp } from "graph-view";

export default function GraphScreen() {
  return (
    <div style={{ height: "100vh" }}>
      <GraphApp />
    </div>
  );
}
