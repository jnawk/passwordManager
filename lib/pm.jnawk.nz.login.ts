import * as AWS from 'aws-sdk'
import * as aws_lambda from 'aws-lambda';
import { decrypt, encrypt } from './pmCrypto';

import * as config from './config'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const systemKey = process.env.systemKey

export async function handler(
    event: aws_lambda.APIGatewayEvent,
    _context: aws_lambda.Context): Promise<aws_lambda.APIGatewayProxyResult> {

    const body = JSON.parse(event.body!)

    const dynamoResult = await (dynamodb.getItem({
        Key: { userName: { S: body.username } },
        TableName: config.usersTable
    }).promise())

    if (dynamoResult.Item === undefined) {
        return {
            statusCode: 401,
            headers: config.corsHeaders,
            body: 'Login failure'
        }
    }

    const decryptedUserKey = decrypt(dynamoResult.Item.encryptedKey.S!, body.password)

    // decrypt encrypted username with user's key
    const decryptedUsername = decrypt(dynamoResult.Item.encryptedUsername.S!, decryptedUserKey)

    if(body.username != decryptedUsername) {
        // user's password fails to decrypt user's key,
        // or results in a key that fails to successfully decrypt encrypted username.
        return {
            statusCode: 401,
            headers: config.corsHeaders,
            body: 'Login failure'
        }
    }
    // user's password descrypts user's key which subsequently decrypts encyrpted username
    // password must be right.
    const token = encrypt(JSON.stringify({
        timestamp: new Date().getTime(),
        user: body.username
    }), systemKey!)
    console.log('returning token')
    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({token: token})
    }
}
