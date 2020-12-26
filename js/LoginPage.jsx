import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'
import Login from './Login.jsx'

const autoBind = require('auto-bind')

class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }
    ////////////////////
    // EVENT HANDLERS //
    ////////////////////

    loginButtonClick() {
        const { v2API } = this.props
        const { credentials } = this.state
        v2API.login(credentials.username, credentials.password).then(() => {
            // TODO redirect to where we were
            window.location.hash='/'
        }).catch(() => {
            // login failed....
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
                        <Login callback={this.receiveCredentials}
                            enterCallback={this.loginButtonClick} />
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

export default LoginPage
