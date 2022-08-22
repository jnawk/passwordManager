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

    if (!systemKey) {
        //? should this return 503 instead of throw?
        throw new Error("System misconfigured")
    }

    if(!event.body) {
        //? should this return 400 instead of throw?
        throw new Error("No body!")
    }

    const body = JSON.parse(event.body)
    const tokenValidation = await validateToken(body.token)

    const user = tokenValidation.user
    if (user.sysEncryptedKey.S === undefined) {
        throw new Error()
    }

    const userKey = decrypt(user.sysEncryptedKey.S, systemKey)
    const dynamoResult = await (dynamodb.getItem({
        Key: {
            passwordId: { S: body.passwordId },
            userName: { S: user.userName.S }
        },
        TableName: config.passwordsTable
    }).promise())

    const item = dynamoResult.Item
    if (item === undefined ||
        item.description.S === undefined ||
        item.username.S === undefined ||
        item.password.S === undefined
    ) {
        //? should this return 404 instead of throw?
        throw new Error("Password doesnt't exist")
    }

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({
            token: tokenValidation.token,
            description: decrypt(item.description.S, userKey),
            username: decrypt(item.username.S, userKey),
            password: decrypt(item.password.S, userKey)
        })
    }
}
