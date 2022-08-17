import * as cdk from 'aws-cdk-lib';
import * as constructs from 'constructs';
import {
    aws_apigateway as apigateway,
    aws_cloudfront as cloudfront,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_lambda,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_ssm as ssm,
    custom_resources,
    pipelines,
} from 'aws-cdk-lib';

const config = {
    domainName: 'pm.jnawk.nz',
    connection_arn_parameter_name: "/github_jnawk/arn",
    distributionId: "E3UXG2M8UG0ACM",
    websiteBucket: 'jnawk-pm',
    source_repository_path: "jnawk/passwordManager",
    source_repository_branch: 'cdk',
    systemKeyParameterName: "/passwordManager/systemKey",
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const pipeline = new pipelines.CodePipeline(
            this,
            "Pipeline",
            {
                publishAssetsInParallel: false,
                synth: new pipelines.ShellStep("Synth", {
                    input: pipelines.CodePipelineSource.connection(config.source_repository_path, config.source_repository_branch, {
                        connectionArn: ssm.StringParameter.fromStringParameterName(this, "ConnectionArnParameter", config.connection_arn_parameter_name).stringValue
                    }),
                    commands: [
                        'npm ci',
                        '(cd website; npm ci)',
                        'npm run build',
                        "npx cdk synth"
                    ]
                }),
                selfMutation: true
            })

        pipeline.addStage(new DeploymentStage(this, "Deployment"))
    }
}

export class DeploymentStage extends cdk.Stage {
    constructor(scope: constructs.Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);
        new WebsiteStack(this, "WebsiteStack", {
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: 'ap-southeast-2'
            },
            stackName: "passwordManagerV2",
            description: "Stack for JNaWK Password Manager"
        })
    }
}


export class WebsiteStack extends cdk.Stack {
    constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const lambdaAsset = aws_lambda.Code.fromAsset(
            "./lambda",
            { exclude: ['*.zip', ".gitignore", ".eslintrc.json"] }
        )

        const getSystemKey: custom_resources.AwsSdkCall = {
            action: 'getParameter',
            service: 'SSM',
            parameters: {
                Name: config.systemKeyParameterName,
                WithDecryption: true
            },
            physicalResourceId: custom_resources.PhysicalResourceId.of(config.systemKeyParameterName),
        }
        const systemKey = new custom_resources.AwsCustomResource(
            this,
            "ReadParameter" + new Date().getTime(),
            {
                onCreate: getSystemKey,
                onUpdate: getSystemKey,
                policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
                    resources: [[
                        "arn",
                        cdk.Aws.PARTITION,
                        "ssm",
                        cdk.Aws.REGION,
                        cdk.Aws.ACCOUNT_ID,
                        ["parameter", config.systemKeyParameterName].join("")
                    ].join(":")]
                })
            }
        ).getResponseField("Parameter.Value")

        const lambdaEnvironment = {
            "acceptingNewMembers": ssm.StringParameter.fromStringParameterName(
                this,
                "acceptingNewMembersParameter",
                "/passwordManager/acceptingNewMembers"
            ).stringValue,
            systemKey,
        }

        const commonFunctionOptions = {
            code: lambdaAsset,
            memorySize: 128,
            environment: lambdaEnvironment,
            runtime: aws_lambda.Runtime.NODEJS_16_X,
        }

        const getPasswordDetailsFunction = new aws_lambda.Function(
            this,
            "getPasswordDetailsFunction",
            {
                ...commonFunctionOptions,
                handler: "passwordManager.getPasswordDetails",
                timeout: cdk.Duration.seconds(4),
                description: "Password Manager - Gets Password Details",
            }
        )

        const deletePasswordFunction = new aws_lambda.Function(
            this,
            "deletePasswordFunction",
            {
                ...commonFunctionOptions,
                handler: 'passwordManager.deletePassword',
                timeout: cdk.Duration.seconds(3),
                description: 'Password Manager - Deletes a password',
            }
        )

        const getPasswordsFunction = new aws_lambda.Function(
            this,
            "getPasswordsFunction",
            {
                ...commonFunctionOptions,
                handler: "passwordManager.getPasswords",
                timeout: cdk.Duration.seconds(5),
                description: 'Password Manager - Get Passwords',
            }
        )

        const putPasswordFunction = new aws_lambda.Function(
            this,
            "putPasswordFunction",
            {
                ...commonFunctionOptions,
                handler: "passwordManager.putPassword",
                timeout: cdk.Duration.seconds(4),
                description: "Password Manager - Save Password"
            }
        )

        const signupFunction = new aws_lambda.Function(
            this,
            "signupFunction",
            {
                ...commonFunctionOptions,
                handler: "passwordManager.signup",
                timeout: cdk.Duration.seconds(3),
                description: "Password Manager - Signup"
            }
        )

        const loginFunction = new aws_lambda.Function(
            this,
            "loginFunction",
            {
                ...commonFunctionOptions,
                handler: 'passwordManager.login',
                timeout: cdk.Duration.seconds(4),
                description: "Password Manager - Login"
            }
        )

        const acceptingNewMembersFunction = new aws_lambda.Function(
            this,
            "acceptingNewMembersFunction",
            {
                ...commonFunctionOptions,
                handler: 'passwordManager.acceptingNewMembers',
                timeout: cdk.Duration.seconds(1),
                description: "Password Manager - Determines if Password Manager is accepting new members"
            }
        )

        const usersTable = dynamodb.Table.fromTableName(
            this,
            "UsersTable",
            "passwordManager-users"
        )

        const passwordsTable = dynamodb.Table.fromTableName(
            this,
            "PasswordsTable",
            "passwordManager-passwords"
        );

        [
            getPasswordDetailsFunction,
            deletePasswordFunction,
            getPasswordsFunction,
            putPasswordFunction,
            loginFunction,
        ].forEach(lambdaFunction => {
            usersTable.grantReadData(lambdaFunction.grantPrincipal)
        })

        usersTable.grantReadWriteData(signupFunction.grantPrincipal);

        [
            getPasswordDetailsFunction,
            getPasswordsFunction
        ].forEach(lambdaFunction => {
            passwordsTable.grantReadData(lambdaFunction.grantPrincipal)
        });

        [
            deletePasswordFunction,
            putPasswordFunction
        ].forEach(lambdaFunction => {
            passwordsTable.grantWriteData(lambdaFunction.grantPrincipal)
        });

        const apiGateway = new apigateway.RestApi(
            this,
            "ApiGateway",
            {
                restApiName: "Password Manager API V2",
                // deploy: true,
                // deployOptions: { stageName: 'p' }
            }
        )
        // const cfnApiGateway = apiGateway.node.defaultChild as apigateway.CfnRestApi
        // cfnApiGateway.overrideLogicalId("ApiGateway")

        function addResource(resourceName: string, method: string, handler: aws_lambda.IFunction) {
            const resource = apiGateway.root.addResource(resourceName)
            resource.addMethod(method, new apigateway.LambdaIntegration(handler))
            resource.addCorsPreflight({
                allowOrigins: ['*'],
            })
        }

        addResource("accepting-new-members", "GET", acceptingNewMembersFunction)
        addResource("delete-password", "POST", deletePasswordFunction)
        addResource("get-password-details", "POST", getPasswordDetailsFunction)
        addResource("getPasswords", "POST", getPasswordsFunction)
        addResource("login", "POST", loginFunction)
        addResource("putPassword", "PUT", putPasswordFunction)
        addResource("signup", "POST", signupFunction)

        const websiteBucket = s3.Bucket.fromBucketName(
            this,
            "WebsiteBucket",
            config.websiteBucket
        )

        const distribution = cloudfront.Distribution.fromDistributionAttributes(
            this,
            "Distribution",
            {
                distributionId: config.distributionId,
                domainName: config.domainName
            }
        )

        const websiteSource = s3deploy.Source.asset(
            "./website/s3",
            { exclude: ['.gitignore'] }
        )

        const deployment = new s3deploy.BucketDeployment(
            this,
            "DeployWebsite",
            {
                sources: [websiteSource],
                destinationBucket: websiteBucket,
                distribution,
                distributionPaths: ["/*"],
            }
        )

        const updateFunction = new aws_lambda.Function(
            this,
            "UpdateFunction",
            {
                code: aws_lambda.Code.fromAsset('./lib/writeEndpoint'),
                runtime: aws_lambda.Runtime.PYTHON_3_9,
                handler: 'index.handler',
            }
        )

        updateFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    's3:GetObjet',
                    's3:PutObject',
                    's3:PutObjectAcl'
                ],
                resources: [websiteBucket.arnForObjects("index.html")],
                effect: iam.Effect.ALLOW,
            })
        )

        const provider = new custom_resources.Provider(
            this,
            "UpdateProvider",
            {
                onEventHandler: updateFunction
            }
        )

        const updateEndpoint = new cdk.CustomResource(
            this,
            "UpdateEndpoint" + new Date().getTime(),
            {
                serviceToken: provider.serviceToken,
                properties: {
                    bucket: config.websiteBucket,
                    key: "index.html",
                    search: "__ENDPOINT__",
                    replace: apiGateway.deploymentStage.urlForPath('/')
                }
            }
        )
        updateEndpoint.node.addDependency(deployment)
    }
}
