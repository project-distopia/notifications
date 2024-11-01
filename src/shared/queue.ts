import {
  SQSClient,
  SendMessageCommand,
  Message,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import { Notification } from "./schema";

const sqs = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const publishNotification = async (
  notification: Notification,
  groupId: string
): Promise<void> => {
  const command = new SendMessageCommand({
    MessageBody: Buffer.from(JSON.stringify(notification)).toString("base64"),
    MessageDeduplicationId: notification.id,
    MessageGroupId: groupId,
    QueueUrl: process.env.AWS_QUEUE_URL,
  });

  const message = await sqs.send(command);

  console.log("[SQS] Published message:", message.MessageId);
};

export const getNextMessage = async (): Promise<Message | undefined> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.AWS_QUEUE_URL,
  });

  const response = await sqs.send(command);

  if (response.Messages?.length) {
    const message = response.Messages[0];

    console.log("[SQS] Received message:", message.MessageId);

    return message;
  }
};

export const parseNotification = (message: Message): Notification => {
  const body = Buffer.from(message.Body!, "base64").toString("utf-8");
  const notification = Notification.parse(JSON.parse(body));

  console.log("[SQS] Parsed message into notification:", body);

  return notification;
};

export const deleteMessage = async (message: Message): Promise<void> => {
  const command = new DeleteMessageCommand({
    QueueUrl: process.env.AWS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle!,
  });

  await sqs.send(command);

  console.log("[SQS] Deleted message:", message.MessageId);
};
