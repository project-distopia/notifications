import { getWidget } from "./service";
import { getUnixTime } from "../shared/util";
import { Notification, Ping } from "../shared/schema";

export const getAuthenticationMessage = async () => {
  const widget = await getWidget();

  return {
    message: {
      type: 1,
      event: "auth",
      payload: widget.token,
      time: getUnixTime(),
    },
  };
};

export const getSubscribeWidgetMessage = () => ({
  message: {
    type: 1,
    event: "subscribe",
    payload: "widget:" + process.env.LIVEPIX_WIDGET_UUID,
    time: getUnixTime(),
  },
});

export const getSubscribeUserWidgetsNotificationMessage = () => ({
  message: {
    type: 1,
    event: "subscribe",
    payload: "user:widgets:notification:" + process.env.LIVEPIX_WIDGET_ID,
    time: getUnixTime(),
  },
});

export const getSubscribeUserWidgetsMessage = () => ({
  message: {
    type: 1,
    event: "subscribe",
    payload: "user:widgets:" + process.env.LIVEPIX_WIDGET_ID,
    time: getUnixTime(),
  },
});

export const getConfirmationMessage = (notification: Notification) => ({
  message: {
    type: 1,
    event: "confirmation",
    payload: notification.id,
    time: getUnixTime(),
  },
});

export const getPongMessage = (ping: Ping) => ({
  message: {
    type: 1,
    event: "pong",
    payload: ping.message.payload,
    time: getUnixTime(),
  },
});
