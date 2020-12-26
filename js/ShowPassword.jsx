import React from 'react'
import { Container, Row, Col} from 'react-bootstrap'

import Password from './Password.jsx'

const autoBind = require('auto-bind')

class ShowPassword extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    componentDidMount() {
        const { password, v2API } = this.props
        v2API.fetchPassword(atob(password))
            .then(password => this.setState(password))
            .catch(()=>window.location.hash='/login')
    }

    render() {
        const { goBack, savePassword } = this.props
        const { password } = this.state
        if(!password) {
            return null
        }

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
