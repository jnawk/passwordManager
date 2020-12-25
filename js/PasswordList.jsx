import React from 'react'
import {Row,Col,Button} from 'react-bootstrap'

class PasswordList extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            displayPasswordCallback,
            deletePasswordCallback,
            passwords
        } = this.props
        return <div>
            <Row>
                <Col lg={8}>
                    <h2>Passwords</h2>
                </Col>
            </Row>
            {passwords.map(password => <Row key={password.passwordId}>
                <Col lg={6}>
                    <a onClick={() => {
                        displayPasswordCallback(password.passwordId)
                        return false
                    }}>{password.description}</a>
                </Col>
                <Col lg={2}>
                    <Button onClick={() => {
                        // TODO make this something appearing in the markup
                        if(confirm(`Delete '${password.description}'?`)) {
                            deletePasswordCallback(password.passwordId)
                        }
                    }}>Delete</Button>
                </Col>
            </Row>)}
        </div>
    }
}

export default PasswordList
