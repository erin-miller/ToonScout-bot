import "dotenv/config";
import { getScoutToken } from "./db/scoutData/scoutService.js";
import { InteractionResponseType } from "discord-interactions";
import { fileURLToPath, pathToFileURL } from "url";
import { readdirSync } from "fs";
import path from "path";

export async function DiscordRequest(endpoint, options) {
  const isProduction = process.env.NODE_ENV === "production";
  const DISCORD_TOKEN = isProduction
    ? process.env.DISCORD_TOKEN_PROD
    : process.env.DISCORD_TOKEN_DEV;
  // append endpoint to root API URL
  const url = process.env.DISCORD_API_URL + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": process.env.USER_AGENT,
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function getUser(req) {
  const { user: direct, member } = req.body;
  return direct ? direct.username : member.user.username;
}

export function getGlobalUser(req) {
  const { user: direct, member } = req.body;
  return direct ? direct.global_name : member.user.username;
}

export function getUserId(req) {
  const { user: direct, member } = req.body;
  return direct ? direct.id : member.user.id;
}

export function getToonRendition(local_toon, pose) {
  const dna = local_toon.toon.style;
  return `https://rendition.toontownrewritten.com/render/${dna}/${pose}/1024x1024.png`;
}

export async function validateUser(targetUser, req, res) {
  if (targetUser) {
    const targetToon = await getScoutToken(targetUser);
    const requestingUserId = getUserId(req);

    if (!targetToon || (targetToon.hidden && targetUser !== requestingUserId)) {
      await res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `That user has not connected to ToonScout.`,
          flags: 64,
        },
      });
      return null;
    }

    return targetToon;
  }

  return null;
}

function formatDate(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${month} ${day}, ${year} ${hours}:${formattedMinutes}`;
}

export function getModified(date) {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `Updated <t:${timestamp}:R>`;
}

export async function loadCommands(app) {
  app.commands = new Map();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const commandsPath = path.resolve(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath); // Convert to a file URL
    const command = await import(fileUrl.href); // Use the URL with import
    if ("data" in command && "execute" in command) {
      app.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
