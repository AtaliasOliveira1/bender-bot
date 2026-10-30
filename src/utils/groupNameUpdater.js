/**
 * Atualiza nomes de grupos baseado em dia da semana e aniversários
 *
 * @author Dev Gui
 */
import {
  isActiveWeekdayGroup,
  getGroupOriginalName,
  isActiveBirthdayGroup,
  getTodayBirthdays,
  hasGroupNameUpdatedToday,
  setGroupNameLastUpdateDate,
} from "./database.js";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export async function updateGroupNames(socket) {
  try {
    // Só atualiza se o dia mudou (após 00:00)
    if (hasGroupNameUpdatedToday()) {
      console.log("Nomes de grupos já atualizados hoje. Pulando...");
      return;
    }

    console.log("Atualizando nomes de grupos (novo dia)...");

    const groups = await socket.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    for (const groupId of groupIds) {
      try {
        const metadata = await socket.groupMetadata(groupId);
        const currentName = metadata.subject;

        // Atualizar dia da semana
        if (isActiveWeekdayGroup(groupId)) {
          const originalName = getGroupOriginalName(groupId);
          const today = new Date();
          const weekday = WEEKDAYS[today.getDay()];
          const newName = `${weekday} - ${originalName}`;

          if (currentName !== newName) {
            await socket.groupUpdateSubject(groupId, newName);
            console.log(`Nome do grupo ${groupId} atualizado para: ${newName}`);
          }
        }

        // Atualizar aniversário
        if (isActiveBirthdayGroup(groupId)) {
          const todayBirthdays = getTodayBirthdays(groupId);
          const originalName = getGroupOriginalName(groupId);

          if (todayBirthdays.length > 0) {
            const birthdayNames = todayBirthdays.map((b) => b.name).join(", ");
            const newName = `🎉 Parabéns ${birthdayNames}! 🎂`;

            if (currentName !== newName) {
              await socket.groupUpdateSubject(groupId, newName);
              console.log(`Nome do grupo ${groupId} atualizado para parabéns: ${newName}`);
            }
          } else {
            // Se não tem aniversário hoje, volta ao nome original
            if (currentName !== originalName) {
              await socket.groupUpdateSubject(groupId, originalName);
              console.log(`Nome do grupo ${groupId} restaurado para: ${originalName}`);
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao atualizar nome do grupo ${groupId}:`, error.message);
      }
    }

    // Marca que já atualizou hoje
    setGroupNameLastUpdateDate();
    console.log("Atualização de nomes de grupos concluída.");
  } catch (error) {
    console.error("Erro ao buscar grupos:", error.message);
  }
}
