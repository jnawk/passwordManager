import React from 'react'
import PropTypes from 'prop-types'

import { Row, Col } from 'react-bootstrap'

import Password from './Password.jsx'

class PasswordManager extends React.Component {
    constructor(props) {
        super(props)
    }

    static get propTypes() {
        return {
            savePassword: PropTypes.func
        }
    }

    render() {
        const { savePassword } = this.props

        return (
            <Row>
                <Col xs={12} lg={6}>
                    <Password
                        goBack={() => window.location.hash='/'}
                        savePassword={savePassword}/>
                </Col>
            </Row>
        )
    }
}

export default PasswordManager
