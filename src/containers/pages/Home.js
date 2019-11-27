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
import SaveIcon from '@material-ui/icons/Save';

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
    user: null,
    newUser: false
  }

  componentWillUnmount = () => {
    this.unsubscribeFirestore();
    this.unsubscribeAuth();
  }
  
  componentDidMount = async () => {
    this.unsubscribeAuth = auth.onAuthStateChanged( user => {
      if(user != null){
       this.unsubscribeFirestore = this.subscribeToUserData(user)
      }
      this.setState({user})
    })
    this.cy.on('tap', 'node', (e) => {
      const node = e.target;
      const newPos = this.state.positions.find(p => p.name === node.id());
      this.setState({ selectedPosition: newPos });
      this.openPositionDialog()
    });
  }

  subscribeToUserData = (user) => firestore
    .collection('users')
    .doc(user.email)
    .onSnapshot(snapshot => 
      {
        console.log(this.state.newUser)
        //Handle first login
        if(this.state.newUser){
          this.initUserData(user);
          this.setState({newUser: false})
        }else{
          console.log(snapshot.data())
          const data = snapshot.data();
          const {positions, transitions} = data
          this.setState({positions, transitions})
          this.cy.layout({ name: "breadthfirst" }).run()
        }
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

  handleSignInOut = async () => {
    if(this.state.user === null){
      const userCredentials = await signInWithGoogle();
      console.log(userCredentials)
      this.setState({newUser: userCredentials.additionalUserInfo.isNewUser})
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

  deletePosition = (name) => {
    const newPositions = this.state.positions.filter(p => p.name !== name)
    const newTransitions = this.state.transitions.filter(t => t.source !== name && t.target !== name)
    this.updateGraph(newTransitions, newPositions)
    this.closeDialog()
  }

  createPosition = async (name, notes) => {
    const {transitions, positions} = this.state;
    const newPositions = [...positions, { name, notes }];
    this.updateGraph(transitions, newPositions)
    this.closeDialog()
  }

  createTransition = async (name, source, target, url, notes) => {
    const {transitions, positions} = this.state;
    const newTransitions = [...transitions, { name, source, target, url, notes }];
    this.updateGraph(newTransitions, positions);
    this.closeDialog();
  }

  updateGraph = async (transitions, positions) => {
    const {user} = this.state;
    if(user){
      await firestore
        .collection('users')
        .doc(user.email)
        .set({transitions, positions})
    }else{
      this.setState({transitions,positions}, () => 
        this.cy.layout({ name: "breadthfirst" }).run()
      )
    }
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
            <Button onClick={this.handleSignInOut}><SaveIcon/></Button>}
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
        <PositionDialog 
          position={this.state.selectedPosition}
          createHandler={this.createPosition}
          updateHandler={this.updatePosition}
          deleteHandler={this.deletePosition}
          open={this.state.showPositionDialog}
          onClose={this.closeDialog}
          onCancel={this.closeDialog} />
        <TransitionDialog createHandler={this.createTransition} open={this.state.showTransitionDialog} onClose={this.closeDialog}
          positions={this.state.positions}
          onCancel={this.closeDialog} />
      </div>
    );
  }
}

export default Home;
