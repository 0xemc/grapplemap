import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


class FormDialog extends Component {
  constructor(){
    super()
    this.state = {
      open: false,
    };
  }

  componentWillReceiveProps(props){
    this.setState({ open: props.open})
  }

  render() {
    return (
      <div>
      <Dialog
        open={this.state.open}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
        >
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Position"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.handleClose} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
  }
}

export default FormDialog;
