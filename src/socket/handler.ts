import { getConnection, send } from "./socket";
import {
  getAuthenticationMessage,
  getSubscribeWidgetMessage,
  getSubscribeUserWidgetsNotificationMessage,
  getSubscribeUserWidgetsMessage,
  getConfirmationMessage,
  getPongMessage,
} from "./message";
import { GenericEvent, Notification, Ping } from "../shared/schema";
import { publishNotification } from "../shared/queue";

export const HandleSocket = async () => {
  const connection = await getConnection();

  const authenticationMessage = await getAuthenticationMessage();
  const subscribeWidgetMessage = getSubscribeWidgetMessage();
  const subscribeUserWidgetsNotificationMessage =
    getSubscribeUserWidgetsNotificationMessage();
  const subscribeUserWidgetsMessage = getSubscribeUserWidgetsMessage();

  send(connection, authenticationMessage);
  send(connection, subscribeWidgetMessage);
  send(connection, subscribeUserWidgetsNotificationMessage);
  send(connection, subscribeUserWidgetsMessage);

  connection.on("close", () => {
    console.log("[WS] Disconnected from the server");
    process.exit(1);
  });

  connection.on("message", async (buffer) => {
    const dataString = buffer.toString("utf-8");

    console.log("[WS] Received message:", dataString);

    const data: GenericEvent = JSON.parse(dataString);

    switch (data.message.event) {
      case "notification:show":
        const notification = Notification.parse(data);

        if (notification.message.payload.data.config.textToSpeechUrl) {
          await publishNotification(notification);
        }

        if (notification.id) {
          const confirmationMessage = getConfirmationMessage(notification);
          send(connection, confirmationMessage);
        }

        break;
      case "ping":
        const ping = Ping.parse(data);

        if (ping.message.payload !== 0) {
          if (ping.message.payload % 20 === 0) {
            const authenticationMessage = await getAuthenticationMessage();
            send(connection, authenticationMessage);
          }
        }

        send(connection, getPongMessage(ping));
        break;
      default:
        break;
    }
  });
};
