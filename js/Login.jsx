import React from 'react';
import {Grid,Row,Col} from 'react-bootstrap';

class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Grid>
            <Row>
                <Col lg={3}>
                    <h1>{this.props.title}</h1>
                </Col>
            </Row>
            <Row>
                <Col lg={1}>
                    <label>Username</label>
                </Col>
                <Col lg={2}>
                    <input type="text" onChange={(event) => {
                        this.props.callback('username', event.target.value);
                    }}/>
                </Col>
            </Row>
            <Row>
                <Col lg={1}>
                    <label>Password</label>
                </Col>
                <Col lg={2}>
                    <input type="password" onChange={(event) => {
                        this.props.callback('password', event.target.value);
                    }}/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default Login;
