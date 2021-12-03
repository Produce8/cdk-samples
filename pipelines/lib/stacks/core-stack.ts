import * as cdk from '@aws-cdk/core';
import {
    GraphqlApi,
    AuthorizationType,
    FieldLogLevel,
    
} from "@aws-cdk/aws-appsync";
import { ChildStack } from './nested-stack';


export class CoreStack extends cdk.Stack{
    readonly graphQlApiId:string; 
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps){
        super(scope,id);
        const api =  new GraphqlApi(this, `web-api-cdk-sample`, {
            name: `web-api-cdk-sample`,
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,                    
                },
            },
            xrayEnabled: true,
            logConfig: {
                excludeVerboseContent: false,
                fieldLogLevel: FieldLogLevel.ALL,
            },
        });
        this.graphQlApiId = api.apiId;
        new ChildStack(this,"nestedstack",api.apiId); 
    }
}