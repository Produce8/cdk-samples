import { IAspect, IConstruct, Duration } from "@aws-cdk/core";
import { Alarm, ComparisonOperator, TreatMissingData } from "@aws-cdk/aws-cloudwatch";
import { ITopic, Topic } from "@aws-cdk/aws-sns";
import { SnsAction } from "@aws-cdk/aws-cloudwatch-actions";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { LogGroup } from "@aws-cdk/aws-logs";

export enum LAMBDA_DEFAULT_METRICS {
    ERRORS = "Errors",
}

export enum KINESIS_STREAM_DEFAULT_METRICS {
    FAILED_PUT_RECORDS = "PutRecords.FailedRecords",
}

export class DefaultAlarm implements IAspect {
    
    alarmSnsArn: string;
    constructor( alarmSnsArn: string) {
        this.alarmSnsArn = alarmSnsArn;
    }
    public visit(node: IConstruct): void {
        if (node instanceof NodejsFunction) {
            const topic = Topic.fromTopicArn(node, "alarm-sns-topic", this.alarmSnsArn);
            this.addErrorLogAlarm(node, topic);
            this.addLambdaErrorAlarm(node, topic);
        }
    }


    private addErrorLogAlarm(node: NodejsFunction, topic: ITopic): void {
        const func = node as NodejsFunction;
        
        const metricFilterId = `metric-filter-${node.node.id}`;
        const metricName = `metric-${func.functionName}`;
        const alarmName = `log-error-alarm-${func.functionName}`;
        const alarmId = `default-log-error-alarm-${node.node.id}`;

        const filter = func.logGroup.addMetricFilter(metricFilterId, {
            filterPattern: {
                // eslint-disable-next-line quotes
                logPatternString: "{$._logLevel = error}",
            },
            metricName,
            metricNamespace: `custom`,
            metricValue: "1",
        });

        const alarm = new Alarm(node, alarmId, {
            evaluationPeriods: 1,
            alarmName,
            threshold: 0,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            metric: filter.metric().with({
                period: Duration.minutes(1),
            }),
            treatMissingData: TreatMissingData.MISSING,
        });

        alarm.addAlarmAction(new SnsAction(topic));
    }

    private addLambdaErrorAlarm(node: NodejsFunction, topic: ITopic): void {
        const errorsMetric = node.metric(LAMBDA_DEFAULT_METRICS.ERRORS);
        const alarmId = `lambda-errors-alarm-${node.node.id}`;
        const alarmName = `lambda-errors-alarm-${node.functionName}`;

        const alarm = new Alarm(node, alarmId, {
            evaluationPeriods: 1,
            alarmName,
            threshold: 0,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            metric: errorsMetric.with({
                period: Duration.minutes(1),
            }),
            treatMissingData: TreatMissingData.MISSING,
        });

        alarm.addAlarmAction(new SnsAction(topic));
    }

   
}
