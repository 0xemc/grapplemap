import React from 'react';

import { Header } from '../hoc/Layout'
import Graph from 'react-cytoscapejs'

import './Home.scss'

const data = [
  { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
  { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
  { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
]

const Home = () => {
  return (
    <div>
      <Header/>
      <Graph className="graph" elements = {data}/>
    </div>
  );
};



export default Home;