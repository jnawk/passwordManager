import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'
import Login from './Login.jsx'

const autoBind = require('auto-bind')

class LoginPage extends React.Component {
    constructor(props) {
        super(props)

        autoBind(this)
    }
    ////////////////////
    // EVENT HANDLERS //
    ////////////////////

    loginButtonClick() {
        const credentials = this.state.credentials
        const hash = this.state.target || ''
        this.v2API.login(credentials.username, credentials.password).then(() => {
            Promise.all([
                this.getPasswordList(),
                this.loadStateForHash(hash)
            ]).then(([passwordList, state]) => {
                this.setState(Object.assign({
                    passwordList: passwordList,
                    credentials: null,
                    hash: hash
                }, state))
            })
        }).catch(() => {
            this.setState({hash: 'login'})
        })
    }

    // handles the change event on the username and password input fields
    receiveCredentials(param, value) {
        var credentials = this.state.credentials || {}
        credentials[param] = value
        this.setState({credentials: credentials})
    }

    render() {
        const {
            callback, enterCallback, loginButtonClick
        } = this.props
        return (
            <Container className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Login callback={callback}
                            enterCallback={enterCallback} />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Row>
                            <Col lg={12}>
                                <Button onClick={loginButtonClick}>
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
