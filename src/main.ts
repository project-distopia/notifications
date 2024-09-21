import "dotenv/config";

import { HandleDiscord } from "./discord/handler";
import { HandleSocket } from "./socket/handler";

Promise.resolve().then(HandleDiscord);
Promise.resolve().then(HandleSocket);
