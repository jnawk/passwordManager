import React from 'react'

import { Container } from 'react-bootstrap'
import {
    HashRouter as Router,
    Switch,
    Route,
    useParams
} from 'react-router-dom'

const autoBind = require('auto-bind')

import V2API from './passwordManagerAPIs.js'

import LoginPage from './LoginPage.jsx'
import NewPassword from './NewPassword.jsx'
import PasswordList from './PasswordList.jsx'
import ShowPassword from './ShowPassword.jsx'


class PasswordManager extends React.Component {
    constructor(props) {
        super(props)
        this.v2API = new V2API(this.props.endpoint)
        this.state = {}
        autoBind(this)
    }

    savePassword(passwordId, data) {
        if(passwordId) {
            return this.v2API.updatePassword(atob(passwordId), data)
        } else {
            return this.v2API.createPassword(data)
        }
    }

    ////////////////////
    // EVENT HANDLERS //
    ////////////////////

    // handles the change event on the username and password input fields
    receiveCredentials(param, value) {
        var credentials = this.state.credentials || {}
        credentials[param] = value
        this.setState({credentials: credentials})
    }

    render() {
        return (
            <Container fluid>
                <Router>
                    <Switch>
                        <Route exact path="/login">
                            <LoginPage v2API={this.v2API} />
                        </Route>
                        <Route exact path="/">
                            <PasswordList v2API={this.v2API} />
                        </Route>
                        <Route path="/showPassword/:passwordId"
                            children={
                                <ShowPasswordChild savePassword={this.savePassword}
                                    v2API={this.v2API}
                                />
                            }>
                        </Route>
                        <Route exact path="/newPassword">
                            <NewPassword savePassword={this.savePassword} />
                        </Route>
                    </Switch>
                </Router>
            </Container>
        )
    }
}

const ShowPasswordChild = (props) => {
    const { savePassword, v2API } = props
    const { passwordId } = useParams()
    return (
        <ShowPassword password={passwordId}
            goBack={() => window.location.hash='/'}
            savePassword={savePassword}
            v2API={v2API}/>
    )
}

export default PasswordManager
