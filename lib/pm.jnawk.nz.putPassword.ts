import * as crypto from 'crypto'
import * as AWS from 'aws-sdk'
import * as aws_lambda from 'aws-lambda';
import { decrypt, encrypt } from './pmCrypto';
import { validateToken } from './validateToken';

import * as config from './config'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const systemKey = process.env.systemKey


export async function handler(
    event: aws_lambda.APIGatewayEvent,
    _context: aws_lambda.Context): Promise<aws_lambda.APIGatewayProxyResult> {

    const body = JSON.parse(event.body!)
    const tokenValidation = await validateToken(body.token)

    const user = tokenValidation.user
    if (user.sysEncryptedKey.S === undefined) {
        throw new Error()
    }

    const userKey = decrypt(user.sysEncryptedKey.S, systemKey!)
    let passwordId = body.passwordId
    if(body.passwordId === undefined) {
        // new password
        const passwordHash = crypto.createHash('sha1').update(body.description).digest('base64')
        passwordId = JSON.stringify({
            hash: passwordHash,
            createDateTime: new Date().getTime()
        })
    }
    await (dynamodb.updateItem({
        TableName: config.passwordsTable,
        Key: {
            passwordId : { S: passwordId },
            userName: { S: user.userName.S }
        },
        UpdateExpression: 'set #D = :d, #U = :u, #P = :p',
        ExpressionAttributeNames: {
            '#D': 'description',
            '#U': 'username',
            '#P': 'password'
        },
        ExpressionAttributeValues: {
            ':d': { S: encrypt(body.description, userKey) },
            ':u': { S: encrypt(body.username || '', userKey) },
            ':p': { S: encrypt(body.password, userKey) }
        }
    }).promise())

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({
            token: tokenValidation.token,
            passwordId: passwordId
        })
    }
}
