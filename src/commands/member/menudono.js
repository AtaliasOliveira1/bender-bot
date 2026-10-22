import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuDono } from "../../menu.js";

export default {
  name: "menudono",
  description: "Menu de comandos do dono",
  commands: ["menudono", "menuowner"],
  usage: `${PREFIX}menudono`,
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
  }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "bender-bot.png"),
      `\n\n${menuDono(remoteJid)}`,
    );
  },
};
