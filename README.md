# Password Manager

## Developing
`npm run lint` & `npm run lint:fix` lint the code

`npm run buils -- -w` runs webpack in watch mode; `python3 -m http.server` runs a simple webserver

### Issues Tracker
https://github.com/jnawk/passwordManager/issues

## Building
`npm run build` runs `webpack` building the frontend.

`cd lambda; zip passwordManager2.zip passwordManager.js` builds the back end bundle.

## Releasing
`cfn/passwordManager.cf.yaml` is a cloudformation template to deploy the back end. (Lambda functions & API Gateway)  It refers to the code bundle in S3.

The S3 buckets, `jnawk-pm` (for the web assets) and `jnawk-pm-code` for the lambda bundle are assumed to exist.

`cd s3; aws s3 sync . s3://jnawk-pm/ --acl pubic-read` copies the front end into S3

`aws cloudfront create-invalidation --distribution-id E3UXG2M8UG0ACM --paths '/*'` flushes out the CloudFront cache

`cd lambda; aws s3 cp passwordManager2.zip s3://jnawk-pm-code/`, followed by stack update will update the back end.

The front end refers to the backend API Gateway directly; there is no proxying the API by the CloudFront distribution.

The back end refers to DynamoDB tables which have been created manually.

The CloudFront distribution has been created manually.  The ACM Certificate & Route53 entries associated with the front end have been created manually.  The ACM Certificate uses DNS Validation, and so auto-renews so long as the endpoint presents the current certificate at renew time.
