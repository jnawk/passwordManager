import React from 'react'
import { Row, Col } from 'react-bootstrap'

import PasswordListEntry from './PasswordListEntry.jsx'

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
            {passwords.map(password => (
                <PasswordListEntry key={password.passwordId}
                    password={password}
                    displayPasswordCallback={displayPasswordCallback}
                    deletePasswordCallback={deletePasswordCallback} />
            ))}

        </div>
    }
}

export default PasswordList
