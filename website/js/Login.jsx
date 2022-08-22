import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button} from 'react-bootstrap'

const autoBind = require('auto-bind')

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    static get propTypes() {
        return {
            v2API: PropTypes.object,
            hash: PropTypes.string
        }
    }

    loginButtonClick() {
        const { v2API, hash } = this.props
        const { credentials } = this.state
        this.setState({loginFailure: false})
        v2API.login(credentials.username, credentials.password).then(() => {
            let location
            if(hash) {
                try {
                    location = atob(hash)
                } catch (e) {
                    // we must have been fed bullshit
                    location = '/'
                }
            }
            window.location.hash = location
        }).catch(() => {
            this.setState({loginFailure: true})
        })
    }

    // handles the change event on the username and password input fields
    receiveCredentials(param, value) {
        var credentials = this.state.credentials || {}
        credentials[param] = value // eslint-disable-line security/detect-object-injection
        this.setState({credentials: credentials})
    }

    render() {
        const { loginFailure } = this.state
        let failureMessage = null
        if(loginFailure) {
            failureMessage = (
                <Row>
                    <Col lg={6}>
                          Computer Says no
                    </Col>
                </Row>
            )
        }

        return (
            <>
                <Row>
                    <Col lg={6}>
                        <h2>Login Details</h2>
                    </Col>
                </Row>
                <Row>
                    <Col lg={2} xl={1}>
                        <label>Username</label>
                    </Col>
                    <Col lg={4}>
                        <input type="text"
                            onChange={event => this.receiveCredentials('username', event.target.value)}/>
                    </Col>
                </Row>
                <Row>
                    <Col lg={2} xl={1}>
                        <label>Password</label>
                    </Col>
                    <Col lg={4}>
                        <input type="password"
                            onChange={event =>this.receiveCredentials('password', event.target.value)}
                            onKeyPress={target => {
                                if(target.charCode == 13) {
                                    this.loginButtonClick()
                                }
                            }}/>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <Button onClick={this.loginButtonClick}>
                            Login
                        </Button>
                    </Col>
                </Row>
                {failureMessage}
            </>
        )
    }
}

export default Login
