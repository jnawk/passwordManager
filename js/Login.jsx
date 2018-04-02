import React from 'react';
import {Row,Col} from 'react-bootstrap';

class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <Row>
                <Col lg={12}>
                    <h1>{this.props.title}</h1>
                </Col>
            </Row>
            <Row>
                <Col lg={2}>
                    <label>Username</label>
                </Col>
                <Col lg={5}>
                    <input type="text" onChange={(event) => {
                        this.props.callback('username', event.target.value);
                    }}/>
                </Col>
            </Row>
            <Row>
                <Col lg={2}>
                    <label>Password</label>
                </Col>
                <Col lg={5}>
                    <input type="password" onChange={(event) => {
                        this.props.callback('password', event.target.value);
                    }}/>
                </Col>
            </Row>
        </div>;
    }
}

export default Login;
