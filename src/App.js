import React, { Component } from 'react';
import Menu from '@material-ui/core/Menu'

import { Graph } from 'react-d3-graph';

import './graph.css'
import { MenuItem } from '@material-ui/core';
import FormDialog from './components/FormDialog';

class App extends Component {

  data = {
    nodes: [{id:"Standup", color : "#1587B8", size: 500}],
    links: [{source: "Standup", target:"Standup"}]
  }

  constructor(){
    super();
    this.state = {
      menu : {
        show : false,
        anchor : null
      },
      formDialog : {
        show : false
      },
      data : this.data
    }
  }

  nodeRightClicked = (event, nodeId) => {
    event.preventDefault()
    this.setState({ menu: { show: true, anchor: event.target } })
  };

  handleMenuItemClick = (event, node) => {
    if(node === "New"){

    }
  }

  handleClose = () =>  {
    this.setState({ menu: { show: false }})
  }

  addNode = (node, source) =>{
    const data = this.data;
    if(!data.nodes.some(el => el.id === node.id)) data.nodes.push(node)
    if(!data.links.some(el => el.source === source && el.target === node.id)) data.links.push({ source: source, target: node.id })
    this.setState(this.data)
  }

  render() {
    return (
      <div>
       <Graph
          id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
          data={this.state.data}
          config={myConfig}
          onRightClickNode={this.nodeRightClicked}
        />
        <Menu
          anchorEl={this.state.menu.anchor}
          open={this.state.menu.show}
          onClose={this.handleClose}>
           {this.state.data.nodes.map((node, index) => 
            <MenuItem key={node.id} onClick={(event) => this.handleMenuItemClick(event, node.id)}>{node.id}</MenuItem>
            )}
            <MenuItem key="new" onClick={(event) => this.handleMenuItemClick(event, "New")}>New...</MenuItem>
        </Menu>

        <FormDialog></FormDialog>
      </div>
    );
  }
}


// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
  nodeHighlightBehavior: true,
  node: {
      color: 'lightgreen',
      size: 120,
      highlightStrokeColor: 'blue'
  },
  link: {
      highlightColor: 'lightblue'
  }
};

// // graph event callbacks
// const onClickGraph = function() {
//   window.alert(`Clicked the graph background`);
// };

// const onRightClickNode = function(event, nodeId) {
//   window.alert(`Right clicked node ${nodeId}`);
// };

// const onMouseOverNode = function(nodeId) {
//   window.alert(`Mouse over node ${nodeId}`);
// };

// const onMouseOutNode = function(nodeId) {
//   window.alert(`Mouse out node ${nodeId}`);
// };

// const onClickLink = function(source, target) {
//   window.alert(`Clicked link between ${source} and ${target}`);
// };

// const onRightClickLink = function(event, source, target) {
//   window.alert(`Right clicked link between ${source} and ${target}`);
// };

// const onMouseOverLink = function(source, target) {
//   window.alert(`Mouse over in link between ${source} and ${target}`);
// };

// const onMouseOutLink = function(source, target) {
//   window.alert(`Mouse out link between ${source} and ${target}`);
// };

export default App;
