import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'
import PasswordList from './PasswordList.jsx'

const autoBind = require('auto-bind')

class PasswordListDisplay extends React.Component {
    constructor(props) {
        super(props)
        autoBind(this)
    }

    render() {
        const {
            newPasswordButtonClick,
            passwordList,
            displayPassword,
            deletePassword
        } = this.props

        return <Container className="show-grid">
            <Row>
                <Col lg={6}>
                    <Button onClick={newPasswordButtonClick}>
                            New Password
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <PasswordList
                        passwords={passwordList}
                        displayPasswordCallback={passwordId => displayPassword(passwordId)}
                        deletePasswordCallback={passwordId => deletePassword(passwordId)}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <Button onClick={newPasswordButtonClick}>
                            New Password
                    </Button>
                </Col>
            </Row>
        </Container>
    }
}

export default PasswordListDisplay
