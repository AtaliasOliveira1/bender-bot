/**
 * Middleware customizado para adicionar lógica personalizada
 * sem modificar os arquivos principais do bot.
 *
 * Este middleware é chamado em dois momentos:
 * 1. Antes de processar qualquer mensagem (type: "message")
 * 2. Antes de processar eventos de participantes add/remove (type: "participant")
 *
 * @param {CustomMiddlewareProps} params - Parâmetros do middleware
 *
 * Para exemplos de uso, consulte:
 * - README.md (seção "Custom Middleware")
 *
 * @author Dev Gui
 */
import { processAutoStickerResponse } from "../utils/autoStickerResponse.js";
import {
  getPendingStickerAuthorRegistration,
  setStickerAuthor,
  removePendingStickerAuthorRegistration,
  getRouletteMuted,
} from "../utils/database.js";
import { getUserName } from "../utils/index.js";

export async function customMiddleware({
  socket,
  webMessage,
  type,
  commonFunctions,
  action,
  data,
}) {
  // Auto-resposta com figurinhas baseada em palavras-chave
  if (type === "message" && commonFunctions) {
    const { fullMessage, remoteJid, userLid, sendReply } = commonFunctions;

    // Processar auto-resposta de figurinhas
    await processAutoStickerResponse(socket, remoteJid, fullMessage);

    // Processar registro de autor de figurinha
    const userId = userLid.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const pendingRegistration = getPendingStickerAuthorRegistration(userId);

    if (pendingRegistration && pendingRegistration.remoteJid === remoteJid) {
      let authorName = null;

      if (fullMessage.trim() === "1") {
        authorName = getUserName(webMessage, userLid);
      } else {
        authorName = fullMessage.trim();
      }

      if (authorName) {
        setStickerAuthor(userId, authorName);
        removePendingStickerAuthorRegistration(userId);

        await sendReply(
          `✅ Registro concluído! Suas figurinhas agora serão assinadas como: ${authorName}`
        );
      }
    }

    // Processar roleta-russa: deletar mensagens de usuários silenciados
    const rouletteMuted = getRouletteMuted(remoteJid, userId);

    if (rouletteMuted) {
      try {
        const { id, remoteJid, participant } = webMessage.key;

        const deleteKey = {
          remoteJid,
          fromMe: false,
          id,
          participant,
        };

        await socket.sendMessage(remoteJid, { delete: deleteKey });
      } catch (error) {
        console.error("Erro ao deletar mensagem de roleta-russa:", error.message);
      }
    }
  }

  // Adicione sua lógica customizada aqui
  // Este arquivo é SEU - modifique à vontade!
}
