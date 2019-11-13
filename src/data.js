import Graph from "react-cytoscapejs";

export const defaultPositions = [
  {
    name: "Side Control",
    notes: "Qui magna in magna labore."
  },
  {
    name: "Back Control",
    notes: "Anim enim anim ex proident ad dolore quis voluptate sint laboris."
  }
];

export const defaultTransitions = [
  {
    name: "Gift Wrap",
    source: "Side Control",
    target: "Back Control",
    url: "www.youtube.com",
    notes: "Sunt elit nulla aliqua ipsum eu."
  }
];


const posTransform = (positions) => positions.map(position => ({
  data: { id: position.name, label: position.name}
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