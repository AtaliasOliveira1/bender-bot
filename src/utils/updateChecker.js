/**
 * Módulo de verificação de atualizações do repositório
 *
 * @author Dev Gui
 */
import { exec } from "child_process";
import { CHECK_UPDATES_ON_STARTUP } from "../config.js";
import { question } from "./index.js";
import {
  bannerLog,
  errorLog,
  infoLog,
  successLog,
  warningLog,
} from "./logger.js";

/**
 * Executa um comando git e retorna o output
 */
function execGit(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Verifica se o diretório atual é um repositório git
 */
async function isGitRepo() {
  try {
    await execGit("git rev-parse --git-dir");
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se há atualizações disponíveis
 */
async function checkForUpdates() {
  try {
    // Fazer fetch do origin
    await execGit("git fetch origin");

    // Obter branch atual
    const currentBranch = await execGit("git branch --show-current");
    const remoteBranch = `origin/${currentBranch}`;

    // Verificar se a branch remota existe
    try {
      await execGit(`git show-ref --verify --quiet refs/remotes/${remoteBranch}`);
    } catch {
      // Tentar usar main ou master
      try {
        await execGit("git show-ref --verify --quiet refs/remotes/origin/main");
        remoteBranch = "origin/main";
      } catch {
        try {
          await execGit("git show-ref --verify --quiet refs/remotes/origin/master");
          remoteBranch = "origin/master";
        } catch {
          throw new Error("Não foi possível encontrar uma branch remota válida");
        }
      }
    }

    // Comparar HEAD com remoto
    const localCommit = await execGit("git rev-parse HEAD");
    const remoteCommit = await execGit(`git rev-parse ${remoteBranch}`);

    return {
      hasUpdates: localCommit !== remoteCommit,
      localCommit,
      remoteCommit,
      remoteBranch,
    };
  } catch (error) {
    throw new Error(`Erro ao verificar atualizações: ${error.message}`);
  }
}

/**
 * Aplica as atualizações do repositório
 */
async function applyUpdates(remoteBranch) {
  try {
    warningLog("⚠️  ATENÇÃO: Isso irá sobrescrever arquivos locais com a versão do repositório!");

    const answer = await question("Deseja continuar? (s/n): ");

    if (answer.toLowerCase() !== "s" && answer.toLowerCase() !== "y") {
      infoLog("Atualização cancelada pelo usuário.");
      return false;
    }

    infoLog("🔄 Atualizando repositório...");

    // Resetar para a versão remota (force update)
    await execGit(`git reset --hard ${remoteBranch}`);

    successLog("✅ Repositório atualizado com sucesso!");

    return true;
  } catch (error) {
    errorLog(`Erro ao aplicar atualizações: ${error.message}`);
    return false;
  }
}

/**
 * Função principal de verificação de atualizações
 */
export async function checkUpdatesOnStartup() {
  try {
    // Verificar se a verificação está habilitada na configuração
    if (!CHECK_UPDATES_ON_STARTUP) {
      infoLog("ℹ️  Verificação de atualizações desabilitada na configuração.");
      return;
    }

    // Verificar se é um repositório git
    if (!(await isGitRepo())) {
      infoLog("⚠️  Não é um repositório git. Pulando verificação de atualizações.");
      return;
    }

    infoLog("🔍 Verificando atualizações do repositório...");

    const updateInfo = await checkForUpdates();

    if (!updateInfo.hasUpdates) {
      successLog("✅ Bot já está atualizado!");
      return;
    }

    warningLog("🆕 Há atualizações disponíveis no repositório!");
    infoLog(`Branch remota: ${updateInfo.remoteBranch}`);

    const answer = await question("Deseja atualizar para a última versão? (s/n): ");

    if (answer.toLowerCase() === "s" || answer.toLowerCase() === "y") {
      const success = await applyUpdates(updateInfo.remoteBranch);

      if (success) {
        infoLog("💡 Execute 'npm install' para garantir que as dependências estejam atualizadas.");
        infoLog("💡 Reinicie o bot para aplicar as mudanças.");
      }
    } else {
      infoLog("ℹ️  Atualização cancelada. Iniciando bot com versão atual...");
    }
  } catch (error) {
    warningLog(`⚠️  Erro ao verificar atualizações: ${error.message}`);
    infoLog("ℹ️  Iniciando bot mesmo assim...");
  }
}
