import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import LambdaAlarms = require('../lib/lambda-alarms');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new LambdaAlarms.LambdaAlarmsStack(app, 'TestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});