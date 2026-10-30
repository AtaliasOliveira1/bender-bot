/**
 * Mute temporário com tempo definido
 *
 * @author Dev Gui
 */
import { BOT_LID, OWNER_LID, PREFIX } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { addRouletteMuted, getRouletteMuted } from "../../utils/database.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "mute-temp",
  description: "Silencia um usuário por um tempo determinado",
  commands: ["mute-temp", "mutar-temp"],
  usage: `${PREFIX}mute-temp @usuario <tempo> (ex: 10m, 10 minutos, 2h, 1d)`,
  handle: async ({
    args,
    remoteJid,
    replyLid,
    sendErrorReply,
    sendSuccessReply,
    getGroupMetadata,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length && !replyLid) {
      throw new InvalidParameterError(
        `Você precisa mencionar um usuário ou responder à mensagem do usuário que deseja mutar.\n\nExemplo: ${PREFIX}mute-temp @fulano 10 m`
      );
    }

    if (args.length < 2) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}mute-temp @usuario <tempo>\n` +
        `Formatos aceitos: 10m, 10 m, 10 minutos, 2h, 2 horas, 1d, 1 dia\n` +
        `Exemplo: ${PREFIX}mute-temp @fulano 10m`
      );
    }

    const userId = replyLid
      ? replyLid
      : args[0]
      ? `${onlyNumbers(args[0])}@lid`
      : null;

    const targetUserNumber = onlyNumbers(userId);

    if (OWNER_LID && userId === OWNER_LID) {
      throw new DangerError("Você não pode mutar o dono do bot!");
    }

    if (BOT_LID && userId === BOT_LID) {
      throw new DangerError("Você não pode mutar o bot.");
    }

    const groupMetadata = await getGroupMetadata();
    const isUserInGroup = groupMetadata.participants.some(
      (participant) => participant.id === userId
    );

    if (!isUserInGroup) {
      return sendErrorReply(
        `O usuário @${targetUserNumber} não está neste grupo.`,
        [userId]
      );
    }

    const isTargetAdmin = groupMetadata.participants.some(
      (participant) => participant.id === userId && participant.admin
    );

    if (isTargetAdmin) {
      throw new DangerError("Você não pode mutar um administrador.");
    }

    const memberId = userId.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const alreadyMuted = getRouletteMuted(remoteJid, memberId);

    if (alreadyMuted) {
      const expiresAt = new Date(alreadyMuted).toLocaleTimeString("pt-BR");
      return sendErrorReply(
        `O usuário @${targetUserNumber} já está silenciado até às ${expiresAt}.`,
        [userId]
      );
    }

    // Extrair tempo e unidade de forma flexível
    const timeArg = args[1];
    const timeMatch = timeArg.match(/^(\d+)([a-zA-Z]+)$/);
    const time = timeMatch ? parseInt(timeMatch[1]) : parseInt(timeArg);
    const unit = timeMatch ? timeMatch[2].toLowerCase() : (args[2]?.toLowerCase() || "m");

    if (isNaN(time) || time <= 0) {
      throw new InvalidParameterError("Tempo inválido. Use um número positivo.");
    }

    let timeInMs;

    switch (unit) {
      case "m":
      case "min":
      case "minuto":
      case "minutos":
        timeInMs = time * 60 * 1000;
        break;
      case "h":
      case "hora":
      case "horas":
        timeInMs = time * 60 * 60 * 1000;
        break;
      case "d":
      case "dia":
      case "dias":
        timeInMs = time * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new InvalidParameterError(
          `Unidade inválida. Use: m/min/minutos (minutos), h/hora/horas (horas), d/dia/dias (dias)`
        );
    }

    const expiresAt = Date.now() + timeInMs;
    addRouletteMuted(remoteJid, memberId, expiresAt);

    const formattedExpiresAt = new Date(expiresAt).toLocaleString("pt-BR");

    await sendSuccessReply(
      `@${targetUserNumber} foi mutado com sucesso!\n\n` +
      `⏰ Tempo: ${time} ${unit}\n` +
      `🕐 Liberação: ${formattedExpiresAt}`,
      [userId]
    );
  },
};
