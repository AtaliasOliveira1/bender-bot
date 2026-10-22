/**
 * Sistema de auto-resposta com figurinhas
 * Detecta palavras-chave e envia figurinhas aleatórias
 *
 * @author Dev Gui
 */
import { AUTO_STICKER_RESPONSE_ENABLED } from "../config.js";
import { isAutoStickerEnabledForGroup } from "./autoStickerConfig.js";

const totalFigurinhas = 5532;

/**
 * Palavras-chave que ativam a resposta automática
 */
const KEYWORDS = [
  "fig",
  "figurinha",
  "figurinhas",
  "sticker",
  "stickers",
  "bom dia",
  "boa tarde",
  "boa noite",
];

/**
 * Rastreamento de cooldown por grupo para evitar spam
 */
const cooldowns = new Map();
const COOLDOWN_TIME = 60000; // 1 minuto em milissegundos

/**
 * Verifica se uma mensagem contém alguma palavra-chave
 */
export function containsKeyword(text) {
  if (!text) return false;

  const lowerText = text.toLowerCase();
  return KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Verifica se o grupo está em cooldown
 */
export function isOnCooldown(groupJid) {
  const lastSent = cooldowns.get(groupJid);
  if (!lastSent) return false;

  const now = Date.now();
  return (now - lastSent) < COOLDOWN_TIME;
}

/**
 * Define o cooldown para um grupo
 */
export function setCooldown(groupJid) {
  cooldowns.set(groupJid, Date.now());
}

/**
 * Envia uma figurinha aleatória
 */
export async function sendRandomSticker(socket, remoteJid) {
  const num = Math.floor(Math.random() * totalFigurinhas);
  const repoIndex = Math.floor(num / 1000) + 1;
  const url = `https://raw.githubusercontent.com/AtaliasOliveira1/stickers-${repoIndex}/main/fig%20(${num}).webp`;

  try {
    await socket.sendMessage(remoteJid, { sticker: { url } });
    return true;
  } catch (error) {
    console.error("Erro ao enviar figurinha automática:", error);
    return false;
  }
}

/**
 * Processa a mensagem e envia figurinha se necessário
 */
export async function processAutoStickerResponse(socket, remoteJid, text) {
  // Verificar se está habilitado na configuração global
  if (!AUTO_STICKER_RESPONSE_ENABLED) {
    return false;
  }

  // Não responder em chats privados (apenas grupos)
  if (!remoteJid.endsWith("@g.us")) {
    return false;
  }

  // Verificar se está habilitado para este grupo específico
  if (!isAutoStickerEnabledForGroup(remoteJid)) {
    return false;
  }

  // Verificar cooldown
  if (isOnCooldown(remoteJid)) {
    return false;
  }

  // Verificar se contém palavra-chave
  if (!containsKeyword(text)) {
    return false;
  }

  // Enviar figurinha
  const success = await sendRandomSticker(socket, remoteJid);

  if (success) {
    setCooldown(remoteJid);
  }

  return success;
}

/**
 * Adiciona uma nova palavra-chave
 */
export function addKeyword(keyword) {
  if (!KEYWORDS.includes(keyword.toLowerCase())) {
    KEYWORDS.push(keyword.toLowerCase());
    return true;
  }
  return false;
}

/**
 * Remove uma palavra-chave
 */
export function removeKeyword(keyword) {
  const index = KEYWORDS.indexOf(keyword.toLowerCase());
  if (index > -1) {
    KEYWORDS.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Lista todas as palavras-chave
 */
export function listKeywords() {
  return [...KEYWORDS];
}
