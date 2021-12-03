import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Pipelines from '../lib/pipelines-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Pipelines.PipelinesStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
