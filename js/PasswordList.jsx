import React from 'react';
import {Row,Col} from 'react-bootstrap';

class PasswordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {passwords: props.passwords};
    }

    render() {
        const passwordRows = [];
        this.state.passwords.map((password) => {
            passwordRows.push(
                <Row id={password.id}>
                    <Col lg={6}>{password.description}</Col>
                </Row>
            );
        });
        return <div>{passwordRows}</div>;
    }
}

export default PasswordList;
