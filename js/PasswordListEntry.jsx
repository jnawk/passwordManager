import React from 'react'
import { Row, Col, Button} from 'react-bootstrap'

class PasswordList extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            deletePasswordCallback,
            password
        } = this.props
        return (
            <Row key={password.passwordId}>
                <Col lg={6}>
                    <a href={`#/showPassword/${btoa(password.passwordId)}`}>
                        {password.description}
                    </a>
                </Col>
                <Col lg={2}>
                    <Button onClick={() => {
                        // TODO make this something appearing in the markup
                        if(confirm(`Delete '${password.description}'?`)) {
                            deletePasswordCallback(password.passwordId)
                        }
                    }}>Delete</Button>
                </Col>
            </Row>
        )
    }
}

export default PasswordList
