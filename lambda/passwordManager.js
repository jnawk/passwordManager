'use strict'

const acceptingNewUsers = process.env.acceptingNewMembers

exports.acceptingNewMembers = (event, context) => {
    context.succeed({
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({S: acceptingNewUsers})
    })
}
