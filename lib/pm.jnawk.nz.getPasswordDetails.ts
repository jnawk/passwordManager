import * as AWS from 'aws-sdk'
import * as aws_lambda from 'aws-lambda';
import { decrypt } from './pmCrypto';
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
    const userKey = decrypt(user.sysEncryptedKey.S!, systemKey!)
    const dynamoResult = await (dynamodb.getItem({
        Key: {
            passwordId: { S: body.passwordId },
            userName: { S: user.userName.S }
        },
        TableName: config.passwordsTable
    }).promise())

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({
            token: tokenValidation.token,
            description: decrypt(dynamoResult.Item!.description.S!, userKey),
            username: decrypt(dynamoResult.Item!.username.S!, userKey),
            password: decrypt(dynamoResult.Item!.password.S!, userKey)
        })
    }
}
