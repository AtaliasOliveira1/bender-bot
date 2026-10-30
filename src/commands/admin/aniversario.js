import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateBirthdayGroup,
  deactivateBirthdayGroup,
  isActiveBirthdayGroup,
  addBirthday,
  removeBirthday,
  getBirthdays,
  setGroupOriginalName,
  getGroupOriginalName,
  removeGroupOriginalName,
} from "../../utils/database.js";

export default {
  name: "aniversario",
  description: "Gerencia aniversários do grupo",
  commands: ["aniversario", "birthday", "aniv"],
  usage: `${PREFIX}aniversario [on/off/add/list/remove]`,
  handle: async ({
    args,
    remoteJid,
    socket,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReply,
    isGroup,
    getGroupName,
    fullArgs,
    replyLid,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    const action = args[0]?.toLowerCase();

    if (!action) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}aniversario on/off/add/list/remove`
      );
    }

    try {
      if (action === "on") {
        if (isActiveBirthdayGroup(remoteJid)) {
          throw new WarningError("Aniversários já estão ativados neste grupo.");
        }

        const currentName = await getGroupName();
        setGroupOriginalName(remoteJid, currentName);
        activateBirthdayGroup(remoteJid);

        await sendSuccessReply(
          "Aniversários ativados! Use " +
            `${PREFIX}aniversario add <nome> <dia> <mês>` +
            " para adicionar aniversários."
        );
      } else if (action === "off") {
        if (!isActiveBirthdayGroup(remoteJid)) {
          throw new WarningError("Aniversários já estão desativados neste grupo.");
        }

        const originalName = getGroupOriginalName(remoteJid);
        const currentName = await getGroupName();

        if (originalName && originalName !== currentName) {
          await socket.groupUpdateSubject(remoteJid, originalName);
        }

        deactivateBirthdayGroup(remoteJid);
        removeGroupOriginalName(remoteJid);

        await sendSuccessReply(
          "Aniversários desativados! O nome do grupo voltou ao original."
        );
      } else if (action === "add") {
        if (!isActiveBirthdayGroup(remoteJid)) {
          throw new WarningError(
            "Ative os aniversários primeiro com " + `${PREFIX}aniversario on`
          );
        }

        const params = fullArgs.replace(/^add\s*/, "").trim().split(/\s+/);

        if (params.length < 3) {
          throw new InvalidParameterError(
            `Uso: ${PREFIX}aniversario add <nome> <dia> <mês>`
          );
        }

        const name = params[0];
        const day = parseInt(params[1]);
        const month = parseInt(params[2]);

        if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
          throw new InvalidParameterError("Dia ou mês inválidos. Use formato: DD MM");
        }

        const memberId = replyLid ? replyLid.replace(/:[0-9][0-9]|:[0-9]/g, "") : null;
        addBirthday(remoteJid, memberId, name, day, month);

        await sendSuccessReply(
          `Aniversário de ${name} adicionado: ${day}/${month}`
        );
      } else if (action === "list") {
        const birthdays = getBirthdays(remoteJid);

        if (birthdays.length === 0) {
          throw new WarningError("Nenhum aniversário cadastrado neste grupo.");
        }

        const list = birthdays
          .map((b, i) => `${i + 1}. ${b.name} - ${b.day}/${b.month}`)
          .join("\n");

        await sendSuccessReply(`Aniversários cadastrados:\n\n${list}`);
      } else if (action === "remove") {
        const index = parseInt(args[1]);

        if (isNaN(index) || index < 1) {
          throw new InvalidParameterError(
            `Uso: ${PREFIX}aniversario remove <número>`
          );
        }

        const birthdays = getBirthdays(remoteJid);

        if (index > birthdays.length) {
          throw new InvalidParameterError("Número inválido.");
        }

        const birthday = birthdays[index - 1];
        removeBirthday(remoteJid, birthday.memberId);

        await sendSuccessReply(
          `Aniversário de ${birthday.name} removido.`
        );
      } else {
        throw new InvalidParameterError(
          `Ação inválida. Use: on/off/add/list/remove`
        );
      }
    } catch (error) {
      if (
        error.message.includes("só pode ser usado") ||
        error.message.includes("já está") ||
        error.message.includes("inválido")
      ) {
        throw error;
      }

      console.error("Erro no comando aniversario:", error);

      await sendErrorReply(
        `Falha ao configurar aniversários: ${error.message}`
      );
    }
  },
};
