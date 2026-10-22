/**
 * Módulo de rotação automática de status do perfil
 *
 * @author Dev Gui
 */
import { PREFIX } from "../config.js";
import { infoLog, successLog, warningLog } from "./logger.js";

/**
 * Lista de frases para o status do bot
 */
const STATUS_MESSAGES = [
  "Conectado ✅",
  "Lendo conversas...",
  "Veja o que posso fazer em " + PREFIX + "menu",
  "Online e pronto para ajudar! 🤖",
  "Respondendo em instantes ⚡",
  "Seu assistente virtual 24/7",
  "Use " + PREFIX + "menu para ver meus comandos",
  "Sempre à disposição! 💪",
  "Pronto para ajudar o grupo 👥",
  "Aguardando seus comandos...",
  getOnlineSinceFormat,
];

let currentIndex = 0;
let statusInterval = null;
let onlineSince = null;

/**
 * Formata a data atual para o status
 */
function getOnlineSinceFormat() {
  if (!onlineSince) {
    onlineSince = new Date();
  }
  const date = onlineSince.toLocaleDateString('pt-BR');
  const time = onlineSince.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `Online desde ${date} às ${time}`;
}

/**
 * Define a data/hora em que o bot ficou online
 */
export function setOnlineSince() {
  onlineSince = new Date();
}

/**
 * Obtém o próximo status da lista
 */
function getNextStatus() {
  const status = STATUS_MESSAGES[currentIndex];
  currentIndex = (currentIndex + 1) % STATUS_MESSAGES.length;

  // Se o status for uma função, executa ela (ex: getOnlineSinceFormat)
  if (typeof status === 'function') {
    return status();
  }

  return status;
}

/**
 * Obtém um status aleatório
 */
function getRandomStatus() {
  const randomIndex = Math.floor(Math.random() * STATUS_MESSAGES.length);
  return STATUS_MESSAGES[randomIndex];
}

/**
 * Inicia a rotação automática de status
 */
export function startStatusRotation(socket, intervalMinutes = 60) {
  if (statusInterval) {
    warningLog("⚠️  Rotação de status já está ativa.");
    return;
  }

  infoLog("🔄 Iniciando rotação automática de status...");

  // Atualizar status imediatamente
  updateStatus(socket);

  // Configurar intervalo
  const intervalMs = intervalMinutes * 60 * 1000;
  statusInterval = setInterval(() => {
    updateStatus(socket);
  }, intervalMs);

  successLog(`✅ Rotação de status iniciada (atualiza a cada ${intervalMinutes} minutos)`);
}

/**
 * Para a rotação automática de status
 */
export function stopStatusRotation() {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
    infoLog("⏹️  Rotação de status parada.");
  }
}

/**
 * Atualiza o status do perfil
 */
async function updateStatus(socket) {
  try {
    const status = getNextStatus();
    await socket.updateProfileStatus(status);
    successLog(`📝 Status atualizado: "${status}"`);
  } catch (error) {
    warningLog(`⚠️  Erro ao atualizar status: ${error.message}`);
  }
}

/**
 * Atualiza o status com uma mensagem específica
 */
export async function updateCustomStatus(socket, status) {
  try {
    await socket.updateProfileStatus(status);
    successLog(`📝 Status personalizado atualizado: "${status}"`);
  } catch (error) {
    warningLog(`⚠️  Erro ao atualizar status personalizado: ${error.message}`);
  }
}

/**
 * Adiciona uma nova mensagem à lista de status
 */
export function addStatusMessage(message) {
  if (!STATUS_MESSAGES.includes(message)) {
    STATUS_MESSAGES.push(message);
    successLog(`✅ Nova mensagem de status adicionada: "${message}"`);
  } else {
    warningLog(`⚠️  Mensagem já existe na lista: "${message}"`);
  }
}

/**
 * Remove uma mensagem da lista de status
 */
export function removeStatusMessage(message) {
  const index = STATUS_MESSAGES.indexOf(message);
  if (index > -1) {
    STATUS_MESSAGES.splice(index, 1);
    successLog(`✅ Mensagem de status removida: "${message}"`);
  } else {
    warningLog(`⚠️  Mensagem não encontrada na lista: "${message}"`);
  }
}

/**
 * Lista todas as mensagens de status
 */
export function listStatusMessages() {
  return STATUS_MESSAGES.filter(msg => typeof msg !== 'function');
}
