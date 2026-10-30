import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import {
  canUseRoulette,
  setRouletteLastUsed,
  addRouletteMuted,
} from "../../utils/database.js";

export default {
  name: "roleta",
  description: "Escolhe aleatoriamente uma pessoa do grupo para silenciar por 5 minutos",
  commands: ["roleta", "roleta-russa", "roulette"],
  usage: `${PREFIX}roleta`,
  handle: async ({
    remoteJid,
    socket,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReply,
    isGroup,
    getGroupParticipants,
    sendReply,
    userLid,
    getGroupAdmins,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    const userId = userLid.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const admins = await getGroupAdmins();
    const isAdmin = admins.includes(userLid);

    if (!isAdmin && !canUseRoulette(userId)) {
      throw new WarningError(
        "Você já usou a roleta-russa hoje. Tente novamente amanhã!"
      );
    }

    try {
      await sendWaitReply("Girando a roleta...");

      const participants = await getGroupParticipants();
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedParticipant = participants[randomIndex];
      const selectedJid = selectedParticipant.id;

      const fiveMinutesInMs = 5 * 60 * 1000;
      const expiresAt = Date.now() + fiveMinutesInMs;

      const memberId = selectedJid.replace(/:[0-9][0-9]|:[0-9]/g, "");
      addRouletteMuted(remoteJid, memberId, expiresAt);

      if (!isAdmin) {
        setRouletteLastUsed(userId);
      }

      const formattedExpiresAt = new Date(expiresAt).toLocaleTimeString("pt-BR");

      await sendReply(
        `🔫 *ROULETTE RUSSA* 🔫\n\n` +
          `A vítima foi: @${memberId}\n\n` +
          `⏰ Silenciado por 5 minutos!\n` +
          `🕐 Liberação às ${formattedExpiresAt}\n\n` +
          `Todas as mensagens enviadas por essa pessoa serão apagadas automaticamente.`,
        [selectedJid]
      );
    } catch (error) {
      if (error.message.includes("só pode ser usado") || error.message.includes("já usou")) {
        throw error;
      }

      await sendErrorReply("Falha ao executar roleta-russa. Tente novamente.");
    }
  },
};
