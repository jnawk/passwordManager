import * as aws_lambda from 'aws-lambda';

import * as config from './config'

const acceptingNewUsers = process.env.acceptingNewMembers


export async function handler(
    event: aws_lambda.APIGatewayEvent,
    _context: aws_lambda.Context): Promise<aws_lambda.APIGatewayProxyResult> {

    return {
        statusCode: 200,
        headers: config.corsHeaders,
        body: JSON.stringify({S: acceptingNewUsers})
    }
}
