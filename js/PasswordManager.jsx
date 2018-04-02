import React from 'react';
import {Grid,Row,Col,Button} from 'react-bootstrap';

import Login from './Login.jsx';

class PasswordManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        };

        this.loginButton_click = () => {
            console.log(this.state);
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
            return <div>yay</div>;
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
