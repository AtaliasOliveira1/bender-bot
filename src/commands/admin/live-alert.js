import { PREFIX } from "../../config.js";
import {
  addLiveAlertGroup,
  removeLiveAlertGroup,
  isActiveLiveAlertGroup,
} from "../../utils/database.js";

export default {
  name: "live-alert",
  description: "Ativa/desativa alertas de live no grupo",
  commands: ["live-alert", "alerta-live"],
  usage: `${PREFIX}live-alert on | ${PREFIX}live-alert off`,
  handle: async ({ sendReply, args, remoteJid, sendSuccessReply, sendErrorReply }) => {
    if (!args[0]) {
      await sendReply(
        `*Uso:* ${PREFIX}live-alert on | ${PREFIX}live-alert off\n\n` +
          `*on* - Ativa alertas de live neste grupo\n` +
          `*off* - Desativa alertas de live neste grupo`
      );
      return;
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      if (isActiveLiveAlertGroup(remoteJid)) {
        await sendReply("⚠️ Os alertas de live já estão ativados neste grupo!");
        return;
      }

      addLiveAlertGroup(remoteJid);
      await sendSuccessReply(
        "✅ Alertas de live ativados com sucesso!\n\n" +
          "Este grupo agora receberá notificações quando houver alertas de live."
      );
    } else if (action === "off") {
      if (!isActiveLiveAlertGroup(remoteJid)) {
        await sendReply("⚠️ Os alertas de live já estão desativados neste grupo!");
        return;
      }

      removeLiveAlertGroup(remoteJid);
      await sendSuccessReply(
        "✅ Alertas de live desativados com sucesso!\n\n" +
          "Este grupo não receberá mais notificações de alertas de live."
      );
    } else {
      await sendErrorReply(
        "❌ Opção inválida! Use `on` ou `off`.\n\n" +
          `Exemplo: ${PREFIX}live-alert on`
      );
    }
  },
};
