/* eslint-disable security/detect-object-injection */
/*
  the above rule is triggered because there is a dropdown with provided values
  which match keys in criteria - which is static data and is never assigned to,
  and is used to set defaults for password length.  If some malicious user
  alters the DOM to alter the legitimate values of password tyee and the ID of
  the select component then they could use that to set arbitrary state, which is
  never executed, so not sure what the rule is defending against here.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button } from 'react-bootstrap'

const autoBind = require('auto-bind')

import './passwordGenerator.css'
import { generatePassword, generatePassphrase } from './passwordGenerator.js'

const criteria = {
    password: {
        label: 'Password',
        lengthUnit: 'characters',
        placeholder: 'Tr0ub4dor&3',
        defaultLength: 12
    },
    passphrase: {
        label: 'Passphrase',
        lengthUnit: 'words',
        placeholder: 'correct horse battery staple',
        defaultLength: 4
    }
}

class PasswordGenerator extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            passwordType: 'password',
            wankCharacterCount: 1,
            upperCharacterCount: 1,
            lowerCharacterCount: 1,
            numeralCount: 1
        }
        autoBind(this)
    }

    static get propTypes() {
        return {
            setPassword: PropTypes.func
        }
    }

    onChangeHandler(event) {
        let stateUpdate = {}
        stateUpdate[event.target.id] = event.target.value
        this.setState(stateUpdate)
    }

    generate() {
        const {
            passwordType,
            wankCharacterCount,
            upperCharacterCount,
            lowerCharacterCount,
            numeralCount
        } = this.state
        let { length } = this.state
        if(!length) {
            length = {}
        }
        if(!length[passwordType]) {
            length[passwordType] = criteria[passwordType].defaultLength
        }

        if(passwordType == 'password') {
            const result = generatePassword({
                wankCharacterCount,
                upperCharacterCount,
                lowerCharacterCount,
                numeralCount,
                length: length[passwordType]
            })
            this.setState(result)
        } else {
            const generatedPassword = generatePassphrase({ wordCount: length[passwordType] })
            this.setState({
                generatedPassword,
                passwordGenerateFailure: false
            })
        }
    }

    render() {
        const {
            generatedPassword,
            passwordType,
            wankCharacterCount,
            upperCharacterCount,
            lowerCharacterCount,
            numeralCount,
            passwordGenerateFailure
        } = this.state
        const { setPassword } = this.props
        let { length } = this.state
        if(!length) {
            length = {}
        }
        if(!length[passwordType]) {
            length[passwordType] = criteria[passwordType].defaultLength
        }

        const passwordLengthLabel = (
            <>
                {/* show the full label on wide screens */}
                <span className="d-none d-sm-inline">
                    {criteria[passwordType].label} length ({criteria[passwordType].lengthUnit})
                </span>
                {/* abbreviate the label on narrow screens*/}
                <span className="d-inline d-sm-none">Length</span>
            </>
        )
        let criteriaDetermination = null
        let generatedPasswordReceiver

        if(passwordType == 'password') {
            generatedPasswordReceiver = (
                <input id="generatedPassword"
                    value={generatedPassword || ''}
                    placeholder={criteria[passwordType].placeholder}
                    onChange={this.onChangeHandler}/>
            )
            criteriaDetermination = (
                <>
                    <Row>
                        <Col xs={5} className='d-sm-none'>
                          Symbols
                        </Col>
                        <Col sm={5} className='d-none d-sm-block'>
                          Wank Characters
                        </Col>
                        <Col xs={4}>
                            <input id='wankCharacterCount'
                                type='number'
                                value={wankCharacterCount}
                                onChange={this.onChangeHandler}
                                min={0}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={5} className='d-sm-none'>
                          UPPER CASE
                        </Col>
                        <Col sm={5} className='d-none d-sm-block'>
                          Upper Case Characters
                        </Col>
                        <Col xs={4}>
                            <input id='upperCharacterCount'
                                type='number'
                                value={upperCharacterCount}
                                onChange={this.onChangeHandler}
                                min={0}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={5} className='d-sm-none'>
                          lower case
                        </Col>
                        <Col sm={5} className='d-none d-sm-block'>
                          Lower Case Characters
                        </Col>
                        <Col xs={4}>
                            <input id='lowerCharacterCount'
                                type='number'
                                value={lowerCharacterCount}
                                onChange={this.onChangeHandler}
                                min={0}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={5}>
                          Numerals
                        </Col>
                        <Col xs={4}>
                            <input id='numeralCount'
                                type='number'
                                value={numeralCount}
                                onChange={this.onChangeHandler}
                                min={0}/>
                        </Col>
                    </Row>
                </>
            )
        } else {
            generatedPasswordReceiver = (
                <textarea id="generatedPassword"
                    rows={2}
                    value={generatedPassword || ''}
                    placeholder={criteria[passwordType].placeholder}
                    onChange={this.onChangeHandler}/>
            )
        }

        let passwordGenerateFailureMessage = null
        if(passwordGenerateFailure) {
            passwordGenerateFailureMessage = (
                <Row>
                    <Col>
                      Could not generate a password - did you set impossible criteria?
                    </Col>
                </Row>
            )
        }
        return (
            <div className='passwordGenerator'>
                <Row>
                    <Col xs={12} lg={6}>
                        <h4>
                          Password Generator
                        </h4>
                    </Col>
                </Row>
                <Row>
                    <Col xs={3}>{criteria[passwordType].label}</Col>
                    <Col>
                        {generatedPasswordReceiver}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5>Criteria</h5>
                    </Col>
                </Row>
                <Row>
                    <Col xs={5}>
                        <span className="d-none d-sm-inline">Password</span> Type
                    </Col>
                    <Col>
                        <select id='passwordType'
                            value={passwordType}
                            onChange={this.onChangeHandler}>
                            <option value="password">Password</option>
                            <option value="passphrase">Passphrase</option>
                        </select>
                    </Col>
                </Row>
                <Row>
                    <Col xs={5}>
                        {passwordLengthLabel}
                    </Col>
                    <Col xs={4}>
                        <input id='passwordLength'
                            type='number'
                            value={length[passwordType]}
                            onChange={event => {
                                let length = {}
                                length[passwordType] = event.target.value
                                this.setState({ length: length })
                            }}
                            min={1}/>
                    </Col>
                </Row>
                {criteriaDetermination}
                <Row>
                    <Col>
                        <Button onClick={this.generate}>
                        Generate
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={() => setPassword(generatedPassword)}>
                        Set as password
                        </Button>
                    </Col>
                </Row>
                {passwordGenerateFailureMessage}
            </div>
        )
    }
}

export default PasswordGenerator
