#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { LambdaAlarmsStack } from '../lib/lambda-alarms';

const app = new cdk.App();
new LambdaAlarmsStack(app, 'LambdaAlarmsStack');
