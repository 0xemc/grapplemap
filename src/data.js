import Graph from "react-cytoscapejs";

export const defaultPositions = [
  {
    name: "Stand Up",
    notes: "Qui magna in magna labore."
  },
  {
    name: "Side Control",
    notes: "Anim enim anim ex proident ad dolore quis voluptate sint laboris."
  }
];

export const defaultTransitions = [
  {
    name: "Double Leg",
    source: "Stand Up",
    target: "Side Control",
    url: "www.youtube.com",
    notes: "Sunt elit nulla aliqua ipsum eu."
  }
];


const posTransform = (positions) => positions.map(pos => ({
  data: { id: pos.name, label: pos.name, notes: pos.notes, url: pos.url },
  ...(pos.x && pos.y && { position: { x: pos.x, y: pos.y } })
}));

const traTransform = (transitions) => transitions.map(transition => ({
  data: {
    source: transition.source,
    target: transition.target,
    label: transition.name
  }
}));

export const graphTransform = (positions, transitions) => {
  var nodes = posTransform(positions)
  var edges = traTransform(transitions)

  return Graph.normalizeElements({ nodes, edges });
}
