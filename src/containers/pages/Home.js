import React, { Component } from 'react';

import { Header } from "../hoc/Layout";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Graph from "react-cytoscapejs";

import "./Home.scss";
import PositionDialog from '../dialogs/PositionDialog';
import {graphTransform, defaultPositions, defaultTransitions} from '../../data'
import Style from '../../style'

class Home extends Component {
  state = {
    positions : defaultPositions,
    transitions : defaultTransitions,
    anchorEl : null,
    showDialog : false,
  }

  handleClick = event => {
    this.setState({anchorEl : event.currentTarget})
  }

  handleClose = (event) => {
    this.setState({anchorEl : null})
  }

  openPositionDialog = () => {
    this.setState({anchorEl : null})
    this.setState({showDialog : true})
  }

  closeDialog = event => {
    this.setState({showDialog : false})
  }

  createPosition = (name, notes) => {
    const newPositions = [...this.state.positions, {name, notes}];
    this.setState({positions : newPositions})
    this.closeDialog()
  }

  getGraphData = (positions, transitions) => {
    
   var data = graphTransform(positions, transitions)
   console.log(data)
   return data
  }
  render() {
    const { anchorEl} = this.state;
    return (
      <div>
        <Header><Button onClick={this.handleClick}>+</Button></Header>
        <Graph
          className="graph"
          elements={this.getGraphData(this.state.positions, this.state.transitions)}
          stylesheet={Style}
          layout={{ name: "breadthfirst" }}
          minZoom={1}
          maxZoom={0.5}
          cy={cy => this.cy = cy}
        />
        <Menu id="add-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleClose}
          >
          <MenuItem onClose={this.handleClose} onClick={this.openPositionDialog}>Position</MenuItem>
          <MenuItem onClose={this.handleClose}>Transition</MenuItem>
        </Menu>
        <PositionDialog createHandler={this.createPosition} open={this.state.showDialog} onClose={this.closeDialog}/>
      </div>
    );
  }
}

export default Home;
