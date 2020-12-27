import React from 'react'
import {Row,Col,Button} from 'react-bootstrap'

class Password extends React.Component {
    constructor(props) {
        super(props)
        var pw = this.props.password
        if(pw) {
            this.state = {
                description: pw.description,
                username: pw.username,
                password: pw.password,
                passwordId: pw.passwordId
            }
        } else {
            this.state = {edit: true}
        }

        this.edit_buttonClick = () => {
            this.setState({edit: true})
        }

        this.save_buttonClick = () => {
            this.props.savePassword(this.state.passwordId, {
                description: this.state.description,
                username: this.state.username,
                password: this.state.password
            }).then(response => {
                if(!this.state.passwordId) {
                    this.setState({passwordId: response.passwordId})
                }
                this.setState({edit: false})
            })
        }

    }

    render() {
        let { description, username, password } = this.state
        let saveEdit

        if(this.state.edit) {
            description = <input
                type="text"
                id="description"
                onChange={event => this.setState({description: event.target.value})}
                value={description || ''}/>

            username = <input
                type="text"
                id="username"
                onChange={event => this.setState({username: event.target.value})}
                value={username || ''}/>

            password = <input
                type="text"
                id="password"
                onChange={event => this.setState({password: event.target.value})}
                value={password || ''}/>

            saveEdit = <Button
                id="save"
                onClick={this.save_buttonClick}>
                    Save
            </Button>
        } else {
            saveEdit = <Button
                id="edit"
                onClick={this.edit_buttonClick}>
                    Edit
            </Button>
        }

        return <div>
            <Row>
                <Col lg={3}>Description</Col>
                <Col lg={6}>{description}</Col>
            </Row>
            <Row>
                <Col lg={3}>Username</Col>
                <Col lg={6}>{username}</Col>
            </Row>
            <Row>
                <Col lg={3}>Password</Col>
                <Col lg={6}>{password}</Col>
            </Row>
            <Row>
                <Col lg={3}>
                    <Button onClick={() => window.location.hash='/'}>
                      Go Back
                    </Button>
                </Col>
                <Col lg={6}>{saveEdit}</Col>
            </Row>
        </div>
    }
}

export default Password
