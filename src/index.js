import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import Routes from './utilities/Routes';

const App = () => {
    return (
        <BrowserRouter>
            <Routes />
        </BrowserRouter>
    )
}


ReactDOM.render(<App />, document.getElementById('root'));
