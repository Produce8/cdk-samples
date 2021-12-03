import * as cdk from '@aws-cdk/core';
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as codeBuild from "@aws-cdk/aws-codebuild";
import * as codePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import { CoreStack } from './stacks/core-stack';
import { OtherStack } from './stacks/other-stack';


export class PipelinesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const corePipeline = new codePipeline.Pipeline(this, `Pipeline`, {
      pipelineName: `CDK-Samples-Pipeline`,
      restartExecutionOnUpdate: true,
      crossAccountKeys: true,
  });
  const corePipelineSourceArtifacts = new codePipeline.Artifact();

  const gitHubToken = cdk.SecretValue.secretsManager("gitHubToken", {
      jsonField: "token",
  });

  /* Pipeline Source Stage Actions */
  // Pipeline source action
  const corePipelineSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `CDK-GitHub`,
      owner: "Produce8",
      repo: "cdk-samples",
      branch: "main",
      oauthToken: gitHubToken,
      output: corePipelineSourceArtifacts,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
  });

  /* Pipeline Source Stage */
  corePipeline.addStage({
      stageName: "Source",
      actions: [corePipelineSourceAction],
  });

  /* Pipeline Build Stage Actions */
  // Pipeline build action
  const corePipelineBuildOutput = new codePipeline.Artifact("CorePipelineBuildArtifact");
  const corePipelineBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `CDK-CodeBuild`,
      project: new codeBuild.PipelineProject(
          this,
          `CDK-PipelineProject`,
          {
              projectName: `CDK-PipelineProject`,
              buildSpec: codeBuild.BuildSpec.fromObject({
                  version: "0.2",
                  phases: {
                      install: {
                          "runtime-versions": {
                              nodejs: 14,
                          },
                          commands: ["cd pipelines","npm ci"],
                      },
                      build: {
                          commands: [
                              "ls -Al",                              
                              "npm run build",
                              "npm run cdk synth",
                              "ls -Al",
                              "ls -Al cdk.out/",
                          ],
                      },
                  },
                  artifacts: {
                      "base-directory": "cdk.out",
                      files: "**/*",
                  },
              }),
          }
      ),
      input: corePipelineSourceArtifacts,
      outputs: [corePipelineBuildOutput],
  });
  
  corePipeline.addStage({
    stageName: "Build",
    actions: [corePipelineBuildAction],
  });

        const core = new CoreStack(this,"core-stack"); 
        const other = new OtherStack(this,"otherStack",core.graphQlApiId); 

        const betaArtifact = new codePipeline.Artifact("BetaCodePipelineBuildArtifact");
        const betaArtifactOther = new codePipeline.Artifact("BetaCodePipelineBuildArtifactOther");
        corePipeline.addStage({
            stageName: "beta",
            actions: [
                new codePipelineActions.CloudFormationCreateUpdateStackAction({
                    actionName: `beta-build`,
                    templatePath: corePipelineBuildOutput.atPath(
                        `${core.artifactId}.template.json`
                    ),
                    stackName: `CoreStack`,
                    adminPermissions: true,
                    outputFileName: `${core.artifactId}.template.yaml`,
                    output: betaArtifact,
                }),
                new codePipelineActions.CloudFormationCreateUpdateStackAction({
                    actionName: `beta-build-other-stack-`,
                    templatePath: corePipelineBuildOutput.atPath(
                        `${other.artifactId}.template.json`
                    ),
                    stackName: `OtherStack`,
                    adminPermissions: true,
                    outputFileName: `${other.artifactId}.template.yaml`,
                    output: betaArtifactOther,
                }),
            ],
        });

        const approveStage = corePipeline.addStage({ stageName: "Approve" });
        const manualApprovalAction = new codePipelineActions.ManualApprovalAction({
            actionName: "Approve",
        });
        approveStage.addAction(manualApprovalAction);



  }
}
