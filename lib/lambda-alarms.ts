import { Construct, StackProps, Stack, Duration } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';
import { Alarm, TreatMissingData } from '@aws-cdk/aws-cloudwatch';
import { NestedStack, NestedStackProps } from '@aws-cdk/aws-cloudformation';

const baseAlarmSettings = {
  treatMissingData: TreatMissingData.NOT_BREACHING,
  period: Duration.minutes(5),
  evaluationPeriods: 1,
  statistic: "sum",
};

// shared lambda alarms, nested stack
class GeneralLambdaAlarmsStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // concurrent executions
    new Alarm(this, 'ConcurrentExecutionsAlarm', {
      ...baseAlarmSettings,
      metric: Function.metricAllConcurrentExecutions(),
      alarmName: `lambda-concurrent-executions-alarm`,      
      alarmDescription: `Concurrent executions alarm for all lambdas`,
      // tweakable settings
      threshold: 750,
      statistic: "max",
    });

    // throttles
    new Alarm(this, 'ThrottlesAlarm', {
      ...baseAlarmSettings,
      metric: Function.metricAllThrottles(),
      alarmName: `lambda-throttle-alarm`,      
      alarmDescription: `Throttle alarm for all lambdas`,
      // tweakable settings
      threshold: 1,
    });

  }
}

// single lambda alarms, nested stack
class SingleLambdaAlarmsStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // TODO figure dynamic way to get existing lambda arns - maybe by their stack??
    const fn = Function.fromFunctionArn(this, 'MyImportedFunction', "arn-here");

    // error
    new Alarm(this, 'ErrorsAlarm', {
      ...baseAlarmSettings,
      metric: fn.metricErrors(),
      alarmName: `${fn.functionName}-error-alarm`,      
      alarmDescription: `Error alarm for "${fn.functionName}" lambda`,
      // tweakable settings
      threshold: 3,
      evaluationPeriods: 2,
    });
    
    // duration
    new Alarm(this, 'DurationAlarm', {
      ...baseAlarmSettings,
      metric: fn.metricDuration(),
      alarmName: `${fn.functionName}-duration-alarm`,      
      alarmDescription: `Duration alarm for "${fn.functionName}" lambda`,
      // tweakable settings
      threshold: 100,
      evaluationPeriods: 2,
    });

  }
}

export class LambdaAlarmsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Alarms that are related to all lambdas
    new GeneralLambdaAlarmsStack(this, 'GeneralLambdaAlarmsStack');

    // Alarms that are created for individual lambdas
    new SingleLambdaAlarmsStack(this, 'SingleLambdaAlarmsStack');    
  }
}
