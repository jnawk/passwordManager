'use strict'

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

const systemKey = process.env.systemKey
const acceptingNewUsers = process.env.acceptingNewMembers

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

