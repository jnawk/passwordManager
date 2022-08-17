import React from 'react'
import {render} from 'react-dom'
import PasswordManager from './PasswordManager.jsx'
import 'bootstrap/dist/css/bootstrap.css'

const endpoint = 'https://h2gsweotlb.execute-api.ap-southeast-2.amazonaws.com/p'

const passwordManager = (
    <PasswordManager endpoint={endpoint}/>
)

render(passwordManager, document.getElementById('PasswordManager'))
