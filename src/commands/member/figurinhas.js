/**
 * Envia figurinhas aleatórias
 * Baseado no comando do bot antigo
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "figurinhas",
  description: "Envia figurinhas aleatórias. Use um número para definir a quantidade (máximo 10).",
  commands: ["figurinhas", "sendstickers", "figurinha", "sendsticker", "fig"],
  usage: `${PREFIX}figurinhas [quantidade]`,
  handle: async ({ args, sendReply, socket, remoteJid, sendWaitReact, sendSuccessReact }) => {
    let quantidade = 1;

    if (args.length > 0) {
      const parsed = parseInt(args[0]);
      if (!isNaN(parsed)) {
        quantidade = Math.min(Math.max(1, parsed), 10);
      }
    }

    await sendWaitReact();

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const totalFigurinhas = 5532;

    await sendReply(`Enviando ${quantidade} figurinha(s)...`);

    for (let i = 0; i < quantidade; i++) {
      const num = Math.floor(Math.random() * totalFigurinhas);
      const repoIndex = Math.floor(num / 1000) + 1;
      const url = `https://raw.githubusercontent.com/AtaliasOliveira1/stickers-${repoIndex}/main/fig%20(${num}).webp`;

      try {
        await socket.sendMessage(remoteJid, { sticker: { url } });
        // Delay de 2 segundos entre cada figurinha para evitar spam
        await delay(2000);
      } catch (err) {
        await sendReply("Erro ao enviar figurinha.");
        break;
      }
    }

    await sendSuccessReact();
  },
};
