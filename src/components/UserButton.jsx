import React from 'react'
import Button from '@material-ui/core/Button';

import './UserButton.scss'

const UserButton = ({imgSrc, onClick}) => 
	<Button onClick={onClick}>
		<img src={imgSrc} alt="profile" />
	</Button>


export default UserButton;