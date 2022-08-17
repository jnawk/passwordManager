import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button} from 'react-bootstrap'

import './passwordListEntry.css'

class PasswordList extends React.Component {
    constructor(props) {
        super(props)
    }

    static get propTypes() {
        return {
            deletePasswordCallback: PropTypes.function,
            password: PropTypes.shape({
                passwordId: PropTypes.string,
                description: PropTypes.string
            })
        }
    }

    render() {
        const {
            deletePasswordCallback,
            password
        } = this.props
        return (
            <Row key={password.passwordId} className="passwordListEntry">
                <Col xs={9} md={10} xl={3}>
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
