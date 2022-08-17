import React from 'react'
import {render} from 'react-dom'
import PasswordManager from './PasswordManager.jsx'
import 'bootstrap/dist/css/bootstrap.css'

const passwordManager = (
    <PasswordManager endpoint={endpoint}/>
)

render(passwordManager, document.getElementById('PasswordManager'))
