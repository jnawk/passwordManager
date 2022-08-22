import time
import boto3

s3 = boto3.client('s3')
cloudfront = boto3.client('cloudfront')

def handler(event: dict, context):
    if event['RequestType'] == 'Delete':
        return

    properties: dict = event['ResourceProperties']
    search = properties['search']
    replace = properties['replace']
    bucket = properties['bucket']
    key = properties['key']
    distribution = properties['distribution']

    print(f'fetching s3://{bucket}/{key}')
    content: str = s3.get_object(
        Bucket=bucket,
        Key=key,
    )['Body'].read().decode('utf-8')

    content = content.replace(search, replace)
    print(f'putting s3://{bucket}/{key}')
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=bytes(content, 'utf-8'),
        ACL='public-read',
        ContentType='text/html',
    )
    print(f"invalidating {distribution}/{key}")
    cloudfront.create_invalidation(
        DistributionId=distribution,
        InvalidationBatch=dict(
            Paths=dict(
                Quantity=1,
                Items=[f'/{key}'],
            ),
            CallerReference=str(time.time()),
        )
    )
