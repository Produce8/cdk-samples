# Default Alarms Stack 

This is a sample stack that creates 2 lambdas then uses a CDK Aspect to attach 2 types of alarms to each lambda in the stack, one which uses the default error metric and another that uses a custom log filter. 


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
