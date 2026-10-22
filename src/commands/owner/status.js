/**
 * Comando para gerenciar o status do perfil do bot
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  addStatusMessage,
  listStatusMessages,
  removeStatusMessage,
  updateCustomStatus,
} from "../../utils/statusRotator.js";

export default {
  name: "status",
  description: "Gerencia o status do perfil do bot",
  commands: ["status"],
  usage: `${PREFIX}status [list|add|remove|set] [mensagem]`,
  handle: async ({ args, sendReply, socket }) => {
    const action = args[0];

    if (!action) {
      throw new InvalidParameterError(
        `Use: ${PREFIX}status list (ver mensagens) | add (adicionar) | remove (remover) | set (definir manual)`
      );
    }

    switch (action.toLowerCase()) {
      case "list":
        const messages = listStatusMessages();
        const messageList = messages
          .map((msg, index) => `${index + 1}. ${msg}`)
          .join("\n");
        await sendReply(`📝 Mensagens de status:\n\n${messageList}`);
        break;

      case "add":
        const newMessage = args.slice(1).join(" ");
        if (!newMessage) {
          throw new InvalidParameterError("Forneça a mensagem para adicionar!");
        }
        addStatusMessage(newMessage);
        await sendReply(`✅ Mensagem adicionada: "${newMessage}"`);
        break;

      case "remove":
        const messageToRemove = args.slice(1).join(" ");
        if (!messageToRemove) {
          throw new InvalidParameterError("Forneça a mensagem para remover!");
        }
        removeStatusMessage(messageToRemove);
        await sendReply(`✅ Mensagem removida: "${messageToRemove}"`);
        break;

      case "set":
        const customStatus = args.slice(1).join(" ");
        if (!customStatus) {
          throw new InvalidParameterError("Forneça o status para definir!");
        }
        await updateCustomStatus(socket, customStatus);
        await sendReply(`✅ Status definido manualmente: "${customStatus}"`);
        break;

      default:
        throw new InvalidParameterError(
          `Ação inválida! Use: list, add, remove ou set`
        );
    }
  },
};
