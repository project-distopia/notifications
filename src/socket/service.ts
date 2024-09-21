import axios from "axios";

import { Widget } from "../shared/schema";

export const getWidget = async (): Promise<Widget> => {
  const { data, status } = await axios.get(
    "https://webservice.livepix.gg/pubsub/widget/" +
      process.env.LIVEPIX_WIDGET_UUID,
    {
      headers: {
        Host: "webservice.livepix.gg",
        "sec-ch-ua":
          '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
        accept: "application/json, text/plain, */*",
        "sec-ch-ua-mobile": "?0",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "sec-ch-ua-platform": '"Windows"',
        "sec-gpc": "1",
        "accept-language": "en-US,en;q=0.9",
        origin: "https://widget.livepix.gg",
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        referer: "https://widget.livepix.gg/",
        "if-none-match": 'W/"297-vCFvZ17/Z27GTSckuxIgxEpTr/A"',
        priority: "u=1, i",
      },
    }
  );

  if (status !== 200) {
    throw new Error("Failed to get widget token");
  }

  return Widget.parse(data);
};
