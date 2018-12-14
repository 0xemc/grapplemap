import React from "react";

import { Header } from "../hoc/Layout";
import Graph from "react-cytoscapejs";

import "./Home.scss";

const positions = [
  {
    name: "Side Control"
  },
  {
    name: "Back Control"
  }
];

const transitions = [
  {
    name: "Gift Wrap",
    source: "Side Control",
    target: "Back Control",
    url: "www.youtube.com",
    notes: "Sunt elit nulla aliqua ipsum eu."
  }
];

var nodes = positions.map(position => ({
  data: { id: position.name, label: position.name}
}));

var edges = transitions.map(transition => ({
  data: {
    source: transition.source,
    target: transition.target,
    label: transition.name
  }
}));

const data = Graph.normalizeElements({ nodes: nodes, edges: edges });

const stylesheet = [
  {
    selector: "node",
    style: {
      width: 75,
      height: 75,
      label: "data(label)",
      color: "#1587B8",
      "font-size": 12,
      "background-color": "#fff",
      "border-width": 2,
      "border-style": "solid",
      "border-color": "rgba(21, 135, 184, 0.75)",
      "box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.25);",
      "text-valign": "center",
      "text-halign" : "center",
      'text-transform' : 'uppercase',
      'text-wrap': 'wrap',
      'text-max-width' : 55
      }
  },
  {
    selector: "edge",
    style: {
      'source-distance-from-node' : 15,
      'target-distance-from-node' : 15,
      "curve-style": "bezier",
      "font-size": 14,
      "line-color": "#E5E5E5",
      width: 2,
      "arrow-scale": 1.5,
      "target-arrow-color": "#E5E5E5",
      "target-arrow-shape": "triangle-backcurve",
    }
  },
  {
    selector: "edge:selected",
    style: {
      'color': "#A8A8A8",
      label: "data(label)",
      'line-color' : '#A8A8A8',
      'target-arrow-color' : '#A8A8A8',
      'text-background-opacity' : 1,
      'text-background-color' : '#F9F9F9',
      'text-background-shape' : 'roundrectangle',
      'text-background-padding' : 5,
    }
  }
];

const Home = () => {
  return (
    <div>
      <Header><button>+</button></Header>
      <Graph
        className="graph"
        elements={data}
        stylesheet={stylesheet}
        layout={{ name: "breadthfirst" }}
        minZoom={1}
        maxZoom={0.5}
      />
    </div>
  );
};

export default Home;
