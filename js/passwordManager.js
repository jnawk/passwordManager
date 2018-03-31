'use strict';
const crypto = require('crypto');

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const systemKey = process.env.systemKey;
const acceptingNewUsers = process.env.acceptingNewUsers;

exports.getPasswordDetails = (event, context) => {
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err);
            context.fail(err);
        } else {
            const lambdaResponse = JSON.parse(data.Payload);
            if(lambdaResponse.errorMessage) {
                context.fail(lambdaResponse.errorMessage);
            } else {
                const newToken = lambdaResponse.token;
                const user = lambdaResponse.user;
                const userKey = decrypt(user.sysEncryptedKey.S, systemKey);
                dynamodb.getItem({
                    Key: {
                        'passwordId': { S: event.passwordId },
                        'userName': { S: user.userName.S }
                    },
                    TableName: 'passwordManager-passwords'
                }, (err, data) => {
                    if(err) {
                        context.fail(err);
                    } else {
                        context.succeed({
                            token: newToken,
                            description: decrypt(data.Item.description.S, userKey),
                            username: decrypt(data.Item.username.S, userKey),
                            password: decrypt(data.Item.password.S, userKey)
                        });
                    }
                });
            }
        }
    });
};

exports.deletePassword = (event, context) => {
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err);
            context.fail(err);
        } else {
            const lambdaResponse = JSON.parse(data.Payload);
            if(lambdaResponse.errorMessage) {
                context.fail(lambdaResponse.errorMessage);
            } else {
                const newToken = lambdaResponse.token;
                const user = lambdaResponse.user;
                // const userKey = decrypt(user.sysEncryptedKey.S, systemKey);
                dynamodb.deleteItem({
                    Key: {
                        'passwordId': { S: event.passwordId },
                        'userName': { S: user.userName.S }
                    },
                    TableName: 'passwordManager-passwords'
                }, (err/*, data*/) => {
                    if(err) {
                        context.fail(err);
                    } else {
                        context.succeed({
                            token: newToken
                        });
                    }
                });
            }
        }
    });
};

exports.getPasswords = (event, context) => {
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err);
            context.fail(err);
        } else {
            const lambdaResponse = JSON.parse(data.Payload);
            if(lambdaResponse.errorMessage) {
                context.fail(lambdaResponse.errorMessage);
            } else {
                const newToken = lambdaResponse.token;
                const user = lambdaResponse.user;
                const userKey = decrypt(user.sysEncryptedKey.S, systemKey);
                dynamodb.query({
                    KeyConditionExpression: 'userName = :str',
                    ExpressionAttributeValues: { ':str': { S: lambdaResponse.user.userName.S } },
                    TableName: 'passwordManager-passwords',
                    IndexName: 'userName-index'
                }, (err, data) => {
                    if(err) {
                        context.fail(err);
                    } else {
                        var passwords = Array();
                        data.Items.forEach((password) => {
                            passwords.push({
                                passwordId: password.passwordId.S,
                                description: decrypt(password.description.S, userKey)
                            });
                        });
                        context.succeed({
                            token: newToken,
                            passwords: passwords
                        });
                    }
                });
            }
        }
    });
};

exports.putPassword = (event, context) => {
    console.log('about to validate token');
    validateToken(event, (err, data) => {
        if(err) {
            console.log(err);
            context.fail(err);
        } else {
            var lambdaResponse = JSON.parse(data.Payload);
            console.log(lambdaResponse);
            if(lambdaResponse.errorMessage) {
                context.fail(lambdaResponse.errorMessage);
            } else {
                const newToken = lambdaResponse.token;
                var passwordId;
                if('undefined' == typeof event.passwordId) {
                    // new password
                    const passwordHash = crypto.createHash('sha1').update(event.description).digest('base64');
                    passwordId = JSON.stringify({
                        hash: passwordHash,
                        createDateTime: new Date().getTime()
                    });
                } else {
                    // existing password
                    passwordId = event.passwordId;
                }
                const decryptedUserKey = decrypt(lambdaResponse.user.sysEncryptedKey.S, JSON.parse(lambdaResponse.systemKey.Payload));
                dynamodb.updateItem({
                    TableName: 'passwordManager-passwords',
                    Key: {
                        passwordId : { S: passwordId },
                        userName: { S: lambdaResponse.user.userName.S }
                    },
                    UpdateExpression: 'set #D = :d, #U = :u, #P = :p',
                    ExpressionAttributeNames: {
                        '#D': 'description',
                        '#U': 'username',
                        '#P': 'password'
                    },
                    ExpressionAttributeValues: {
                        ':d': { S: encrypt(event.description, decryptedUserKey) },
                        ':u': { S: encrypt(event.username, decryptedUserKey) },
                        ':p': { S: encrypt(event.password, decryptedUserKey) }
                    }
                }, (err/*, data*/) => {
                    if(err) {
                        context.fail(err);
                    } else {
                        context.succeed({
                            token: newToken,
                            passwordId: passwordId
                        });
                    }
                });
            }
        }
    });
};

exports.signup = (event, context) => {
    const username = event.username;
    const password = event.password;

    if('true' != acceptingNewUsers) {
        context.fail('Not accepting new users');
    } else {
        dynamodb.getItem({
            Key: { userName: { S: username } },
            TableName: 'passwordManager-users'
        }, (err, data) => {
            if(err) {
                context.fail(err);
            } else {
                if(null != data.Item) {
                    context.fail(new Error('Username ' + username + ' is already taken'));
                } else {
                    // no user
                    // generate user's key, encrypt wth system key
                    crypto.randomBytes(48, (ex, buf) => {
                        const key = buf.toString('base64');
                        const encryptedKey = encrypt(key, password);
                        const encryptedUsername = encrypt(username, key);
                        const sysEncryptedKey = encrypt(key, systemKey);
                        const user = {
                            userName: { S: username },
                            encryptedKey: { S: encryptedKey },
                            encryptedUsername: { S: encryptedUsername },
                            sysEncryptedKey: { S: sysEncryptedKey }
                        };
                        dynamodb.putItem({
                            TableName: 'passwordManager-users',
                            Item: user
                        }, (err/*, data*/) => {
                            if(err) {
                                context.fail(err);
                            } else {
                                const token = encrypt(JSON.stringify({
                                    timestamp: new Date().getTime(),
                                    user: username
                                }), systemKey);
                                context.succeed({ token: token });
                            }
                        });
                    });
                }
            }
        });
    }
};

exports.acceptingNewMembers = (event, context) => {
    context.succeed({S: acceptingNewUsers});
}

exports.login = (event, context) => {
    const username = event.username;
    const password = event.password;

    dynamodb.getItem({
       Key: { userName: { S: username } },
       TableName: 'passwordManager-users'
    }, (err, data) => {
        if(err) {
            context.fail(err);
        } else {
            if(typeof data.Item == 'undefined') {
                console.log('no data returned');
                context.fail('Login failure');
            } else {
                try {
                    console.log(data.Item);
                    // decrypt user's encrypted key with user's password
                    var decryptedUserKey = decrypt(data.Item.encryptedKey.S, password);

                    // decrypt encrypted username with user's key
                    var decryptedUsername = decrypt(data.Item.encryptedUsername.S, decryptedUserKey);

                    if(username != decryptedUsername) {
                        // user's password fails to decrypt user's key,
                        // or results in a key that fails to successfully decrypt encrypted username.
                        context.fail('Login failure');
                    } else {
                        // user's password descrypts user's key which subsequently decrypts encyrpted username
                        // password must be right.
                        var token = encrypt(JSON.stringify({
                            timestamp: new Date().getTime(),
                            user: username
                        }), systemKey);
                        console.log('returning token');
                        context.succeed({ token: token });
                    }
                } catch (ex) {
                    console.log(ex);
                    context.fail('Login failure');
                }
            }
        }
    });
};

const validateToken = (event, callback) => {
    const username = event.username;
    const password = event.password;

    dynamodb.getItem({
        Key: { userName: { S: username } },
        TableName: 'passwordManager-users'
    }, (err, data) => {
        if(err) {
            callback(err);
        } else {
            if(typeof data.Item == 'undefined') {
                console.log('no data returned');
                callback('Login failure');
            } else {
                try {
                    console.log(data.Item);
                    // decrypt user's encrypted key with user's password
                    var decryptedUserKey = decrypt(data.Item.encryptedKey.S, password);

                    // decrypt encrypted username with user's key
                    var decryptedUsername = decrypt(data.Item.encryptedUsername.S, decryptedUserKey);

                    if(username != decryptedUsername) {
                        // user's password fails to decrypt user's key,
                        // or results in a key that fails to successfully decrypt encrypted username.
                        callback('Login failure');
                    } else {
                        // user's password descrypts user's key which subsequently decrypts encyrpted username
                        // password must be right.
                        const token = encrypt(JSON.stringify({
                            timestamp: new Date().getTime(),
                            user: username
                        }), systemKey);
                        console.log('returning token');
                        callback(null, { token: token });
                    }
                } catch (ex) {
                    console.log(ex);
                    callback('Login failure');
                }
            }
        }
    });
};

const encrypt = (data, password) => {
    const cipher = crypto.createCipher('aes192', new Buffer(password, 'binary'));
    var buf = cipher.update(data, 'utf-8', 'base64');
    buf += cipher.final('base64');
    return buf;
};

const decrypt = (data, password) => {
    const cipher = crypto.createDecipher('aes192', new Buffer(password, 'binary'));
    var buf = cipher.update(data, 'base64', 'utf-8');
    buf += cipher.final('utf-8');
    return buf;
};
