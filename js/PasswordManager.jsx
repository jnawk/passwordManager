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

        this.loginButtonClick = () => {
            return new Promise(resolve => {
                console.log('login button click');
                const credentials = this.state.credentials;

                var hash = this.state.target || '';
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
                resolve();
            });
        };

        this.loadStateForHash = hash => {
            console.log('loadStateForHash ' + hash);

            if(hash.startsWith('display')) {
                console.log('starts with display');
                const passwordId = hash.substr(hash.indexOf('#') + 1);
                console.log(this.state);
                if(this.state && this.state.password && this.state.password.passwordId == passwordId) {
                    return new Promise(resolve => resolve({password: this.state.password}));
                } else {
                    return this.v2API.fetchPassword(atob(passwordId));
                }
            } else {
                console.log('does not start with display');
                return new Promise((resolve, reject) => {
                    this.getPasswordList()
                        .then(response => resolve({passwordList: response}))
                        .catch(err => reject(err));
                });
            }
        };

        this.getPasswordList = () => {
            console.log('getPasswordList');
            if(this.state && this.state.passwordList) {
                console.log('existing list');
                return new Promise(resolve => resolve(this.state.passwordList));
            } else {
                console.log('fetching list');
                return this.v2API.getPasswordList();
            }
        };

        this.receiveCredentials = (param, value) => {
            return new Promise(resolve => {
                console.log('receiveCredentials ' + param);
                var credentials = this.state.credentials || {};
                credentials[param] = value;
                this.setState({credentials: credentials});
                resolve();
            });
        };

        this.displayPassword = passwordId => {
            return new Promise(resolve => {
                console.log('displaypassword ' + passwordId);
                const hash = 'display#' + btoa(passwordId);
                window.location.hash = hash;
                resolve();
            });
        };

        this.hashChange = () => {
            console.log('hash changed');
            const hash = getHash();
            if(hash == 'login' && this.state && this.state.passwordList) {
                return new Promise(resolve => {
                    this.setState({hash: ''});
                    window.location.hash = '';
                    resolve();
                });
            } else if(hash != 'login') {
                console.log('hash != login. ' + hash);
                return new Promise((resolve, reject) => {
                    this.loadStateForHash(hash).then(state => {
                        this.setState(Object.assign({hash: hash}, state));
                        resolve();
                    }).catch(err => reject(err));
                });
            } else {
                return new Promise(resolve => {
                    const newState = {hash: 'login'};
                    if(this.state) {
                        this.setState(newState);
                    } else {
                        this.state = newState;
                    }
                    resolve();
                });
            }
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChange, false);

        var hash = getHash();
        if(hash == '#login') {
            hash = '';
        }
        this.getPasswordList().then(response => {
            this.setState({
                passwordList: response,
                hash: hash
            });
        }).then(() => this.hashChange()).catch(err => {
            console.log(err);
            this.setState({
                target: hash,
                hash: 'login'
            });
        });
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
