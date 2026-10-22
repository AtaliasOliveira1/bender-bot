/**
 * Gerenciamento de configuração de auto-resposta de figurinhas por grupo
 *
 * @author Dev Gui
 */
import { DATABASE_DIR } from "../config.js";
import fs from "node:fs";
import path from "node:path";

const CONFIG_FILE = path.join(DATABASE_DIR, "auto-sticker-config.json");

/**
 * Carrega a configuração dos grupos
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error("Erro ao carregar configuração auto-sticker:", error);
    return {};
  }
}

/**
 * Salva a configuração dos grupos
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("Erro ao salvar configuração auto-sticker:", error);
    return false;
  }
}

/**
 * Verifica se o autofig está ativado para um grupo específico
 */
export function isAutoStickerEnabledForGroup(groupJid) {
  const config = loadConfig();
  // Se não houver configuração específica, usa o padrão (ativado)
  if (config[groupJid] === undefined) {
    return true;
  }
  return config[groupJid];
}

/**
 * Ativa o autofig para um grupo
 */
export function enableAutoStickerForGroup(groupJid) {
  const config = loadConfig();
  config[groupJid] = true;
  return saveConfig(config);
}

/**
 * Desativa o autofig para um grupo
 */
export function disableAutoStickerForGroup(groupJid) {
  const config = loadConfig();
  config[groupJid] = false;
  return saveConfig(config);
}

/**
 * Lista todos os grupos com configuração personalizada
 */
export function listGroupConfigs() {
  const config = loadConfig();
  return Object.entries(config).map(([groupJid, enabled]) => ({
    groupJid,
    enabled,
  }));
}
