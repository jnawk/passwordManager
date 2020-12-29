import React from 'react'
import { Row, Col, Button} from 'react-bootstrap'

import './passwordListEntry.css'

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
            <Row key={password.passwordId} className="passwordListEntry">
                <Col xs={9} d={10}>
                    <a href={`#/showPassword/${btoa(password.passwordId)}`}>
                        {password.description}
                    </a>
                </Col>
                <Col xs={3} md={1}>
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
