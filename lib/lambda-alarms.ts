import { Construct, StackProps, Stack, Duration } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';
import { Alarm, TreatMissingData } from '@aws-cdk/aws-cloudwatch';
import * as cw from '@aws-cdk/aws-cloudwatch';
// import * as logs from '@aws-cdk/aws-logs';

export class LambdaAlarmsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO figure dynamic way to get existing lambda arns - maybe by their stack??
    const fn = Function.fromFunctionArn(this, 'MyImportedFunction', "arn-here");

    const baseAlarm = {
      treatMissingData: TreatMissingData.NOT_BREACHING,
      period: Duration.minutes(5),
      statistic: "sum",
    };

    // error
    new Alarm(this, 'ErrorsAlarm', {
      ...baseAlarm,
      metric: fn.metricErrors(),
      alarmName: `${fn.functionName}-error-alarm`,      
      alarmDescription: `Error alarm for "${fn.functionName}" lambda`,
      // tweakable settings
      threshold: 3,
      evaluationPeriods: 2,
    });
    
    // throttle
    new Alarm(this, 'ThrottleAlarm', {
      ...baseAlarm,
      metric: fn.metricThrottles(),
      alarmName: `${fn.functionName}-throttle-alarm`,      
      alarmDescription: `Throttle alarm for "${fn.functionName}" lambda`,
      // tweakable settings
      threshold: 3,
      evaluationPeriods: 2,
    });
    
    // duration
    new Alarm(this, 'DurationAlarm', {
      ...baseAlarm,
      metric: fn.metricDuration(),
      alarmName: `${fn.functionName}-duration-alarm`,      
      alarmDescription: `Duration alarm for "${fn.functionName}" lambda`,
      // tweakable settings
      threshold: 100,
      evaluationPeriods: 2,
    });
    
  }
}
