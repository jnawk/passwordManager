import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {   
  pipelines,
  custom_resources,
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_route53_targets as route53_targets,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_ssm as ssm
} from 'aws-cdk-lib';

const config = {
  domainName: 'pm.jnawk.nz',
  connection_arn_parameter_name: "/github_jnawk/arn",
  certificate_arn_parameter_name: "/beekeepingcalculator.tools/certificate_arn",
  source_repository_path: "jnawk/passwordManager",
  source_repository_branch: 'cdk'
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);  
      const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
          publishAssetsInParallel: false,
          synth: new pipelines.ShellStep("Synth", { input: pipelines.CodePipelineSource.connection(config.source_repository_path, config.source_repository_branch, {
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

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    const certificateStack = new CertificateStack(this, "CertificateStack", {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1'
      }
    })
    const websiteStack = new WebsiteStack(this, "WebsiteStack", {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'ap-southeast-2'
      }
    })
    websiteStack.addDependency(certificateStack)
  }
}

export class CertificateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);  
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: config.domainName,
      validation: acm.CertificateValidation.fromDns(
        route53.HostedZone.fromLookup(this, "HostedZone", {
          domainName: config.domainName
        })
      )
    })
    new ssm.StringParameter(this, "CertificateArnParameter", {
      parameterName: config.certificate_arn_parameter_name,
      stringValue: certificate.certificateArn
    })
  }
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {versioned: true})
    
    const certificate_arn_lookup = new custom_resources.AwsCustomResource(this, "CertificateArnLookup", {
      onCreate: {
        action: "getParameter",
        service: "SSM",
        region: 'us-east-1',
        parameters: {
          Name: config.certificate_arn_parameter_name
        },physicalResourceId: custom_resources.PhysicalResourceId.of(config.certificate_arn_parameter_name),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({resources:[
        [
          "arn",
          cdk.Aws.PARTITION,
          "ssm",
          'us-east-1',
          cdk.Aws.ACCOUNT_ID,
          ["parameter", config.certificate_arn_parameter_name].join("")
        ].join(":")                
        ]}),
    })
    const certificate = acm.Certificate.fromCertificateArn(this, "Certificate", certificate_arn_lookup.getResponseField("Parameter.Value"))

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket)
      },
      defaultRootObject: "index.html",
      certificate: certificate,
      domainNames: [
        config.domainName
      ]
    })
    const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: config.domainName
    })

    new route53.ARecord(this, "ARecord", {
      zone: zone,
      recordName: config.domainName,
      target: route53.RecordTarget.fromAlias( new route53_targets.CloudFrontTarget(distribution))
    })

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [ s3deploy.Source.asset("./website/build")],
      destinationBucket: websiteBucket,
      distribution, 
      distributionPaths: ["/*"],
    })
  }
}
