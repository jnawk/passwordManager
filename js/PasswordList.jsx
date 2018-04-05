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
                <Row key={password.id}>
                    <Col lg={6}>
                        {password.description}
                    </Col>
                    <Col lg={1}>
                        <Button onClick={() => {
                            this.props.migrateCallback(password.id);
                        }}>Migrate</Button>
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
