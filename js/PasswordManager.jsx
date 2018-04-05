import React from 'react';
import {Grid,Row,Col,Button} from 'react-bootstrap';

import Login from './Login.jsx';
import PasswordList from './PasswordList.jsx';
import Password from './Password.jsx';

import V2API from './passwordManagerAPIs.js';

class PasswordManager extends React.Component {
    constructor(props) {
        super(props);
        this.v2API = new V2API(this.props.endpoint);

        this.loginButtonClick = () => {
            console.log('login button click');
            const credentials = this.state.credentials;
            this.v2API.login(credentials.username, credentials.password).then(() => {
                this.v2API.getPasswordList().then(passwordList => {
                    var hash = this.state.target || '';

                    this.loadStateForHash(hash).then(state => {
                        this.setState(Object.assign({
                            passwordList: passwordList,
                            credentials: null,
                            hash: hash
                        }, state));
                    }).catch(err => console.log(err));
                });
            }).catch(() => {
                this.setState({hash: 'login'});
            });
        };

        this.loadStateForHash = hash => {
            console.log('loadStateForHash ' + hash);
            return new Promise((resolve, reject) => {
                if(hash.startsWith('display')) {
                    const passwordId = hash.substr(hash.indexOf('#') + 1);
                    this.v2API.fetchPassword(atob(passwordId))
                        .then(response => resolve(response))
                        .catch(err => reject(err));
                } else {
                    resolve({});
                }
            });
        };

        this.receiveCredentials = (param, value) => {
            console.log('receiveCredentials ' + param);
            var credentials = this.state.credentials || {};
            credentials[param] = value;
            this.setState({credentials: credentials});
        };

        this.displayPassword = passwordId => {
            console.log('displaypassword ' + passwordId);
            const hash = 'display#' + btoa(passwordId);
            this.loadStateForHash(hash).then(state => {
                this.setState(Object.assign({
                    hash: hash
                }, state));
            }).catch(() => {
                this.setState({
                    target: hash,
                    hash: 'login'
                });
            });
        };

        if(window.location.hash != '#login') {
            console.log('hash != login. ' + window.location.hash);
            var hash = window.location.hash;
            if(hash.startsWith('#')) {
                hash = hash.replace('#', '');
            }

            Promise.all([
                this.v2API.getPasswordList(),
                this.loadStateForHash(hash)
            ]).then(([passwordList, state]) => {
                this.setState(Object.assign({
                    passwordList: passwordList,
                    hash: hash
                }, state));
            }).catch(() => {
                this.setState({
                    target: hash,
                    hash: 'login'
                });
            });
        }
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
        } else if (this.state.hash.startsWith('display')) {
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>
                        <Password
                            password={this.state.password}
                            goBack={() => this.setState({
                                hash: '',
                                password: null
                            })}/>
                    </Col>
                </Row>
            </Grid>;
        } else if(this.state.passwordList) {
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>
                        <PasswordList
                            passwords={this.state.passwordList}
                            displayPasswordCallback={passwordId => {
                                this.displayPassword(passwordId);
                            }}/>
                    </Col>
                </Row>
            </Grid>;
        }
        return null;
    }
}

export default PasswordManager;
