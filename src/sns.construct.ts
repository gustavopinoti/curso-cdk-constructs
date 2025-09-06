import { CfnOutput, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";

export interface SnsConstructProps {
  topicName: string;
  displayName: string;
  fifo?: boolean;
}

export class SnsConstruct extends Construct {
  readonly topic: sns.Topic;

  constructor(scope: Stack, props: SnsConstructProps) {
    const { topicName, displayName, fifo = false } = props;

    super(scope, `${topicName}-construct`);

    this.topic = new sns.Topic(this, topicName, {
      topicName,
      displayName,
      fifo,
      contentBasedDeduplication: fifo ? true : undefined,
    });

    new CfnOutput(scope, `topic-${topicName}-output-id`, {
      value: this.topic.topicArn,
      exportName: `${scope.stackName}::topic::${topicName}`,
    });
  }
}
