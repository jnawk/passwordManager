import * as crypto from 'crypto'
import * as AWS from 'aws-sdk'
import * as aws_lambda from 'aws-lambda';
import { encrypt } from './pmCrypto';

import * as config from './config'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const systemKey = process.env.systemKey
const acceptingNewUsers = process.env.acceptingNewMembers


export async function handler(
    event: aws_lambda.APIGatewayEvent,
    _context: aws_lambda.Context): Promise<aws_lambda.APIGatewayProxyResult> {

    if('true' !== acceptingNewUsers) {
        return {
            statusCode: 403,
            headers: config.corsHeaders,
            body: 'Not accepting new users'
        }
    }

    if (!systemKey) {
        //? should this return 503 instead of throw?
        throw new Error("System misconfigured")
    }

    if(!event.body) {
        //? should this return 400 instead of throw?
        throw new Error("No body!")
    }

    const body = JSON.parse(event.body)

    const dynamoResult = await (dynamodb.getItem({
        Key: { userName: { S: body.username } },
        TableName: config.usersTable
    }).promise())

    if(dynamoResult.Item !== undefined) {
        return {
            statusCode: 409,
            headers: config.corsHeaders,
            body: 'Username ' + body.username + ' is already taken'
        }
    }

    // no user
    // generate user's key, encrypt wth system key
    const buf = crypto.randomBytes(48)
    const key = buf.toString('base64')
    const encryptedKey = encrypt(key, body.password)
    const encryptedUsername = encrypt(body.username, key)
    const sysEncryptedKey = encrypt(key, systemKey)
    const user = {
        userName: { S: body.username },
        encryptedKey: { S: encryptedKey },
        encryptedUsername: { S: encryptedUsername },
        sysEncryptedKey: { S: sysEncryptedKey }
    }

    await (dynamodb.putItem({
        TableName: config.usersTable,
        Item: user
    }).promise())

    const token = encrypt(JSON.stringify({
        timestamp: new Date().getTime(),
        user: body.username
    }), systemKey)

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({token: token})
    }
}
