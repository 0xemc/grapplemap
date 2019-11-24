import React, { Component } from 'react';

import { Header } from "../hoc/Layout";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Graph from "react-cytoscapejs";

import "./Home.scss";
import PositionDialog from '../dialogs/PositionDialog';
import { graphTransform } from '../../data'
import Style from '../../style'
import TransitionDialog from '../dialogs/TransitionDialog';

import { firestore } from '../../firebase'
class Home extends Component {

  cy;

  fbUnsubscribe;

  state = {
    positions: [],
    transitions: [],
    anchorEl: null,
    showTransitionDialog: false,
    showPositionDialog: false,
    selectedPosition: null,
    selectedTransition: null
  }

  componentWillUnmount = () => {
    this.fbUnsubscribe()
  }

  componentDidMount = async () => {
      
    this.fbListener = firestore
      .collection('users')
      .doc("michaeljosefcollins@gmail.com")
      .onSnapshot(snapshot => 
        {
          const {positions, transitions} = snapshot.data()
          console.log(positions)
          this.setState({positions, transitions})
          this.cy.layout({ name: "breadthfirst" }).run()
        }
      )
    // this.cy.on('tap', 'node', (e) => {
    //   const node = e.target;
    //   const newPos = this.state.positions.find(p => p.name === node.id());
    //   this.setState({ selectedPosition: newPos });
    //   this.openPositionDialog()
    // });
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = (event) => {
    this.setState({ anchorEl: null })
  }

  openPositionDialog = () => {
    this.setState({ anchorEl: null })
    this.setState({ showPositionDialog: true })
  }

  openTransitionDialog = () => {
    this.setState({ anchorEl: null })
    this.setState({ showTransitionDialog: true })
  }

  closeDialog = event => {
    this.setState({ showTransitionDialog: false, showPositionDialog: false, selectedPosition: null })
  }

  updatePosition = (name, notes) => {
    // const newPositions = [...this.state.positions.map(p => {
    //   console.log(p.name, name)
    //  return p.name === name ? ({ name, notes }) : p
    // })];

    let updatePos = this.state.positions.find(p => p.name === name)
    updatePos = {...updatePos, name, notes}
    const filteredPos = this.state.positions.filter(p => p.name !== name)
    this.setState({ positions: [...filteredPos, updatePos] })
    this.closeDialog()
  }

  createPosition = async (name, notes, x, y) => {
    const newPositions = [...this.state.positions, { name, notes, x, y }];
    await firestore
      .collection('users')
      .doc("michaeljosefcollins@gmail.com")
      .update('positions', newPositions)
    this.closeDialog()
  }

  createTransition = async (name, source, target, url, notes) => {
    const newTransitions = [...this.state.transitions, { name, source, target, url, notes }];
    
    await firestore
    .collection('users')
    .doc("michaeljosefcollins@gmail.com")
    .update('transitions', newTransitions)
    
    this.setState({ transitions: newTransitions })
    this.closeDialog()
  }

  render() {
    const graphData = graphTransform(this.state.positions, this.state.transitions)
    const { anchorEl } = this.state;
    return (
      <div>
        <Header><Button onClick={this.handleClick}>+</Button></Header>
        <Graph
          className="graph"
          elements={graphData}
          stylesheet={Style}
          layout={{ name: "breadthfirst" }}
          zoom={0.5}
          minZoom={0.5}
          maxZoom={0.9}
          motionBlur={false}
          showFps={true}
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
        <PositionDialog position={this.state.selectedPosition} createHandler={this.createPosition} updateHandler={this.updatePosition} open={this.state.showPositionDialog} onClose={this.closeDialog} onCancel={this.closeDialog} />
        <TransitionDialog createHandler={this.createTransition} open={this.state.showTransitionDialog} onClose={this.closeDialog}
          positions={this.state.positions}
          onCancel={this.closeDialog} />
      </div>
    );
  }
}

export default Home;
