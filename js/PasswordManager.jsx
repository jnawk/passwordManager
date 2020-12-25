import React from 'react'
import { Container, Row, Col, Button} from 'react-bootstrap'
import PasswordList from './PasswordList.jsx'
import Password from './Password.jsx'
import PasswordDisplay from './PasswordDisplay.jsx'
import LoginPage from './LoginPage.jsx'
import V2API from './passwordManagerAPIs.js'

const getHash = () => {
    var hash = window.location.hash
    if(hash.startsWith('#')) {
        hash = hash.replace('#', '')
    }
    return hash
}

class PasswordManager extends React.Component {
    constructor(props) {
        super(props)
        this.v2API = new V2API(this.props.endpoint)

        // returns state
        this.loadStateForHash = hash => {
            if(hash.startsWith('display')) {
                const passwordId = hash.substr(hash.indexOf('#') + 1)
                if(this.state && this.state.password && this.state.password.passwordId == passwordId) {
                    return Promise.resolve({password: this.state.password})
                }
                return this.v2API.fetchPassword(atob(passwordId))
            }

            return Promise.resolve(this.getPasswordList().then(response => ({passwordList: response})))
        }

        // returns password list
        this.getPasswordList = () => {
            if(this.state && this.state.passwordList) {
                return Promise.resolve(this.state.passwordList)
            }
            return this.v2API.getPasswordList()
        }

        this.savePassword = (passwordId, data) => {
            if(passwordId) {
                return this.v2API.updatePassword(atob(passwordId), data)
            } else {
                return this.v2API.createPassword(data).then(response => {
                    var pwList = this.state.passwordList
                    pwList.push({
                        description: data.description,
                        passwordId: response.passwordId
                    })
                    pwList = this.v2API.sortPasswords(pwList)
                    this.setState({passwordList: pwList})
                    return response
                })
            }
        }

        this.deletePassword = passwordId => {
            return this.v2API.deletePassword(passwordId).then(() => {
                this.setState({passwordList: this.state.passwordList.filter(password => password.passwordId != passwordId)})
            })
        }

        ////////////////////
        // EVENT HANDLERS //
        ////////////////////

        this.loginButtonClick = () => {
            const credentials = this.state.credentials
            const hash = this.state.target || ''
            this.v2API.login(credentials.username, credentials.password).then(() => {
                Promise.all([
                    this.getPasswordList(),
                    this.loadStateForHash(hash)
                ]).then(([passwordList, state]) => {
                    this.setState(Object.assign({
                        passwordList: passwordList,
                        credentials: null,
                        hash: hash
                    }, state))
                })
            }).catch(() => {
                this.setState({hash: 'login'})
            })
        }

        this.closePasswordButtonClick = () => this.setState({
            hash: '',
            password: null
        })

        this.newPasswordButtonClick = () => this.setState({
            hash: 'newPassword'
        })

        // handles the change event on the username and password input fields
        this.receiveCredentials = (param, value) => {
            var credentials = this.state.credentials || {}
            credentials[param] = value
            this.setState({credentials: credentials})
        }

        this.displayPassword = passwordId => {
            const hash = 'display#' + btoa(passwordId)
            this.loadStateForHash(hash).then(state => this.setState(Object.assign({hash: hash}, state)))
        }

        // fired when the location hash changing
        this.hashChange = () => {
            const hash = getHash()
            if(hash == 'login' && this.state && this.state.passwordList) {
                this.setState({hash: ''})
                window.location.hash = ''
            } else if(hash != 'login') {
                this.loadStateForHash(hash).then(state => this.setState(Object.assign({hash: hash}, state)))
            } else {
                const newState = {hash: 'login'}
                if(this.state) {
                    this.setState(newState)
                } else {
                    this.state = newState
                }
            }
        }
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChange, false)

        var hash = getHash()
        if(hash == 'login') {
            hash = ''
        }
        this.getPasswordList()
            .then(passwordList => this.setState({
                passwordList: passwordList,
                hash: hash
            }))
            .then(this.hashChange)
            .catch(() => this.setState({
                target: hash,
                hash: 'login'
            }))
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashChange, false)
    }

    render() {
        if(!this.state) {
            return null
        }
        window.location.hash = this.state.hash
        if(this.state.hash == 'login' || !this.state.passwordList) {
            return (
                <LoginPage callback={this.receiveCredentials}
                    enterCallback={this.loginButtonClick}
                    loginButtonClick={this.loginButtonClick}
                />
            )
        } else if (this.state.hash.startsWith('display') && this.state.password) {
            return (
                <PasswordDisplay password={this.state.password}
                    goBack={this.closePasswordButtonClick}
                    savePassword={this.savePassword}/>
            )
        } else if(this.state.hash == '' && this.state.passwordList) {
            return <Container className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Button onClick={this.newPasswordButtonClick}>
                            New Password
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <PasswordList
                            passwords={this.state.passwordList}
                            displayPasswordCallback={passwordId => this.displayPassword(passwordId)}
                            deletePasswordCallback={passwordId => this.deletePassword(passwordId)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <Button onClick={this.newPasswordButtonClick}>
                            New Password
                        </Button>
                    </Col>
                </Row>
            </Container>
        } else if(this.state.hash == 'newPassword') {
            return <Container className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Password
                            goBack={this.closePasswordButtonClick}
                            savePassword={this.savePassword}/>
                    </Col>
                </Row>
            </Container>
        }
        return null
    }
}

export default PasswordManager
