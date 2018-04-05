import React from 'react';
import {Row,Col,Button} from 'react-bootstrap';

class Password extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <Row>
                <Col lg={3}>Description</Col>
                <Col lg={4}>{this.props.password.description}</Col>
            </Row>
            <Row>
                <Col lg={3}>Username</Col>
                <Col lg={4}>{this.props.password.username}</Col>
            </Row>
            <Row>
                <Col lg={3}>Password</Col>
                <Col lg={4}>{this.props.password.password}</Col>
            </Row>
            <Row>
                <Col lg={3}>
                    <Button onClick={this.props.goBack}>Go Back</Button>
                </Col>
            </Row>
        </div>;
    }
}

export default Password;
