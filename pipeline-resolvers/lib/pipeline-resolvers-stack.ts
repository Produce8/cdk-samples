import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as db from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda-nodejs"
import { join } from "path";


export class PipelineResolversStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "demo",
      schema: appsync.Schema.fromAsset(join(__dirname, "schema.graphql")),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM
        },
      },
      xrayEnabled: true,
    });

    const albumTable = new db.Table(this, "AlbumsTable", {
      partitionKey: {
        name: "id",
        type: db.AttributeType.STRING,
      },
    });
    
    const albumDs = api.addDynamoDbDataSource("albumDataSource", albumTable);
    
    // Resolver for the Query "getAlbums" that scans the DynamoDb table and returns the entire list.
    albumDs.createResolver({
      typeName: "Query",
      fieldName: "getAlbums",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
      
    const noVanillaIce = new lambda.NodejsFunction(this,
      "noVanillaFunction",{
        entry: join(__dirname, "vanillaDetector.ts"),
      });

     const lambdaDs =  new appsync.LambdaDataSource(this, "lambdaDs", {
        api: api, 
        lambdaFunction: noVanillaIce
      }); 
   

    const createAlbum = new appsync.AppsyncFunction(this, "function", {
      name: "createAlbum",
      api: api,
      dataSource: albumDs,
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition("id").auto(),
        appsync.Values.projecting("input")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    //lambdaDs

    const noVanillaIceCheck = new appsync.AppsyncFunction(this, "function2", {
      name: "appsync_function2",
      api: api,
      dataSource: lambdaDs,
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
      #if( $context.result && $context.result.error )
          $utils.error($context.result.error)          
      #else
        $utils.toJson($context.result.data)
      #end
      `),
    });

    console.log(appsync.MappingTemplate.lambdaResult().renderTemplate())

     new appsync.Resolver(this, "pipeline", {
      typeName: "Mutation",
      fieldName: "createAlbum",
      api: api,      
      pipelineConfig: [noVanillaIceCheck,createAlbum],
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition("id").auto(),
        appsync.Values.projecting("input")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }
}
