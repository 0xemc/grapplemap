import React from 'react';

import { Header } from '../hoc/Layout'
import Graph from 'react-cytoscapejs'

import './Home.scss'

const nodes = [
  { data: { id: 'one', label: 'Node 1' }, position: { x: window.innerWidth/2, y: window.innerHeight/2 } },
  { data: { id: 'two', label: 'Node 2' }, position: { x: window.innerWidth/2 +200, y: window.innerHeight/2 } }
]

const edges = [
  { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
  { data: { source: 'two', target: 'one', label: 'Edge from Node1 to Node2' } },
  { data: { source: 'two', target: 'one', label: 'Edge from Node1 to Node2' } }
]

const data = Graph.normalizeElements({nodes : nodes, edges: edges})

const stylesheet = [
  {
    selector: 'node',
    style: {
      width : 70,
      height: 70,
      'label': 'data(label)',
      'color' : '#1587B8',
      'font-size' : 16,
      'background-color': '#fff',
      'border-width' : 2,
      'border-style': 'solid',
      'border-color': 'rgba(21, 135, 184, 0.75)',
      'box-shadow' : '0px 2px 4px rgba(0, 0, 0, 0.25);',
      'text-valign' : 'center'
    }
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'line-color' : '#E5E5E5',
      'width' : 2,
      'arrow-scale' : 1.5,
      'target-arrow-color' : '#E5E5E5',
      'target-arrow-shape' : 'triangle-backcurve'
    }
  },{
    selector: 'edge:selected',
    style: {
      'line-color' : '#907cff',
      'target-arrow-color' : '#907cff',
    }
  }
]

const Home = () => {
  return (
    <div>
      <Header/>
      <Graph className="graph" elements = {data} stylesheet={stylesheet}/>
    </div>
  );
};



export default Home;