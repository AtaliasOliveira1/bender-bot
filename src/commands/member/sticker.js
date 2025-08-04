const { getRandomName } = require(`${BASE_DIR}/utils`);
const fs = require("node:fs");
const { addStickerMetadata } = require(`${BASE_DIR}/services/sticker`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { PREFIX, BOT_NAME, BOT_EMOJI } = require(`${BASE_DIR}/config`);
const { exec } = require("child_process");

module.exports = {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
    userJid,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    await sendWaitReact();

    const username =
      webMessage.pushName ||
      webMessage.notifyName ||
      userJid.replace(/@s.whatsapp.net/, "");

    const metadata = {
      username: `👤 Usuario(a) ➔ ${username}\n🤖 Bot ➔`,
      botName: `${BOT_EMOJI} ${BOT_NAME}\n● https://info.loami.shop ●`,
    };

    const outputPath = getRandomName("webp");
    let outputPath2 = null;
    let stickerPath = null;
    let stickerPath2 = null;
    let inputPath = null;

    try {
      if (isImage) {
        // Baixar imagem
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            inputPath = await downloadImage(webMessage, getRandomName());
            break;
          } catch (downloadError) {
            console.error(
              `Tentativa ${attempt} de download de imagem falhou:`,
              downloadError.message
            );
            if (attempt === 3) {
              throw new Error(
                `Falha ao baixar imagem após 3 tentativas: ${downloadError.message}`
              );
            }
            await new Promise((r) => setTimeout(r, 2000 * attempt));
          }
        }

// Figurinha 1 (quadrada 512x512 com fundo transparente)
await new Promise((resolve, reject) => {
const cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba" -lossless 1 -preset default -compression_level 6 -qscale 100 -f webp "${outputPath}"`;
  exec(cmd, (error, _, stderr) => {
    if (error) {
      console.error("FFmpeg error:", stderr);
      reject(error);
    } else {
      resolve();
    }
  });
});

// Figurinha 2 (tamanho original) @ataliasloami
outputPath2 = getRandomName("webp");
await new Promise((resolve, reject) => {
  const cmd2 = `ffmpeg -i "${inputPath}" -vf "scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)'" -f webp -quality 90 "${outputPath2}"`;
  exec(cmd2, (error, _, stderr) => {
    if (error) {
      console.error("FFmpeg (original size) error:", stderr);
      reject(error);
    } else {
      resolve();
    }
  });
});

      } else {
        // Baixar vídeo
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            inputPath = await downloadVideo(webMessage, getRandomName());
            break;
          } catch (downloadError) {
            console.error(
              `Tentativa ${attempt} de download de vídeo falhou:`,
              downloadError.message
            );
            if (attempt === 3) {
              throw new Error(
                `Falha ao baixar vídeo após 3 tentativas. Problema de conexão com WhatsApp.`
              );
            }
            await new Promise((r) => setTimeout(r, 2000 * attempt));
          }
        }

        const maxDuration = 10;
        const seconds =
          webMessage.message?.videoMessage?.seconds ||
          webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage?.seconds;

        if (!seconds || seconds > maxDuration) {
          if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          return sendErrorReply(
            `O vídeo enviado tem mais de ${maxDuration} segundos! Envie um vídeo menor.`
          );
        }

        // Figurinha 1 (512x512)
        await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${inputPath}" -filter_complex "[0:v] fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba,split [a][b]; [a] palettegen=reserve_transparent=on [p]; [b][p] paletteuse" -loop 0 -vcodec libwebp -fs 0.99M "${outputPath}"`;
          exec(cmd, (error, _, stderr) => {
            if (error) {
              console.error("FFmpeg error:", stderr);
              reject(error);
            } else {
              resolve();
            }
          });
        });

        // Figurinha 2 (tamanho original) @ataliasloami
        outputPath2 = getRandomName("webp");
        await new Promise((resolve, reject) => {
          const cmd2 = `ffmpeg -y -i "${inputPath}" -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512, fps=15, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse" -f webp "${outputPath2}"`;
          exec(cmd2, (error, _, stderr) => {
            if (error) {
              console.error("FFmpeg (original size video) error:", stderr);
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }

      // Deletar input temporário
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
        inputPath = null;
      }

      if (!fs.existsSync(outputPath)) {
        throw new Error("Arquivo de saída não foi criado pelo FFmpeg");
      }

      // Adicionar metadados e enviar figurinhas
      stickerPath = await addStickerMetadata(
        await fs.promises.readFile(outputPath),
        metadata
      );

      stickerPath2 = await addStickerMetadata(
        await fs.promises.readFile(outputPath2),
        metadata
      );

      await sendSuccessReact();

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendStickerFromFile(stickerPath);
          await sendStickerFromFile(stickerPath2);
          break;
        } catch (stickerError) {
          console.error(
            `Tentativa ${attempt} de envio de sticker falhou:`,
            stickerError.message
          );
          if (attempt === 3) {
            throw new Error(
              `Falha ao enviar figurinha após 3 tentativas: ${stickerError.message}`
            );
          }
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }

      // Limpar arquivos temporários
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (fs.existsSync(outputPath2)) fs.unlinkSync(outputPath2);
      if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath);
      if (fs.existsSync(stickerPath2)) fs.unlinkSync(stickerPath2);

    } catch (error) {
      console.error("Erro detalhado no comando sticker:", error);

      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (outputPath2 && fs.existsSync(outputPath2)) fs.unlinkSync(outputPath2);
      if (stickerPath && fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath);
      if (stickerPath2 && fs.existsSync(stickerPath2)) fs.unlinkSync(stickerPath2);

      if (
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("AggregateError") ||
        error.message.includes("getaddrinfo ENOTFOUND") ||
        error.message.includes("connect ECONNREFUSED") ||
        error.message.includes("mmg.whatsapp.net")
      ) {
        throw new Error(
          `Erro de conexão ao baixar mídia do WhatsApp. Tente novamente em alguns segundos.`
        );
      }

      if (error.message.includes("FFmpeg")) {
        throw new Error(
          `Erro ao processar mídia com FFmpeg. Verifique se o arquivo não está corrompido.`
        );
      }

      throw new Error(`Erro ao processar a figurinha: ${error.message}`);
    }
  },
};
