import { Client, GatewayIntentBits } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  createAudioResource,
} from "@discordjs/voice";

import {
  getNextMessage,
  parseNotification,
  deleteMessage,
} from "../shared/queue";

const getAlertSound = (value: number): string => {
  const alerts: { [key: number]: string } = {
    10: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/TROLLGE.mp3",
    15: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/TIO_HANK.mp3",
    30: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/KIKI_DU_YOU.mp3",
    40: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/EDMOTTA.mp3",
    50: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/QUANDALE_DINGLE_PACK.mp3",
    80: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/CHINESE_JOHN_WESLEY.mp3",
    100: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/WISE_MYSTICAL_TREE_84_VERSIONS.mp3",
    120: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/IGOY_EXPLICA_HXH.mp3",
    150: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/ISHOWSPEED_ENCONTRA_BORGES.mp3",
    500: "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/QUANDALE_DINGLE_COMPLETE_LORE.mp3",
  };

  const alertSound = alerts[value];

  if (alertSound) {
    return alertSound;
  }

  return "https://distopia-live-notifications.s3.us-east-1.amazonaws.com/JOHN_PORK.mp3";
};

export const HandleDiscord = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.on("ready", async () => {
    console.log(`[Discord] Logged in!`);

    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID!);

    if (!guild) {
      throw new Error("Guild not found");
    }

    const connection = joinVoiceChannel({
      adapterCreator: guild.voiceAdapterCreator,
      channelId: process.env.DISCORD_CHANNEL_ID!,
      guildId: process.env.DISCORD_GUILD_ID!,
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Ready, () => {
      const getNextNotification = async () => {
        try {
          if (player.state.status !== AudioPlayerStatus.Idle) {
            console.log("[Discord] Player is busy");
            return;
          }

          const message = await getNextMessage();

          if (!message) {
            return;
          }

          const notification = parseNotification(message);

          const tts = notification.message.payload.data.config.textToSpeechUrl;
          const value = notification.message.payload.data.data.amount.value;

          const alert = createAudioResource(getAlertSound(value));

          player.play(alert);

          await new Promise<void>((resolve) => {
            player.once(AudioPlayerStatus.Idle, resolve);
          });

          const resource = createAudioResource(tts);

          player.play(resource);

          await new Promise<void>((resolve) => {
            player.once(AudioPlayerStatus.Idle, resolve);
          });

          await deleteMessage(message);
        } catch (err) {
          console.error("[Discord] Error playing notification:", err.message);
        } finally {
          setTimeout(getNextNotification, 1000);
        }
      };

      getNextNotification();
    });
  });

  client.login(process.env.DISCORD_TOKEN);
};
