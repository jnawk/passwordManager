import React from 'react'
import { Row, Col} from 'react-bootstrap'
import PropTypes from 'prop-types'

import Password from './Password.jsx'

const autoBind = require('auto-bind')

class ShowPassword extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    static get propTypes() {
        return {
            v2API: PropTypes.shape({
                fetchPassword: PropTypes.func
            }),
            savePassword: PropTypes.func,
            password: PropTypes.string
        }
    }

    componentDidMount() {
        const { password, v2API } = this.props
        v2API.fetchPassword(atob(password))
            .then(password => this.setState(password))
            .catch(() => window.location.hash = `/login/${btoa(window.location.hash)}`)
    }

    render() {
        const { savePassword } = this.props
        const { password } = this.state
        if(!password) {
            return null
        }

        return (
            <Row>
                <Col lg={6}>
                    <Password
                        password={password}
                        savePassword={savePassword} />
                </Col>
            </Row>
        )
    }
}

export default ShowPassword
