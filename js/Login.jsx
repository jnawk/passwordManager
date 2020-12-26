import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'

const autoBind = require('auto-bind')

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    loginButtonClick() {
        const { v2API } = this.props
        const { credentials } = this.state
        v2API.login(credentials.username, credentials.password).then(() => {
            // TODO redirect to where we were
            window.location.hash='/'
        }).catch(() => {
            this.setState({loginFailure: true})
        })
    }

    // handles the change event on the username and password input fields
    receiveCredentials(param, value) {
        var credentials = this.state.credentials || {}
        credentials[param] = value
        this.setState({credentials: credentials})
    }

    render() {
        return (
            <Container className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Row>
                            <Col lg={12}>
                                <h2>Login Details</h2>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={2}>
                                <label>Username</label>
                            </Col>
                            <Col lg={5}>
                                <input type="text"
                                    onChange={event => this.receiveCredentials('username', event.target.value)}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={2}>
                                <label>Password</label>
                            </Col>
                            <Col lg={5}>
                                <input type="password"
                                    onChange={event =>this.receiveCredentials('password', event.target.value)}
                                    onKeyPress={target => {
                                        if(target.charCode == 13) {
                                            this.loginButtonClick()
                                        }
                                    }}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Row>
                            <Col lg={12}>
                                <Button onClick={this.loginButtonClick}>
                                    Login
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Login
