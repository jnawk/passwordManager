import boto3

s3 = boto3.client('s3')

def handler(event: dict, context):
    if event['RequestType'] == 'Delete':
        return

    properties: dict = event['ResourceProperties']
    search = properties['search']
    replace = properties['replace']
    bucket = properties['bucket']
    key = properties['key']

    content: str = s3.get_object(
        Bucket=bucket,
        Key=key,
    )['Body'].read().decode('utf-8')

    content.replace(search, replace)
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=bytes(content, 'utf-8'),
        ACL='public-read',
        ContentType='text/html',
    )
