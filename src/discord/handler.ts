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

const ALERT = "https://dashboard.livepix.gg/sounds/notification.ogg";

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

          if (!tts) {
            return;
          }

          const alert = createAudioResource(ALERT, { inlineVolume: true });

          if (alert.volume) {
            console.log("[Discord] Setting alert volume to 0.5");

            alert.volume.setVolume(0.5);
          }

          player.play(alert);

          await new Promise<void>((resolve) => {
            player.once(AudioPlayerStatus.Idle, resolve);
          });

          const resource = createAudioResource(tts, { inlineVolume: true });

          if (resource.volume) {
            console.log("[Discord] Setting TTS volume to 0.5");

            resource.volume.setVolume(0.5);
          }

          player.play(resource);

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
