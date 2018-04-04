import React from 'react';
import {Grid,Row,Col,Button} from 'react-bootstrap';

import Login from './Login.jsx';
import PasswordList from './PasswordList.jsx';

import {V1API,V2API} from './passwordManagerAPIs.js';

class PasswordManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        };

        this.v1API = new V1API(this.props.v1Endpoint);
        this.v2API = new V2API(this.props.v2Endpoint);

        this.loggedIn = () => {
            this.v1API.getPasswordList().then((response) => {
                if(this.state.v2PasswordList) {
                    this.setState({
                        v1PasswordList: response,
                        loggedIn: true
                    });
                } else {
                    this.setState({v1PasswordList: response});
                }
            });
            this.v2API.getPasswordList().then((response) => {
                if(this.state.v1PasswordList) {
                    this.setState({
                        v2PasswordList: response,
                        loggedIn: true
                    });
                } else {
                    this.setState({v2PasswordList: response});
                }
            });
        };

        this.loginButton_click = () => {
            const v1 = this.state.v1;
            const v2 = this.state.v2 || this.state.v1;
            this.v1API.login(v1.username, v1.password).then(
                () => {
                    if(this.state.v2LoggedIn) {
                        this.loggedIn();
                    } else {
                        this.setState({v1LoggedIn: true});
                    }
                },
                (errors) => {
                    console.log(errors);
                }
            );

            this.v2API.login(v2.username, v2.password).then(
                () => {
                    if(this.state.v1LoggedIn) {
                        this.loggedIn();
                    } else {
                        this.setState({v2LoggedIn: true});
                    }
                },
                (errors) => {
                    console.log(errors);
                }
            );
        };

        this.receive_credentials = (endpoint, param, value) => {
            var state = {};
            var endpoint_state = this.state[endpoint] || {};

            endpoint_state[param] = value;
            state[endpoint] = endpoint_state;
            this.setState(state);
        };
    }

    render() {
        if(this.state.loggedIn) {
            const v1PasswordList = <PasswordList
                passwords={this.state.v1PasswordList}
                title='V1 Passwords'
            />;
            const v2PasswordList = <PasswordList
                passwords={this.state.v2PasswordList}
                title="V2 Passwords"
            />;
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>{v1PasswordList}</Col>
                    <Col lg={6}>{v2PasswordList}</Col>
                </Row>
            </Grid>;
        } else {
            const v1Login = <Login
                title='V1 Login Details'
                callback={(param, value) => {
                    this.receive_credentials('v1', param, value);
                }}/>;
            const v2Login = <Login
                title='V2 Login Details (if different from V1)'
                callback={(param, value) => {
                    this.receive_credentials('v2', param, value);
                }}/>;
            return <Grid className="show-grid">
                <Row>
                    <Col lg={6}>{v1Login}</Col>
                    <Col lg={6}>{v2Login}</Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Row>
                            <Col lg={12}>
                                <Button onClick={this.loginButton_click}>
                                    Login
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Grid>;
        }
    }
}

export default PasswordManager;
