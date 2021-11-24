import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DefaultAlarms from '../lib/default-alarms-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DefaultAlarms.DefaultAlarmsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
