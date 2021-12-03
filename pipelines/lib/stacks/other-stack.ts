import * as cdk from '@aws-cdk/core';
import {
    GraphqlApi,
    AuthorizationType,
    FieldLogLevel,
    
} from "@aws-cdk/aws-appsync";


export class OtherStack extends cdk.Stack{
    readonly graphQlApiId:string; 
    constructor(scope: cdk.Construct, id: string, apiId:string){
        super(scope,id);
        const api =  GraphqlApi.fromGraphqlApiAttributes(this,"api",{
            graphqlApiId: apiId   
        }); 
    }
}