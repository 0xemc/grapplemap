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
import TransitionDialog from '../dialogs/TransitionDialog';

class Home extends Component {
  state = {
    positions : defaultPositions,
    transitions : defaultTransitions,
    anchorEl : null,
    showTransitionDialog : false,
    showPositionDialog : false,
  }

  handleClick = event => {
    this.setState({anchorEl : event.currentTarget})
  }

  handleClose = (event) => {
    this.setState({anchorEl : null})
  }

  openPositionDialog = () => {
    this.setState({anchorEl : null})
    this.setState({showPositionDialog : true})
  }

  openTransitionDialog = () => {
    this.setState({anchorEl : null})
    this.setState({showTransitionDialog : true})
  }

  closeDialog = event => {
    this.setState({showTransitionDialog : false, showPositionDialog: false})
  }

  createPosition = (name, notes) => {
    const newPositions = [...this.state.positions, {name, notes}];
    this.setState({positions : newPositions})
    this.closeDialog()
  }
  createTransition = (name,source,target,url,notes) => {
    const newTransitions = [...this.state.transitions, {name,source,target,url,notes}];
    this.setState({transitions : newTransitions})
    this.closeDialog()
  }

  render() {
    const graphData = graphTransform(this.state.positions, this.state.transitions)
    const { anchorEl} = this.state;
    return (
      <div>
        <Header><Button onClick={this.handleClick}>+</Button></Header>
        <Graph
          className="graph"
          elements={graphData}
          stylesheet={Style}
          layout={{ name: "breadthfirst" }}
          zoom={0.5}
          minZoom={0.9}
          maxZoom={0.9}
          cy={cy => this.cy = cy}
        />
        <Menu id="add-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleClose}
          >
          <MenuItem onClose={this.handleClose} onClick={this.openPositionDialog}>Position</MenuItem>
          <MenuItem onClose={this.handleClose} onClick={this.openTransitionDialog}>Transition</MenuItem>
        </Menu>
        <PositionDialog createHandler={this.createPosition} open={this.state.showPositionDialog} onClose={this.closeDialog}/>
        <TransitionDialog createHandler={this.createTransition} open={this.state.showTransitionDialog} onClose={this.closeDialog}
          positions={this.state.positions}/>
      </div>
    );
  }
}

export default Home;
