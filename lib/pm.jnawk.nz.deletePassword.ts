import * as AWS from 'aws-sdk'
import * as aws_lambda from 'aws-lambda';
import { validateToken } from './validateToken';

import * as config from './config'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})


export async function handler(
    event: aws_lambda.APIGatewayEvent,
    _context: aws_lambda.Context
): Promise<aws_lambda.APIGatewayProxyResult> {

    const body = JSON.parse(event.body!)
    const tokenValidation = await validateToken(body.token)

    await dynamodb.deleteItem({
        Key: {
            passwordId: { S: body.passwordId },
            userName: { S: tokenValidation.user.userName.S }
        },
        TableName: config.passwordsTable
    }).promise()

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({token: tokenValidation.token})
    }
}
