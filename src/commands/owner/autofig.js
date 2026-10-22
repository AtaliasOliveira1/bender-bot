/**
 * Comando para gerenciar as palavras-chave de auto-resposta de figurinhas
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  addKeyword,
  listKeywords,
  removeKeyword,
} from "../../utils/autoStickerResponse.js";
import { AUTO_STICKER_RESPONSE_ENABLED } from "../../config.js";

export default {
  name: "autofig",
  description: "Gerencia as palavras-chave de auto-resposta de figurinhas",
  commands: ["autofig", "autosticker"],
  usage: `${PREFIX}autofig [list|add|remove|on|off] [palavra]`,
  handle: async ({ args, sendReply }) => {
    const action = args[0];

    if (!action) {
      throw new InvalidParameterError(
        `Use: ${PREFIX}autofig list (ver palavras) | add (adicionar) | remove (remover) | on (ativar) | off (desativar)`
      );
    }

    switch (action.toLowerCase()) {
      case "list":
        const keywords = listKeywords();
        const keywordList = keywords
          .map((kw, index) => `${index + 1}. ${kw}`)
          .join("\n");
        const status = AUTO_STICKER_RESPONSE_ENABLED ? "✅ Ativado" : "❌ Desativado";
        await sendReply(`📝 Palavras-chave:\n\n${keywordList}\n\n📊 Status: ${status}`);
        break;

      case "add":
        const newKeyword = args.slice(1).join(" ");
        if (!newKeyword) {
          throw new InvalidParameterError("Forneça a palavra para adicionar!");
        }
        if (addKeyword(newKeyword)) {
          await sendReply(`✅ Palavra adicionada: "${newKeyword}"`);
        } else {
          await sendReply(`⚠️ Palavra já existe: "${newKeyword}"`);
        }
        break;

      case "remove":
        const keywordToRemove = args.slice(1).join(" ");
        if (!keywordToRemove) {
          throw new InvalidParameterError("Forneça a palavra para remover!");
        }
        if (removeKeyword(keywordToRemove)) {
          await sendReply(`✅ Palavra removida: "${keywordToRemove}"`);
        } else {
          await sendReply(`⚠️ Palavra não encontrada: "${keywordToRemove}"`);
        }
        break;

      case "on":
        await sendReply(`⚠️ Para ativar/desativar, edite o arquivo src/config.js e mude AUTO_STICKER_RESPONSE_ENABLED para true ou false`);
        break;

      case "off":
        await sendReply(`⚠️ Para ativar/desativar, edite o arquivo src/config.js e mude AUTO_STICKER_RESPONSE_ENABLED para true ou false`);
        break;

      default:
        throw new InvalidParameterError(
          `Ação inválida! Use: list, add, remove, on ou off`
        );
    }
  },
};
