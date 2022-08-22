import * as AWS from 'aws-sdk'
import { decrypt, encrypt } from "./pmCrypto"
import * as config from './config'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

const systemKey = process.env.systemKey

export async function validateToken(token: string) {
    const decryptedToken = JSON.parse(decrypt(token, systemKey!))
    const oldestAcceptableToken = new Date().getTime() - (1000 * 60 * 15)
    if(decryptedToken.timestamp < oldestAcceptableToken) {
        throw new Error('session expired')
    }
    console.log(decryptedToken)
    const username: string = decryptedToken.user
    const dynamoResult = await (dynamodb.getItem({
        Key: { userName: { S: username } },
        TableName: config.usersTable
    }).promise())

    const newToken = encrypt(JSON.stringify({
        timestamp: new Date().getTime(),
        user: username
    }), systemKey!)
    return {
        token: newToken,
        user: dynamoResult.Item!,
        systemKey: systemKey
    }
}
