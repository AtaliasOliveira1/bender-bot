/**
 * Comando para listar as palavras-chave de auto-resposta de figurinhas
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { listKeywords } from "../../utils/autoStickerResponse.js";
import { isAutoStickerEnabledForGroup } from "../../utils/autoStickerConfig.js";

export default {
  name: "palavrasfig",
  description: "Lista as palavras-chave que ativam auto-resposta de figurinhas",
  commands: ["palavrasfig", "keywordsfig", "palavrasfigurinhas"],
  usage: `${PREFIX}palavrasfig`,
  handle: async ({ sendReply, remoteJid, isGroup }) => {
    const keywords = listKeywords();
    const keywordList = keywords
      .map((kw, index) => `${index + 1}. ${kw}`)
      .join("\n");

    let statusText = "";
    if (isGroup) {
      const isEnabled = isAutoStickerEnabledForGroup(remoteJid);
      statusText = `\n📊 Status neste grupo: ${isEnabled ? "✅ Ativado" : "❌ Desativado"}`;
    }

    await sendReply(`📝 Palavras-chave que ativam figurinhas automáticas:\n\n${keywordList}${statusText}\n\n💡 Ao digitar essas palavras, o bot envia uma figurinha aleatória!`);
  },
};
