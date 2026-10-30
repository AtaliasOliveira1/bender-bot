/**
 * Desenvolvido por: Dev Gui
 * Implementação dos metadados feita por: MRX
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createSticker } from "../../services/sticker.js";
import {
  getStickerAuthor,
  addPendingStickerAuthorRegistration,
} from "../../utils/database.js";

export default {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async (paramsHandler) => {
    const {
      isImage,
      isVideo,
      sendWaitReact,
      sendSuccessReact,
      sendReply,
      userLid,
      remoteJid,
      webMessage,
    } = paramsHandler;

    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    const userId = userLid.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const existingAuthor = getStickerAuthor(userId);

    if (!existingAuthor) {
      await sendReply(
        `Opa! É sua primeira vez criando figurinha por aqui. Como você quer assinar suas figurinhas? Responda com 1 para usar seu nome do WhatsApp ou digite o nome/apelido que quer usar como autor:`
      );

      addPendingStickerAuthorRegistration(userId, remoteJid);

      throw new InvalidParameterError(
        `Aguardando seu registro de autor. Por favor, responda à mensagem acima.`
      );
    }

    await sendWaitReact();
    await createSticker(paramsHandler, existingAuthor);
    await sendSuccessReact();
  },
};
