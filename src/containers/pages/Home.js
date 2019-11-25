import React, { Component } from 'react';

import { Header } from "../hoc/Layout";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Graph from "react-cytoscapejs";

import "./Home.scss";
import PositionDialog from '../dialogs/PositionDialog';
import { graphTransform, defaultPositions, defaultTransitions } from '../../data'
import Style from '../../style'
import TransitionDialog from '../dialogs/TransitionDialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-regular-svg-icons'

import { firestore, auth, signInWithGoogle } from '../../firebase'
import UserButton from '../../components/UserButton';
class Home extends Component {

  cy;

  unsubscribeFirestore;
  unsubscribeAuth;

  state = {
    positions: defaultPositions,
    transitions: defaultTransitions,
    anchorEl: null,
    showTransitionDialog: false,
    showPositionDialog: false,
    selectedPosition: null,
    selectedTransition: null,
    user: null
  }

  componentWillUnmount = () => {
    this.unsubscribeFirestore();
    this.unsubscribeAuth();
  }
  
  componentDidMount = async () => {
    // auth.signOut()
    this.unsubscribeAuth = auth.onAuthStateChanged( user => {
      if(user != null){
       this.unsubscribeFirestore = this.subscribeToUserData(user)
       this.initUserData(user);
      }
      this.setState({user})
    })
    // this.cy.on('tap', 'node', (e) => {
    //   const node = e.target;
    //   const newPos = this.state.positions.find(p => p.name === node.id());
    //   this.setState({ selectedPosition: newPos });
    //   this.openPositionDialog()
    // });
  }

  subscribeToUserData = (user) => firestore
    .collection('users')
    .doc(user.email)
    .onSnapshot(snapshot => 
      {
        const data = snapshot.data();
          const {positions, transitions} = data
          this.setState({positions, transitions})
          this.cy.layout({ name: "breadthfirst" }).run()
          console.log(positions)
      }
    )

  initUserData = user => {
    const {positions, transitions} = this.state;
    firestore
      .collection('users')
      .doc(user.email)
      .set({positions, transitions})
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

  handleSignInOut = () => {
    if(this.state.user === null){
      signInWithGoogle();
    }else{
      auth.signOut();
    }
  }

  closeDialog = event => {
    this.setState({ showTransitionDialog: false, showPositionDialog: false, selectedPosition: null })
  }

  updatePosition = (name, notes) => {
    let updatePos = this.state.positions.find(p => p.name === name)
    updatePos = {...updatePos, name, notes}
    const filteredPos = this.state.positions.filter(p => p.name !== name)
    this.setState({ positions: [...filteredPos, updatePos] })
    this.closeDialog()
  }

  createPosition = async (name, notes) => {
    const {user} = this.state;
    const newPositions = [...this.state.positions, { name, notes }];
    if(user){
      await firestore
        .collection('users')
        .doc(user.email)
        .update('positions', newPositions)
    }else{
      this.setState({positions: newPositions})
    }
    this.closeDialog()
  }

  createTransition = async (name, source, target, url, notes) => {
    const {user} = this.state;
    const newTransitions = [...this.state.transitions, { name, source, target, url, notes }];
    if(user){
      await firestore
        .collection('users')
        .doc(user.email)
        .update('transitions', newTransitions)
    }else{
      this.setState({transitions: newTransitions})
    }
    this.closeDialog()
  }

  render() {
    const graphData = graphTransform(this.state.positions, this.state.transitions)
    const { anchorEl, user} = this.state;
    return (
      <div>
        <Header>
          {user ? 
            <UserButton imgSrc={user.photoURL} onClick={this.handleSignInOut} ></UserButton>
            :
            <Button onClick={this.handleSignInOut}><FontAwesomeIcon icon={faSave} /></Button>}
          <Button onClick={this.handleClick}>+</Button></Header>
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
