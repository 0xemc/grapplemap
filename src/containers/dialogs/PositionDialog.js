import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

class PositionDialog extends Component {

  state = {
    name : '',
    notes : '',
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleClick = () => {
    this.props.createHandler(this.state.name, this.state.notes)
  }

  render() {
    return (
      <Dialog
      open={this.props.open}
      onClose={this.props.onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogContent>
        <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Position Name"
            variant="outlined"
            type="text"
            name="name"
            onChange={this.handleChange}
          />
        <TextField
            id="notes-field"
            name="notes"
            label="Notes"
            multiline
            rowsMax="6"
            onChange={this.handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
          />
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClick} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
    );
  }
}

export default PositionDialog;