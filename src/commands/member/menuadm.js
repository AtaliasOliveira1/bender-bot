import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuAdmin } from "../../menu.js";

export default {
  name: "menuadm",
  description: "Menu de comandos de admin",
  commands: ["menuadm", "menuadmin"],
  usage: `${PREFIX}menuadm`,
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
  }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "bender-bot.png"),
      `\n\n${menuAdmin(remoteJid)}`,
    );
  },
};
