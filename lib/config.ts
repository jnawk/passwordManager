export const domainName ='pm.jnawk.nz'
export const dockerSecretArn = "arn:aws:secretsmanager:ap-southeast-2:232271975773:secret:jnawk-dockerhub-ekHHiN"
export const connection_arn_parameter_name = "/github_jnawk/arn"
export const distributionId = "E3UXG2M8UG0ACM"
export const websiteBucket = 'jnawk-pm'
export const source_repository_path = "jnawk/passwordManager"
export const source_repository_branch = 'master'
export const systemKeyParameterName = "/passwordManager/systemKey"
export const passwordsTable = 'passwordManager-passwords'
export const usersTable = 'passwordManager-users'
export const corsHeaders = {
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Origin': '*'
}
