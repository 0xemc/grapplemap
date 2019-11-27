import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'
import MuiDialogTitle from '@material-ui/core/DialogTitle';

import './PositionDialog.scss'

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
    this.props.createHandler(this.state.name, this.state.notes)
  }

  render() {
    const { position, open, onClose, onCancel, deleteHandler } = this.props;
    const {notes, name} = this.state;
    const editing = position != null;
  
    return (
      <Dialog
        className="position-dialog"
        open={open}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
      >
        <MuiDialogTitle disableTypography>
          <Typography variant="h6">{editing ? 'Edit' : 'Create'} Position</Typography>
          {editing ? (
            <IconButton className="delete-button" aria-label="close" onClick={() => deleteHandler(name)}>
              <DeleteIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
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
            value={name}
            onChange={this.handleChange}
          />
          <TextField
            id="notes-field"
            name="notes"
            label="Notes"
            multiline
            rows="6"
            value={notes}
            onChange={this.handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
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