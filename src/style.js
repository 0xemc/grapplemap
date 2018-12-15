const stylesheet = [
  {
    selector: "node",
    style: {
      'width': 75,
      'height': 75,
      'label': "data(label)",
      'color': "#1587B8",
      "font-size": 12,
      'font-family': 'Play, sans-serif',
      "background-color": "#fff",
      "border-width": 2,
      "border-style": "solid",
      "border-color": "rgba(21, 135, 184, 0.75)",
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
      'width': 2,
      "arrow-scale": 1.5,
      "target-arrow-color": "#E5E5E5",
      "target-arrow-shape": "triangle-backcurve",
      'color': "#A8A8A8",
      'label': "data(label)",
      'text-background-opacity' : 1,
      'text-background-color' : '#F9F9F9',
      'text-background-shape' : 'roundrectangle',
      'text-background-padding' : 5,
    }
  },
  {
    selector: "edge:selected",
    style: {
      'color': "#A8A8A8",
      'label': "data(label)",
      'line-color' : '#A8A8A8',
      'target-arrow-color' : '#A8A8A8',
      'text-background-opacity' : 1,
      'text-background-color' : '#F9F9F9',
      'text-background-shape' : 'roundrectangle',
      'text-background-padding' : 5,
    }
  }
];

export default stylesheet;