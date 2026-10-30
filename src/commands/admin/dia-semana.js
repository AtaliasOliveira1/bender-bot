import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import {
  activateWeekdayGroup,
  deactivateWeekdayGroup,
  isActiveWeekdayGroup,
  setGroupOriginalName,
  getGroupOriginalName,
  removeGroupOriginalName,
} from "../../utils/database.js";

export default {
  name: "dia-semana",
  description: "Ativa/desativa o dia da semana no nome do grupo",
  commands: ["dia-semana", "weekday", "dia"],
  usage: `${PREFIX}dia-semana [on/off]`,
  handle: async ({
    args,
    remoteJid,
    socket,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReply,
    isGroup,
    getGroupName,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    const action = args[0]?.toLowerCase();

    if (!action || (action !== "on" && action !== "off")) {
      throw new WarningError(
        `Uso: ${PREFIX}dia-semana on para ativar ou ${PREFIX}dia-semana off para desativar.`
      );
    }

    try {
      const currentName = await getGroupName();

      if (action === "on") {
        if (isActiveWeekdayGroup(remoteJid)) {
          throw new WarningError("O dia da semana já está ativado neste grupo.");
        }

        setGroupOriginalName(remoteJid, currentName);
        activateWeekdayGroup(remoteJid);

        await sendSuccessReply(
          "Dia da semana ativado! O nome do grupo será atualizado diariamente com o dia da semana."
        );
      } else {
        if (!isActiveWeekdayGroup(remoteJid)) {
          throw new WarningError("O dia da semana já está desativado neste grupo.");
        }

        const originalName = getGroupOriginalName(remoteJid);

        if (originalName && originalName !== currentName) {
          await socket.groupUpdateSubject(remoteJid, originalName);
        }

        deactivateWeekdayGroup(remoteJid);
        removeGroupOriginalName(remoteJid);

        await sendSuccessReply(
          "Dia da semana desativado! O nome do grupo voltou ao original."
        );
      }
    } catch (error) {
      if (error.message.includes("só pode ser usado") || error.message.includes("já está")) {
        throw error;
      }

      console.error("Erro no comando dia-semana:", error);

      await sendErrorReply(
        `Falha ao configurar dia da semana: ${error.message}`
      );
    }
  },
};
