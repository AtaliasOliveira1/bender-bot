import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuCanvas } from "../../menu.js";

export default {
  name: "menucanvas",
  description: "Menu de canvas",
  commands: ["menucanvas", "menuedit"],
  usage: `${PREFIX}menucanvas`,
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
  }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "bender-bot.png"),
      `\n\n${menuCanvas(remoteJid)}`,
    );
  },
};
