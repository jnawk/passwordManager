import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button} from 'react-bootstrap'
import PasswordListEntry from './PasswordListEntry.jsx'

import './passwordsHeader.css'
import './newPasswordButton.css'

const autoBind = require('auto-bind')

class PasswordList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        autoBind(this)
    }

    static get propTypes() {
        return {
            v2API: PropTypes.shape({
                getPasswordList: PropTypes.function,
                deletePassword: PropTypes.function
            })
        }
    }

    componentDidMount() {
        this.getPasswordList()
            .then(passwordList => this.setState({
                passwordList: passwordList
            }))
            .catch(() => {
                window.location.hash=`/login/${btoa('/')}`
            })
    }

    // returns password list
    getPasswordList()  {
        const { v2API } = this.props
        return v2API.getPasswordList()
    }

    deletePassword(passwordId) {
        const { v2API } = this.props
        return v2API.deletePassword(passwordId).then(() => {
            const { passwordList } = this.state
            const newPasswordList = passwordList.filter(password => password.passwordId != passwordId)
            this.setState({passwordList: newPasswordList})
        })
    }


    render() {
        const { passwordList } = this.state

        if (!passwordList) {
            return null
        }

        return <>
            <Row className="passwordsHeader">
                <Col lg={6} className="passwordsHeaderContent">
                    <h2>Passwords</h2>
                </Col>
            </Row>
            {passwordList.map(password => (
                <PasswordListEntry key={password.passwordId}
                    password={password}
                    deletePasswordCallback={passwordId => this.deletePassword(passwordId)} />
            ))}
            <Row className="newPasswordButton">
                <Col lg={6}>
                    <Button onClick={() => window.location.hash='/newPassword'}>
                            New Password
                    </Button>
                </Col>
            </Row>
        </>
    }
}

export default PasswordList
