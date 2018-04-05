import React from 'react';
import {Row,Col,Button} from 'react-bootstrap';

class PasswordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {passwords: props.passwords};
    }

    render() {
        const passwordRows = [];
        this.state.passwords.map((password) => {
            passwordRows.push(
                <Row key={password.passwordId}>
                    <Col lg={6}>
                        <a onClick={() => {
                            this.props.displayPasswordCallback(password.passwordId);
                            return false;
                        }}>{password.description}</a>
                    </Col>
                    <Col lg={2}>
                        <Button>Delete</Button>
                    </Col>
                </Row>
            );
        });
        return <div>
            <Row>
                <Col lg={6}>
                    <h2>Passwords</h2>
                </Col>
            </Row>
            {passwordRows}
        </div>;
    }
}

export default PasswordList;
