import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export interface SqsConstructProps {
  queueName: string;
  createDlq?: boolean;
  fifo?: boolean;
}

export class SqsConstruct extends Construct {
  readonly queue: sqs.Queue;

  constructor(scope: Stack, props: SqsConstructProps) {
    const { queueName, createDlq = false, fifo = false } = props;

    const queueNameFormatted = fifo ? `${queueName}.fifo` : queueName;
    const dlqNameFormatted = fifo
      ? `${queueName}-dlq.fifo`
      : `${queueName}-dlq`;
    const idFormatted = fifo ? `${queueName}-fifo` : queueName;

    super(scope, `${idFormatted}-construct`);

    this.queue = new sqs.Queue(this, idFormatted, {
      queueName: queueNameFormatted,
      fifo,
      contentBasedDeduplication: fifo ? true : undefined,
      visibilityTimeout: cdk.Duration.seconds(300),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: createDlq
        ? {
            maxReceiveCount: 2,
            queue: new sqs.Queue(this, `${idFormatted}-dlq`, {
              visibilityTimeout: cdk.Duration.seconds(300),
              fifo,
              queueName: dlqNameFormatted,
              encryption: sqs.QueueEncryption.SQS_MANAGED,
            }),
          }
        : undefined,
    });

    new cdk.CfnOutput(scope, `queue-${idFormatted}-output-id`, {
      value: this.queue.queueArn,
      exportName: `${scope.stackName}::queue::${idFormatted}`,
    });
  }
}
