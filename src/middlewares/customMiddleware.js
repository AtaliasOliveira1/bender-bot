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
    const { fullMessage, remoteJid } = commonFunctions;

    // Processar auto-resposta de figurinhas
    await processAutoStickerResponse(socket, remoteJid, fullMessage);
  }

  // Adicione sua lógica customizada aqui
  // Este arquivo é SEU - modifique à vontade!
}
