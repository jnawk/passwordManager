import React from 'react'
import { Container, Row, Col} from 'react-bootstrap'
import Password from './Password.jsx'

const autoBind = require('auto-bind')

class ShowPassword extends React.Component {
    constructor(props) {
        super(props)
        autoBind(this)
    }

    render() {
        const { password, goBack, savePassword } = this.props
        return (
            <Container className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Password
                            password={password}
                            goBack={goBack}
                            savePassword={savePassword} />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default ShowPassword
