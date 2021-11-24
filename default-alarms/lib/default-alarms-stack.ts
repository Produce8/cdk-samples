import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { RetentionDays } from "@aws-cdk/aws-logs";
import { Topic } from "@aws-cdk/aws-sns";
import * as cdk from "@aws-cdk/core";
import { Aspects } from "@aws-cdk/core";

import * as path from "path";
import { DefaultAlarm } from "./default-alarm";

export class DefaultAlarmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, "helloWorld", {
      entry: path.join(
                __dirname,"../lambda/helloWorld.ts"), // accepts .js, .jsx, .ts and .tsx files
                
              });

    new NodejsFunction(this, "helloWorld2", {
      entry: path.join(
                __dirname,"../lambda/helloWorld2.ts"), // accepts .js, .jsx, .ts and .tsx files
                
              });

    const topic = new Topic(this,"alarmTopic")
  
    Aspects.of(this).add(new DefaultAlarm(topic.topicArn));
  
  }


}

