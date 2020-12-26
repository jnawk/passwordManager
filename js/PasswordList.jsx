import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'
import PasswordListEntry from './PasswordListEntry.jsx'

const autoBind = require('auto-bind')

class PasswordList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    componentDidMount() {
        this.getPasswordList()
            .then(passwordList => this.setState({
                passwordList: passwordList
            }))
            .catch(() => {
                window.location.hash='#/login'
            })
    }

    // returns password list
    getPasswordList()  {
        const { v2API } = this.props
        return v2API.getPasswordList()
    }

    deletePassword(passwordId) {
        const { v2API } = this.props
        return v2API.deletePassword(passwordId).then(() => {
            this.setState({passwordList: this.state.passwordList.filter(password => password.passwordId != passwordId)})
        })
    }


    render() {
        const { passwordList } = this.state

        if (!passwordList) {
            return null
        }

        return <Container className="show-grid">
            <Row>
                <Col lg={6}>
                    <Button onClick={() => window.location.hash='/newPassword'}>
                            New Password
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <Row>
                        <Col lg={8}>
                            <h2>Passwords</h2>
                        </Col>
                    </Row>
                    {passwordList.map(password => (
                        <PasswordListEntry key={password.passwordId}
                            password={password}
                            displayPasswordCallback={passwordId => window.location.hash=`/showPassword/${btoa(passwordId)}`}
                            deletePasswordCallback={passwordId => this.deletePassword(passwordId)} />
                    ))}
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <Button onClick={() => window.location.hash='/newPassword'}>
                            New Password
                    </Button>
                </Col>
            </Row>
        </Container>
    }
}

export default PasswordList
