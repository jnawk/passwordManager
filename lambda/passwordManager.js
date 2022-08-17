'use strict'
const crypto = require('crypto')

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

const systemKey = process.env.systemKey
const acceptingNewUsers = process.env.acceptingNewMembers

const corsHeaders = {
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Origin': '*'
}

const passwordsTable = 'passwordManager-passwords'
const usersTable = 'passwordManager-users'

exports.getPasswordDetails = (event, context) => {
    event = JSON.parse(event.body)
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err)
            context.fail(err)
        } else {
            const newToken = data.token
            const user = data.user
            const userKey = decrypt(user.sysEncryptedKey.S, systemKey)
            dynamodb.getItem({
                Key: {
                    'passwordId': { S: event.passwordId },
                    'userName': { S: user.userName.S }
                },
                TableName: passwordsTable
            }, (err, data) => {
                if(err) {
                    context.fail(err)
                } else {
                    context.succeed({
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            token: newToken,
                            description: decrypt(data.Item.description.S, userKey),
                            username: decrypt(data.Item.username.S, userKey),
                            password: decrypt(data.Item.password.S, userKey)
                        })
                    })
                }
            })
        }
    })
}

exports.deletePassword = (event, context) => {
    event = JSON.parse(event.body)
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err)
            context.fail(err)
        } else {
            const newToken = data.token
            const user = data.user
            // const userKey = decrypt(user.sysEncryptedKey.S, systemKey);
            dynamodb.deleteItem({
                Key: {
                    'passwordId': { S: event.passwordId },
                    'userName': { S: user.userName.S }
                },
                TableName: passwordsTable
            }, (err/*, data*/) => {
                if(err) {
                    context.fail(err)
                } else {
                    context.succeed({
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({token: newToken})
                    })
                }
            })
        }
    })
}

exports.getPasswords = (event, context) => {
    event = JSON.parse(event.body)
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err)
            context.fail(err)
        } else {
            const newToken = data.token
            const user = data.user
            const userKey = decrypt(user.sysEncryptedKey.S, systemKey)
            dynamodb.query({
                KeyConditionExpression: 'userName = :str',
                ExpressionAttributeValues: { ':str': { S: data.user.userName.S } },
                TableName: passwordsTable,
                IndexName: 'userName-index'
            }, (err, data) => {
                if(err) {
                    context.fail(err)
                } else {
                    let passwords = Array()
                    data.Items.forEach((password) => {
                        passwords.push({
                            passwordId: password.passwordId.S,
                            description: decrypt(password.description.S, userKey)
                        })
                    })
                    context.succeed({
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            token: newToken,
                            passwords: passwords
                        })
                    })
                }
            })
        }
    })
}

exports.putPassword = (event, context) => {
    event = JSON.parse(event.body)
    console.log('about to validate token')
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err)
            context.fail(err)
        } else {
            const newToken = data.token
            let passwordId
            if('undefined' == typeof event.passwordId) {
                // new password
                const passwordHash = crypto.createHash('sha1').update(event.description).digest('base64')
                passwordId = JSON.stringify({
                    hash: passwordHash,
                    createDateTime: new Date().getTime()
                })
            } else {
                // existing password
                passwordId = event.passwordId
            }
            const decryptedUserKey = decrypt(data.user.sysEncryptedKey.S, systemKey)
            dynamodb.updateItem({
                TableName: passwordsTable,
                Key: {
                    passwordId : { S: passwordId },
                    userName: { S: data.user.userName.S }
                },
                UpdateExpression: 'set #D = :d, #U = :u, #P = :p',
                ExpressionAttributeNames: {
                    '#D': 'description',
                    '#U': 'username',
                    '#P': 'password'
                },
                ExpressionAttributeValues: {
                    ':d': { S: encrypt(event.description, decryptedUserKey) },
                    ':u': { S: encrypt(event.username || '', decryptedUserKey) },
                    ':p': { S: encrypt(event.password, decryptedUserKey) }
                }
            }, (err/*, data*/) => {
                if(err) {
                    context.fail(err)
                } else {
                    context.succeed({
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            token: newToken,
                            passwordId: passwordId
                        })
                    })
                }
            })
        }
    })
}

exports.signup = (event, context) => {
    event = JSON.parse(event.body)
    const username = event.username
    const password = event.password

    if('true' != acceptingNewUsers) {
        context.succeed({
            statusCode: 403,
            headers: corsHeaders,
            body: 'Not accepting new users'
        })
    } else {
        dynamodb.getItem({
            Key: { userName: { S: username } },
            TableName: usersTable
        }, (err, data) => {
            if(err) {
                context.fail(err)
            } else {
                if(null != data.Item) {
                    context.succeec({
                        statusCode: 409,
                        headers: corsHeaders,
                        body: 'Username ' + username + ' is already taken'
                    })
                } else {
                    // no user
                    // generate user's key, encrypt wth system key
                    crypto.randomBytes(48, (ex, buf) => {
                        const key = buf.toString('base64')
                        const encryptedKey = encrypt(key, password)
                        const encryptedUsername = encrypt(username, key)
                        const sysEncryptedKey = encrypt(key, systemKey)
                        const user = {
                            userName: { S: username },
                            encryptedKey: { S: encryptedKey },
                            encryptedUsername: { S: encryptedUsername },
                            sysEncryptedKey: { S: sysEncryptedKey }
                        }
                        dynamodb.putItem({
                            TableName: usersTable,
                            Item: user
                        }, (err/*, data*/) => {
                            if(err) {
                                context.fail(err)
                            } else {
                                const token = encrypt(JSON.stringify({
                                    timestamp: new Date().getTime(),
                                    user: username
                                }), systemKey)
                                context.succeed({
                                    statusCode: 200,
                                    headers: corsHeaders,
                                    body: JSON.stringify({token: token})
                                })
                            }
                        })
                    })
                }
            }
        })
    }
}

exports.acceptingNewMembers = (event, context) => {
    context.succeed({
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({S: acceptingNewUsers})
    })
}

exports.login = (event, context) => {
    event = JSON.parse(event.body)
    const username = event.username
    const password = event.password

    dynamodb.getItem({
        Key: { userName: { S: username } },
        TableName: usersTable
    }, (err, data) => {
        if(err) {
            context.fail(err)
        } else {
            if(typeof data.Item == 'undefined') {
                console.log('no data returned')
                context.succeed({
                    statusCode: 401,
                    headers: corsHeaders,
                    body: 'Login failure'
                })
            } else {
                try {
                    console.log(data.Item)
                    // decrypt user's encrypted key with user's password
                    const decryptedUserKey = decrypt(data.Item.encryptedKey.S, password)

                    // decrypt encrypted username with user's key
                    const decryptedUsername = decrypt(data.Item.encryptedUsername.S, decryptedUserKey)

                    if(username != decryptedUsername) {
                        // user's password fails to decrypt user's key,
                        // or results in a key that fails to successfully decrypt encrypted username.
                        context.succeed({
                            statusCode: 401,
                            headers: corsHeaders,
                            body: 'Login failure'
                        })
                    } else {
                        // user's password descrypts user's key which subsequently decrypts encyrpted username
                        // password must be right.
                        const token = encrypt(JSON.stringify({
                            timestamp: new Date().getTime(),
                            user: username
                        }), systemKey)
                        console.log('returning token')
                        context.succeed({
                            statusCode: 200,
                            headers: corsHeaders,
                            body: JSON.stringify({token: token})
                        })
                    }
                } catch (ex) {
                    console.log(ex)
                    context.fail('Login failure')
                }
            }
        }
    })
}

const validateToken = (event, callback) => {
    const decryptedToken = JSON.parse(decrypt(event.token, systemKey))
    const oldestAcceptableToken = new Date().getTime() - (1000 * 60 * 15)
    if(decryptedToken.timestamp < oldestAcceptableToken) {
        callback(new Error('session expired'))
    } else {
        try {
            console.log(decryptedToken)
            const username = decryptedToken.user
            dynamodb.getItem({
                Key: { userName: { S: username } },
                TableName: usersTable
            }, function(err, data) {
                if(err) {
                    callback(err)
                } else {
                    const newToken = encrypt(JSON.stringify({
                        timestamp: new Date().getTime(),
                        user: username
                    }), systemKey)
                    callback(null, {
                        token: newToken,
                        user: data.Item,
                        systemKey: systemKey
                    })
                }
            })
        } catch (ex) {
            console.log(ex)
            callback(new Error('token failure'))
        }
    }
}

const encrypt = (data, password) => {
    const cipher = crypto.createCipher('aes192', Buffer.from(password, 'binary'))
    let buf = cipher.update(data, 'utf-8', 'base64')
    buf += cipher.final('base64')
    return buf
}

const decrypt = (data, password) => {
    const cipher = crypto.createDecipher('aes192', Buffer.from(password, 'binary'))
    let buf = cipher.update(data, 'base64', 'utf-8')
    buf += cipher.final('utf-8')
    return buf
}
