import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  getStickerAuthor,
  setStickerAuthor,
} from "../../utils/database.js";

export default {
  name: "mudar-autor",
  description: "Altera o nome do autor das suas figurinhas",
  commands: ["mudar-autor", "change-author", "autor"],
  usage: `${PREFIX}mudar-autor <novo nome> ou 1 para usar nome do WhatsApp`,
  handle: async ({
    args,
    sendSuccessReply,
    sendErrorReply,
    userLid,
    fullArgs,
    webMessage,
  }) => {
    const userId = userLid.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const currentAuthor = getStickerAuthor(userId);

    if (!currentAuthor) {
      throw new WarningError(
        "Você ainda não tem um autor registrado. Use o comando de figurinha pela primeira vez para se registrar."
      );
    }

    if (!fullArgs) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}mudar-autor <novo nome> ou ${PREFIX}mudar-autor 1`
      );
    }

    let newAuthor = null;

    if (fullArgs.trim() === "1") {
      const userName = webMessage?.pushName || webMessage?.notifyName || userId;
      newAuthor = userName;
    } else {
      newAuthor = fullArgs.trim();
    }

    if (!newAuthor || newAuthor.length < 2) {
      throw new InvalidParameterError("O nome deve ter pelo menos 2 caracteres.");
    }

    if (newAuthor.length > 30) {
      throw new InvalidParameterError("O nome não pode ter mais de 30 caracteres.");
    }

    setStickerAuthor(userId, newAuthor);

    await sendSuccessReply(
      `Nome do autor alterado com sucesso!\n\n` +
      `Antigo: ${currentAuthor}\n` +
      `Novo: ${newAuthor}`
    );
  },
};
