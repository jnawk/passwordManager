import React from 'react';
import {render} from 'react-dom';
import PasswordManager from './PasswordManager.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import './passwordManager.css';
const passwordManager = (
    <PasswordManager
        v1Endpoint='https://pm.jnawk.nz/passwordManager/p/json'
        v2Endpoint='https://h2gsweotlb.execute-api.ap-southeast-2.amazonaws.com/p'/>
);
render(passwordManager, document.getElementById('PasswordManager'));
