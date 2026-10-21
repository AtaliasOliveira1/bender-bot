import express from "express";
import { infoLog, errorLog, successLog } from "../utils/logger.js";
import { getLiveAlertGroups, addLiveAlertGroup, removeLiveAlertGroup } from "../utils/database.js";

let app = null;
let server = null;
let socketInstance = null;

export function startWebhookServer(socket) {
  if (server) {
    infoLog("Servidor webhook já está rodando");
    return;
  }

  socketInstance = socket;
  app = express();
  app.use(express.json());

  // Rota para alerta de live
  app.post("/enviar-alerta-live", async (req, res) => {
    try {
      const { title, description, username } = req.body;

      if (!title || !username) {
        return res.status(400).json({
          success: false,
          error: "Campos 'title' e 'username' são obrigatórios",
        });
      }

      const groups = getLiveAlertGroups();

      if (groups.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Nenhum grupo configurado para receber alertas",
        });
      }

      //const mensagem = `🚨 *Alerta de Live!*\n\nO criador *${username}* acabou de iniciar a transmissão!\n📝 ${title}`;
      const mensagem = `🔴 *AO VIVO NO TIKTOK!*\n\n👤 *Perfil:* ${username}\n📌 *Título:* ${title}\n\nCorre lá para assistir! 🚀`;

      let successCount = 0;
      let errorCount = 0;

      for (const groupId of groups) {
        try {
          await socketInstance.sendMessage(groupId, { text: mensagem });
          successCount++;
        } catch (error) {
          errorLog(`Erro ao enviar para grupo ${groupId}:`, error);
          errorCount++;
        }
      }

      infoLog(
        `Alerta de live enviado: ${successCount} grupos com sucesso, ${errorCount} com erro`
      );

      return res.status(200).json({
        success: true,
        message: `Mensagem enviada para ${successCount} grupos`,
        successCount,
        errorCount,
      });
    } catch (error) {
      errorLog("Erro ao processar webhook:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Rota de health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "Bender Bot Webhook" });
  });

  const PORT = process.env.WEBHOOK_PORT || 3555;
  server = app.listen(PORT, () => {
    successLog(`Servidor webhook rodando na porta ${PORT}`);
    infoLog(`Endpoints disponíveis:`);
    infoLog(`  POST /enviar-alerta-live - Recebe alertas de live`);
    infoLog(`  GET /health - Health check`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      errorLog(`Porta ${PORT} já está em uso`);
    } else {
      errorLog("Erro ao iniciar servidor webhook:", error);
    }
  });
}

export function stopWebhookServer() {
  if (server) {
    server.close(() => {
      infoLog("Servidor webhook encerrado");
    });
    server = null;
    app = null;
    socketInstance = null;
  }
}
