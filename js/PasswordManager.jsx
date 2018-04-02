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
                title='V1 Login'
                callback={(param, value) => {
                    this.receive_credentials('v1', param, value);
                }}/>;
            const v2Login = <Login
                title='V2 Login'
                callback={(param, value) => {
                    this.receive_credentials('v2', param, value);
                }}/>;
            return <Grid className="show-grid">
                <Row>
                    <Col lg={4}>
                        {v1Login}
                    </Col>
                </Row>
                <Row>
                    <Col lg={4}>
                        {v2Login}
                    </Col>
                </Row>
                <Row>
                    <Col lg={4}>
                        <Grid>
                            <Row>
                                <Col lg={2} lgOffset={1}>
                                    <Button onClick={this.loginButton_click}>Login</Button>
                                </Col>
                            </Row>
                        </Grid>
                    </Col>
                </Row>
            </Grid>;
        }
    }
}

export default PasswordManager;
