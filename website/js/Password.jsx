import React from 'react'
import PropTypes from 'prop-types'
import { Row,Col,Button } from 'react-bootstrap'

const autoBind = require('auto-bind')

import './passwordComponents.css'

import PasswordGenerator from './PasswordGenerator.jsx'

class Password extends React.Component {
    constructor(props) {
        super(props)
        let pw = this.props.password
        if(pw) {
            this.state = {
                description: pw.description,
                username: pw.username,
                password: pw.password,
                passwordId: pw.passwordId
            }
        } else {
            this.state = { edit: true }
        }
        autoBind(this)
    }

    static get propTypes() {
        return {
            password: PropTypes.shape({
                description: PropTypes.string,
                username: PropTypes.string,
                password: PropTypes.string,
                passwordId: PropTypes.string
            }),
            savePassword: PropTypes.func
        }
    }

    edit_buttonClick() {
        this.setState({ edit: true })
    }

    save_buttonClick() {
        const { passwordId, description, username, password } = this.state

        this.props.savePassword(passwordId, {
            description: description,
            username: username,
            password: password
        }).then(response => {
            if(!passwordId) {
                this.setState({ passwordId: response.passwordId })
            }
            this.setState({ edit: false })
        })
    }

    passwordGenerator_buttonClick() {
        const { showPasswordGenerator } = this.state
        this.setState({ showPasswordGenerator: !showPasswordGenerator})
    }

    render() {
        let { description, username, password, passwordId } = this.state
        const { edit, showPasswordGenerator } = this.state
        const newPassword = !passwordId
        let saveButton = null
        let editButton = null
        let passwordGeneratorButton = null
        let passwordGenerator = null

        const passwordGeneratorButtonShowHide = showPasswordGenerator ? 'Close' : 'Open'
        const newPasswordLabel = `${(newPassword ? 'New' : 'Edit')} Password`

        if(edit) {
            description = (
                <input id="description"
                    type="text"
                    onChange={event => this.setState({ description: event.target.value })}
                    value={description || ''}/>
            )
            username = (
                <input id="username"
                    type="text"
                    onChange={event => this.setState({ username: event.target.value })}
                    value={username || ''}/>
            )
            password = (
                <input id="password"
                    type="text"
                    onChange={event => this.setState({ password: event.target.value })}
                    value={password || ''}/>
            )

            saveButton = (
                <Col xs={4} lg={6}>
                    <Button id="save"
                        onClick={this.save_buttonClick}>
                      Save
                    </Button>
                </Col>
            )

            passwordGeneratorButton = (
                <Row>
                    <Col xs={7} lg={6}>
                        <Button id="passwordGenerator"
                            onClick={this.passwordGenerator_buttonClick}>
                            {passwordGeneratorButtonShowHide} Password Generator
                        </Button>
                    </Col>
                </Row>
            )

            if(showPasswordGenerator) {
                passwordGenerator = <PasswordGenerator setPassword={password => this.setState({ password: password })}/>
            }
        } else {
            editButton = (
                <Col xs={4} lg={6}>
                    <Button
                        id="edit"
                        onClick={this.edit_buttonClick}>
                        Edit
                    </Button>
                </Col>
            )
        }

        return (
            <>
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>
                            {newPasswordLabel}
                        </h3>
                    </Col>
                </Row>
                <div className="passwordComponents">
                    <Row>
                        <Col xs={12} sm={3} lg={3}>Description</Col>
                        <Col xs={12} sm={9} lg={6}>{description}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={3} lg={3}>Username</Col>
                        <Col xs={12} sm={9} lg={6}>{username}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={3} lg={3}>Password</Col>
                        <Col xs={12} sm={9} lg={6}>{password}</Col>
                    </Row>
                    <Row>
                        <Col xs={4} sm={3} lg={3}>
                            <Button onClick={() => window.location.hash='/'}>
                      Go Back
                            </Button>
                        </Col>
                        {saveButton}
                        {editButton}
                    </Row>
                </div>
                {passwordGeneratorButton}
                {passwordGenerator}
            </>
        )
    }
}

export default Password
