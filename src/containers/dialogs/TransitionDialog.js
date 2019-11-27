import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Select, MenuItem, InputLabel, FormControl, OutlinedInput } from '@material-ui/core';
import { IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'
import MuiDialogTitle from '@material-ui/core/DialogTitle';


import "./TransitionDialog.scss"

class TransitionDialog extends Component {

  state = {
    name: "",
    source: "",
    target: "",
    url: "",
    notes: ""
  }

  componentWillReceiveProps(){
    const {transition} = this.props;
    if(transition){
      this.setState({
         ...transition 
      })
    }else{
      this.setState({name:'', notes:'', source:'',target:'',url:''})
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleClick = () => {
    const { name, source, target, url, notes } = this.state;
    if(this.props.transition != null){
      this.props.updateHandler(name, source, target, url, notes);
    }else{
      this.props.createHandler(name, source, target, url, notes)
    }
  }

  render() {
    const { deleteHandler } = this.props;
    const { name } = this.state;
    const editing = this.props.transition != null;
    return (
      <Dialog
        className="transition-dialog"
        open={this.props.open}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
      >
         <MuiDialogTitle disableTypography>
          <Typography variant="h6">{editing ? 'Edit' : 'Create'} Transition</Typography>
          {editing ? (
            <IconButton className="delete-button" aria-label="close" onClick={() => deleteHandler(name)}>
              <DeleteIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
        <DialogContent className="flex column">
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            variant="outlined"
            type="text"
            name="name"
            disabled={editing}
            value={this.state.name}
            onChange={this.handleChange}
          />
          <div className="source-target-div">
            <FormControl variant="outlined" className="select-field">
              <InputLabel id="select-source-label">Source</InputLabel>
              <Select
                labelid="select-source-label"
                id="source"
                name="source"
                value={this.state.source}
                onChange={this.handleChange}
                labelWidth={1}
                input={<OutlinedInput />}
              >
                {this.props.positions.map(t =>
                  <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl variant="outlined" className="select-field">
              <InputLabel id="select-target-label">Target</InputLabel>
              <Select
                labelid="select-target-label"
                id="target"
                name="target"
                value={this.state.target}
                onChange={this.handleChange}
                labelWidth={1}
                input={<OutlinedInput />}
              >
                {this.props.positions.map(t =>
                  <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                )}
              </Select>
            </FormControl>
          </div>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="Url"
            variant="outlined"
            type="text"
            name="url"
            value={this.state.url}
            onChange={this.handleChange}
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

export default TransitionDialog;