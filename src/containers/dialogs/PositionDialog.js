import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { DialogTitle } from '@material-ui/core';

class PositionDialog extends Component {

  state = {
    name: '',
    notes: '',
  }

  componentWillReceiveProps(){
    const {position} = this.props;
    if(position){
      this.setState({
         ...position 
      })
    }else{
      this.setState({name:'', notes:''})
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleClick = () => {
    if(this.props.position != null){
      this.props.updateHandler(this.props.position.name, this.state.notes);
    }
    this.props.createHandler(this.state.name, this.state.notes, window.screen.width / 2, window.screen.height / 2)
  }

  render() {
    const { position } = this.props;
    const editing = position != null;
  
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>{editing ? 'Edit' : 'Create'} Position</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Position Name"
            variant="outlined"
            type="text"
            name="name"
            disabled={editing}
            value={this.state.name}
            onChange={this.handleChange}
          />
          <TextField
            id="notes-field"
            name="notes"
            label="Notes"
            multiline
            rows="6"
            value={this.state.notes}
            onChange={this.handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onCancel} color="primary">
            Cancel
        </Button>
          <Button onClick={this.handleClick} color="primary">
            {editing ? 'Update' : 'Create' }
        </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default PositionDialog;