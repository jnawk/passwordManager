import React from 'react';
import {Grid,Row,Col,Button} from 'react-bootstrap';

import Login from './Login.jsx';
import PasswordList from './PasswordList.jsx';
import Password from './Password.jsx';

import V2API from './passwordManagerAPIs.js';

const getHash = () => {
    var hash = window.location.hash;
    if(hash.startsWith('#')) {
        hash = hash.replace('#', '');
    }
    return hash;
};

class PasswordManager extends React.Component {
    constructor(props) {
        super(props);
        this.v2API = new V2API(this.props.endpoint);

        // returns state
        this.loadStateForHash = hash => {
            if(hash.startsWith('display')) {
                const passwordId = hash.substr(hash.indexOf('#') + 1);
                if(this.state && this.state.password && this.state.password.passwordId == passwordId) {
                    return Promise.resolve({password: this.state.password});
                }
                return this.v2API.fetchPassword(atob(passwordId));
            }

            return Promise.resolve(this.getPasswordList().then(response => ({passwordList: response})));
        };

        // returns password list
        this.getPasswordList = () => {
            if(this.state && this.state.passwordList) {
                return Promise.resolve(this.state.passwordList);
            }
            return this.v2API.getPasswordList();
        };


        ////////////////////
        // EVENT HANDLERS //
        ////////////////////

        this.loginButtonClick = () => {
            const credentials = this.state.credentials;
            const hash = this.state.target || '';
            this.v2API.login(credentials.username, credentials.password).then(() => {
                Promise.all([
                    this.getPasswordList(),
                    this.loadStateForHash(hash)
                ]).then(([passwordList, state]) => {
                    this.setState(Object.assign({
                        passwordList: passwordList,
                        credentials: null,
                        hash: hash
                    }, state));
                });
            }).catch(() => {
                this.setState({hash: 'login'});
            });
        };

        this.closePasswordButtonClick = () => this.setState({
            hash: '',
            password: null
        });

        // handles the change event on the username and password input fields
        this.receiveCredentials = (param, value) => {
            var credentials = this.state.credentials || {};
            credentials[param] = value;
            this.setState({credentials: credentials});
        };

        this.displayPassword = passwordId => {
            const hash = 'display#' + btoa(passwordId);
            this.loadStateForHash(hash).then(state => this.setState(Object.assign({hash: hash}, state)));
        };

        // fired when the location hash changing
        this.hashChange = () => {
            const hash = getHash();
            if(hash == 'login' && this.state && this.state.passwordList) {
                this.setState({hash: ''});
                window.location.hash = '';
            } else if(hash != 'login') {
                this.loadStateForHash(hash).then(state => this.setState(Object.assign({hash: hash}, state)));
            } else {
                const newState = {hash: 'login'};
                if(this.state) {
                    this.setState(newState);
                } else {
                    this.state = newState;
                }
            }
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChange, false);

        var hash = getHash();
        if(hash == 'login') {
            hash = '';
        }
        this.getPasswordList().then(passwordList => this.setState({
            passwordList: passwordList,
            hash: hash
        })).then(() => this.hashChange()).catch(() => this.setState({
            target: hash,
            hash: 'login'
        }));
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashChange, false);
    }

    render() {
        if(!this.state) {
            return null;
        }
        window.location.hash = this.state.hash;
        if(this.state.hash == 'login' || !this.state.passwordList) {
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Login callback={this.receiveCredentials}/>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Row>
                            <Col lg={12}>
                                <Button onClick={this.loginButtonClick}>
                                    Login
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Grid>;
        } else if (this.state.hash.startsWith('display') && this.state.password) {
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Password
                            password={this.state.password}
                            goBack={this.closePasswordButtonClick}/>
                    </Col>
                </Row>
            </Grid>;
        } else if(this.state.hash == '' && this.state.passwordList) {
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>
                        <PasswordList
                            passwords={this.state.passwordList}
                            displayPasswordCallback={passwordId => this.displayPassword(passwordId)}/>
                    </Col>
                </Row>
            </Grid>;
        }
        return null;
    }
}

export default PasswordManager;
