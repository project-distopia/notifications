import WebSocket from "ws";

export const getConnection = (): Promise<WebSocket> =>
  new Promise((resolve, reject) => {
    const instance = new WebSocket("wss://pubsub.livepix.gg/ws", {
      headers: {
        Pragma: "no-cache",
        Origin: "https://widget.livepix.gg",
        "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
        "Sec-WebSocket-Key": "xeKD6U1ZGSA7UpCV4Cp6VQ==",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Upgrade: "websocket",
        "Cache-Control": "no-cache",
        "Sec-GPC": "1",
        Connection: "Upgrade",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Extensions":
          "permessage-deflate; client_max_window_bits",
      },
    });

    instance.on("open", () => {
      console.log("[WS] Connection opened");
      return resolve(instance);
    });

    instance.on("error", (err) => {
      console.log("[WS] Connection error:", err.message);
      return reject(err);
    });
  });

export const send = (connection: WebSocket, data: unknown) => {
  const dataString = JSON.stringify(data);

  connection.send(Buffer.from(dataString, "utf-8"), { binary: true });

  console.log("[WS] Sent message:", dataString);
};
