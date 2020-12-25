import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'


import Password from './Password.jsx'


class PasswordManager extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { closePasswordButtonClick, savePassword } = this.props

        return <Container className="show-grid">
            <Row>
                <Col lg={6}>
                    <Password
                        goBack={closePasswordButtonClick}
                        savePassword={savePassword}/>
                </Col>
            </Row>
        </Container>
    }
}

export default PasswordManager