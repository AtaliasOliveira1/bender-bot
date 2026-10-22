/**
 * Comando para gerenciar o autofig no grupo (apenas admin)
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  disableAutoStickerForGroup,
  enableAutoStickerForGroup,
  isAutoStickerEnabledForGroup,
} from "../../utils/autoStickerConfig.js";

export default {
  name: "autofiggrupo",
  description: "Ativa ou desativa o autofig no grupo atual",
  commands: ["autofiggrupo", "autostickergroup"],
  usage: `${PREFIX}autofiggrupo [on|off]`,
  handle: async ({ args, sendReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new InvalidParameterError("Este comando só pode ser usado em grupos!");
    }

    const action = args[0];

    if (!action) {
      const isEnabled = isAutoStickerEnabledForGroup(remoteJid);
      const status = isEnabled ? "✅ Ativado" : "❌ Desativado";
      await sendReply(`📊 Status do autofig neste grupo: ${status}\n\nUse ${PREFIX}autofiggrupo on para ativar ou off para desativar`);
      return;
    }

    switch (action.toLowerCase()) {
      case "on":
        if (enableAutoStickerForGroup(remoteJid)) {
          await sendReply("✅ Autofig ativado neste grupo!");
        } else {
          await sendReply("❌ Erro ao ativar autofig neste grupo.");
        }
        break;

      case "off":
        if (disableAutoStickerForGroup(remoteJid)) {
          await sendReply("✅ Autofig desativado neste grupo!");
        } else {
          await sendReply("❌ Erro ao desativar autofig neste grupo.");
        }
        break;

      default:
        throw new InvalidParameterError(
          `Ação inválida! Use: on (ativar) ou off (desativar)`
        );
    }
  },
};
