import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuIA } from "../../menu.js";

export default {
  name: "menuia",
  description: "Menu de IA",
  commands: ["menuia", "menuai"],
  usage: `${PREFIX}menuia`,
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
  }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "bender-bot.png"),
      `\n\n${menuIA(remoteJid)}`,
    );
  },
};
