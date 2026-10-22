import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuDownloads } from "../../menu.js";

export default {
  name: "menudownloads",
  description: "Menu de downloads",
  commands: ["menudownloads", "menudownload"],
  usage: `${PREFIX}menudownloads`,
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
  }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "bender-bot.png"),
      `\n\n${menuDownloads(remoteJid)}`,
    );
  },
};
