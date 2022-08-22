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
    const dynamoResult = await (dynamodb.query({
        KeyConditionExpression: 'userName = :str',
        ExpressionAttributeValues: { ':str': { S: user.userName.S } },
        TableName: config.passwordsTable,
        IndexName: 'userName-index'
    }).promise())

    if (dynamoResult.Items === undefined) {
        throw new Error("No passwords?")
    }

    const passwords = dynamoResult.Items.map((password) => {
        if (password.description.S === undefined) {
            return null
        }
        return {
            passwordId: password.passwordId.S,
            description: decrypt(password.description.S, userKey)
        }
    }).filter(password => password !== null)

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({
            token: tokenValidation.token,
            passwords: passwords
        })
    }
}
