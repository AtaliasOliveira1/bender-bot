/**
 * Funções úteis para trabalhar
 * com dados.
 *
 * @author Dev Gui
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX, SPIDER_API_TOKEN } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.resolve(__dirname, "..", "..", "database");

const AFK_GROUPS_FILE = "afk-groups";
const ANTI_LINK_GROUPS_FILE = "anti-link-groups";
const AUTO_RESPONDER_FILE = "auto-responder";
const AUTO_RESPONDER_GROUPS_FILE = "auto-responder-groups";
const AUTO_STICKER_GROUPS_FILE = "auto-sticker-groups";
const CONFIG_FILE = "config";
const EXIT_GROUPS_FILE = "exit-groups";
const GROUP_RESTRICTIONS_FILE = "group-restrictions";
const INACTIVE_GROUPS_FILE = "inactive-groups";
const LIVE_ALERT_GROUPS_FILE = "live-alert-groups";
const MUTE_FILE = "muted";
const ONLY_ADMINS_FILE = "only-admins";
const PREFIX_GROUPS_FILE = "prefix-groups";
const RESTRICTED_MESSAGES_FILE = "restricted-messages";
const STICKER_AUTHORS_FILE = "sticker-authors";
const STICKER_AUTHORS_PENDING_FILE = "sticker-authors-pending";
const WEEKDAY_GROUPS_FILE = "weekday-groups";
const BIRTHDAYS_FILE = "birthdays";
const GROUP_ORIGINAL_NAMES_FILE = "group-original-names";
const ROULETTE_LAST_USED_FILE = "roulette-last-used";
const ROULETTE_MUTED_FILE = "roulette-muted";
const WELCOME_GROUPS_FILE = "welcome-groups";

function createIfNotExists(fullPath, formatIfNotExists = []) {
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(formatIfNotExists));
  }
}

function readJSON(jsonFile, formatIfNotExists = []) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);

  createIfNotExists(fullPath, formatIfNotExists);

  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function writeJSON(jsonFile, data, formatIfNotExists = []) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);

  createIfNotExists(fullPath, formatIfNotExists);

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

export function setAfkMember(groupId, memberId, reason) {
  const afkGroups = readJSON(AFK_GROUPS_FILE, {});

  if (!afkGroups[groupId]) {
    afkGroups[groupId] = {};
  }

  afkGroups[groupId][memberId] = reason.trim();

  writeJSON(AFK_GROUPS_FILE, afkGroups, {});
}

export function getAfkReason(groupId, memberId) {
  const afkGroups = readJSON(AFK_GROUPS_FILE, {});

  return afkGroups[groupId]?.[memberId] || null;
}

export function listAfkMembers(groupId) {
  const afkGroups = readJSON(AFK_GROUPS_FILE, {});

  return { ...(afkGroups[groupId] || {}) };
}

export function removeAfkMember(groupId, memberId) {
  const afkGroups = readJSON(AFK_GROUPS_FILE, {});

  if (!afkGroups[groupId]?.[memberId]) {
    return false;
  }

  delete afkGroups[groupId][memberId];

  if (!Object.keys(afkGroups[groupId]).length) {
    delete afkGroups[groupId];
  }

  writeJSON(AFK_GROUPS_FILE, afkGroups, {});

  return true;
}

export function activateExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  if (!exitGroups.includes(groupId)) {
    exitGroups.push(groupId);
  }

  writeJSON(filename, exitGroups);
}

export function deactivateExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  const index = exitGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  exitGroups.splice(index, 1);

  writeJSON(filename, exitGroups);
}

export function isActiveExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  return exitGroups.includes(groupId);
}

export function activateWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  if (!welcomeGroups.includes(groupId)) {
    welcomeGroups.push(groupId);
  }

  writeJSON(filename, welcomeGroups);
}

export function deactivateWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  const index = welcomeGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  welcomeGroups.splice(index, 1);

  writeJSON(filename, welcomeGroups);
}

export function isActiveWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  return welcomeGroups.includes(groupId);
}

export function activateGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  const index = inactiveGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  inactiveGroups.splice(index, 1);

  writeJSON(filename, inactiveGroups);
}

export function deactivateGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  if (!inactiveGroups.includes(groupId)) {
    inactiveGroups.push(groupId);
  }

  writeJSON(filename, inactiveGroups);
}

export function isActiveGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  return !inactiveGroups.includes(groupId);
}

export function getAutoResponderResponse(match) {
  const filename = AUTO_RESPONDER_FILE;

  const responses = readJSON(filename);

  const matchUpperCase = match.toLocaleUpperCase();

  const data = responses.find(
    (response) => response.match.toLocaleUpperCase() === matchUpperCase
  );

  if (!data) {
    return null;
  }

  return data.answer;
}

export function activateAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  if (!autoResponderGroups.includes(groupId)) {
    autoResponderGroups.push(groupId);
  }

  writeJSON(filename, autoResponderGroups);
}

export function deactivateAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  const index = autoResponderGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  autoResponderGroups.splice(index, 1);

  writeJSON(filename, autoResponderGroups);
}

export function isActiveAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  return autoResponderGroups.includes(groupId);
}

export function activateAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  if (!antiLinkGroups.includes(groupId)) {
    antiLinkGroups.push(groupId);
  }

  writeJSON(filename, antiLinkGroups);
}

export function deactivateAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  const index = antiLinkGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  antiLinkGroups.splice(index, 1);

  writeJSON(filename, antiLinkGroups);
}

export function isActiveAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  return antiLinkGroups.includes(groupId);
}

export function activateAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  if (!autoStickerGroups.includes(groupId)) {
    autoStickerGroups.push(groupId);
  }

  writeJSON(filename, autoStickerGroups);
}

export function deactivateAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  const index = autoStickerGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  autoStickerGroups.splice(index, 1);

  writeJSON(filename, autoStickerGroups);
}

export function isActiveAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  return autoStickerGroups.includes(groupId);
}

export function muteMember(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    mutedMembers[groupId] = [];
  }

  if (!mutedMembers[groupId]?.includes(memberId)) {
    mutedMembers[groupId].push(memberId);
  }

  writeJSON(filename, mutedMembers);
}

export function unmuteMember(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    return;
  }

  const index = mutedMembers[groupId].indexOf(memberId);

  if (index !== -1) {
    mutedMembers[groupId].splice(index, 1);
  }

  writeJSON(filename, mutedMembers);
}

export function checkIfMemberIsMuted(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    return false;
  }

  return mutedMembers[groupId]?.includes(memberId);
}

export function activateOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  if (!onlyAdminsGroups.includes(groupId)) {
    onlyAdminsGroups.push(groupId);
  }

  writeJSON(filename, onlyAdminsGroups);
}

export function deactivateOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  const index = onlyAdminsGroups.indexOf(groupId);
  if (index === -1) {
    return;
  }

  onlyAdminsGroups.splice(index, 1);

  writeJSON(filename, onlyAdminsGroups);
}

export function isActiveOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  return onlyAdminsGroups.includes(groupId);
}

export function readGroupRestrictions() {
  return readJSON(GROUP_RESTRICTIONS_FILE, {});
}

export function saveGroupRestrictions(restrictions) {
  writeJSON(GROUP_RESTRICTIONS_FILE, restrictions, {});
}

export function isActiveGroupRestriction(groupId, restriction) {
  const restrictions = readGroupRestrictions();

  if (!restrictions[groupId]) {
    return false;
  }

  return restrictions[groupId][restriction] === true;
}

export function updateIsActiveGroupRestriction(groupId, restriction, isActive) {
  const restrictions = readGroupRestrictions();

  if (!restrictions[groupId]) {
    restrictions[groupId] = {};
  }

  restrictions[groupId][restriction] = isActive;

  saveGroupRestrictions(restrictions);
}

export function readRestrictedMessageTypes() {
  return readJSON(RESTRICTED_MESSAGES_FILE, {
    sticker: "stickerMessage",
    video: "videoMessage",
    image: "imageMessage",
    audio: "audioMessage",
    product: "productMessage",
    document: "documentMessage",
    event: "eventMessage",
  });
}

export function setPrefix(groupJid, prefix) {
  const filename = PREFIX_GROUPS_FILE;

  const prefixGroups = readJSON(filename, {});

  prefixGroups[groupJid] = prefix;

  writeJSON(filename, prefixGroups, {});
}

export function getPrefix(groupJid) {
  const filename = PREFIX_GROUPS_FILE;

  const prefixGroups = readJSON(filename, {});

  return prefixGroups[groupJid] || PREFIX;
}

export function listAutoResponderItems() {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  return responses.map((item, index) => ({
    key: index + 1,
    match: item.match,
    answer: item.answer,
  }));
}

export function addAutoResponderItem(match, answer) {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  const matchUpperCase = match.toLocaleUpperCase();

  const existingItem = responses.find(
    (response) => response.match.toLocaleUpperCase() === matchUpperCase
  );

  if (existingItem) {
    return false;
  }

  responses.push({
    match: match.trim(),
    answer: answer.trim(),
  });

  writeJSON(filename, responses, []);

  return true;
}

export function removeAutoResponderItemByKey(key) {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  const index = key - 1;

  if (index < 0 || index >= responses.length) {
    return false;
  }

  responses.splice(index, 1);

  writeJSON(filename, responses, []);

  return true;
}

export function setSpiderApiToken(token) {
  const filename = CONFIG_FILE;

  const config = readJSON(filename, {});

  config.spider_api_token = token;

  writeJSON(filename, config, {});
}

export function getSpiderApiToken() {
  const filename = CONFIG_FILE;

  const config = readJSON(filename, {});

  return config.spider_api_token || SPIDER_API_TOKEN;
}

export function addLiveAlertGroup(groupId) {
  const filename = LIVE_ALERT_GROUPS_FILE;

  const liveAlertGroups = readJSON(filename, []);

  if (!liveAlertGroups.includes(groupId)) {
    liveAlertGroups.push(groupId);
  }

  writeJSON(filename, liveAlertGroups);
}

export function removeLiveAlertGroup(groupId) {
  const filename = LIVE_ALERT_GROUPS_FILE;

  const liveAlertGroups = readJSON(filename, []);

  const index = liveAlertGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  liveAlertGroups.splice(index, 1);

  writeJSON(filename, liveAlertGroups);
}

export function getLiveAlertGroups() {
  const filename = LIVE_ALERT_GROUPS_FILE;

  return readJSON(filename, []);
}

export function isActiveLiveAlertGroup(groupId) {
  const filename = LIVE_ALERT_GROUPS_FILE;

  const liveAlertGroups = readJSON(filename, []);

  return liveAlertGroups.includes(groupId);
}

export function getStickerAuthor(userId) {
  const filename = STICKER_AUTHORS_FILE;
  const authors = readJSON(filename, {});

  return authors[userId] || null;
}

export function setStickerAuthor(userId, authorName) {
  const filename = STICKER_AUTHORS_FILE;
  const authors = readJSON(filename, {});

  authors[userId] = authorName;

  writeJSON(filename, authors, {});
}

export function addPendingStickerAuthorRegistration(userId, remoteJid) {
  const filename = STICKER_AUTHORS_PENDING_FILE;
  const pending = readJSON(filename, {});

  pending[userId] = {
    remoteJid,
    timestamp: Date.now(),
  };

  writeJSON(filename, pending, {});
}

export function getPendingStickerAuthorRegistration(userId) {
  const filename = STICKER_AUTHORS_PENDING_FILE;
  const pending = readJSON(filename, {});

  return pending[userId] || null;
}

export function removePendingStickerAuthorRegistration(userId) {
  const filename = STICKER_AUTHORS_PENDING_FILE;
  const pending = readJSON(filename, {});

  if (!pending[userId]) {
    return false;
  }

  delete pending[userId];

  writeJSON(filename, pending, {});

  return true;
}

export function activateWeekdayGroup(groupId) {
  const filename = WEEKDAY_GROUPS_FILE;
  const weekdayGroups = readJSON(filename, []);

  if (!weekdayGroups.includes(groupId)) {
    weekdayGroups.push(groupId);
  }

  writeJSON(filename, weekdayGroups);
}

export function deactivateWeekdayGroup(groupId) {
  const filename = WEEKDAY_GROUPS_FILE;
  const weekdayGroups = readJSON(filename, []);

  const index = weekdayGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  weekdayGroups.splice(index, 1);

  writeJSON(filename, weekdayGroups);
}

export function isActiveWeekdayGroup(groupId) {
  const filename = WEEKDAY_GROUPS_FILE;
  const weekdayGroups = readJSON(filename, []);

  return weekdayGroups.includes(groupId);
}

export function setGroupOriginalName(groupId, originalName) {
  const filename = GROUP_ORIGINAL_NAMES_FILE;
  const originalNames = readJSON(filename, {});

  originalNames[groupId] = originalName;

  writeJSON(filename, originalNames, {});
}

export function getGroupOriginalName(groupId) {
  const filename = GROUP_ORIGINAL_NAMES_FILE;
  const originalNames = readJSON(filename, {});

  return originalNames[groupId] || null;
}

export function removeGroupOriginalName(groupId) {
  const filename = GROUP_ORIGINAL_NAMES_FILE;
  const originalNames = readJSON(filename, {});

  if (!originalNames[groupId]) {
    return false;
  }

  delete originalNames[groupId];

  writeJSON(filename, originalNames, {});

  return true;
}

export function addBirthday(groupId, memberId, name, day, month) {
  const filename = BIRTHDAYS_FILE;
  const birthdays = readJSON(filename, {});

  if (!birthdays[groupId]) {
    birthdays[groupId] = [];
  }

  birthdays[groupId].push({
    memberId,
    name,
    day,
    month,
  });

  writeJSON(filename, birthdays, {});
}

export function removeBirthday(groupId, memberId) {
  const filename = BIRTHDAYS_FILE;
  const birthdays = readJSON(filename, {});

  if (!birthdays[groupId]) {
    return false;
  }

  const index = birthdays[groupId].findIndex((b) => b.memberId === memberId);

  if (index === -1) {
    return false;
  }

  birthdays[groupId].splice(index, 1);

  if (birthdays[groupId].length === 0) {
    delete birthdays[groupId];
  }

  writeJSON(filename, birthdays, {});

  return true;
}

export function getBirthdays(groupId) {
  const filename = BIRTHDAYS_FILE;
  const birthdays = readJSON(filename, {});

  return birthdays[groupId] || [];
}

export function getTodayBirthdays(groupId) {
  const birthdays = getBirthdays(groupId);
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  return birthdays.filter((b) => b.day === currentDay && b.month === currentMonth);
}

export function activateBirthdayGroup(groupId) {
  const filename = "birthday-groups";
  const birthdayGroups = readJSON(filename, []);

  if (!birthdayGroups.includes(groupId)) {
    birthdayGroups.push(groupId);
  }

  writeJSON(filename, birthdayGroups);
}

export function deactivateBirthdayGroup(groupId) {
  const filename = "birthday-groups";
  const birthdayGroups = readJSON(filename, []);

  const index = birthdayGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  birthdayGroups.splice(index, 1);

  writeJSON(filename, birthdayGroups);
}

export function isActiveBirthdayGroup(groupId) {
  const filename = "birthday-groups";
  const birthdayGroups = readJSON(filename, []);

  return birthdayGroups.includes(groupId);
}

export function getRouletteLastUsed(userId) {
  const filename = ROULETTE_LAST_USED_FILE;
  const lastUsed = readJSON(filename, {});

  return lastUsed[userId] || null;
}

export function setRouletteLastUsed(userId) {
  const filename = ROULETTE_LAST_USED_FILE;
  const lastUsed = readJSON(filename, {});

  lastUsed[userId] = Date.now();

  writeJSON(filename, lastUsed, {});
}

export function canUseRoulette(userId) {
  const lastUsed = getRouletteLastUsed(userId);

  if (!lastUsed) {
    return true;
  }

  const oneDayInMs = 24 * 60 * 60 * 1000;
  const timeSinceLastUse = Date.now() - lastUsed;

  return timeSinceLastUse >= oneDayInMs;
}

export function addRouletteMuted(groupId, memberId, expiresAt) {
  const filename = ROULETTE_MUTED_FILE;
  const muted = readJSON(filename, {});

  if (!muted[groupId]) {
    muted[groupId] = {};
  }

  muted[groupId][memberId] = expiresAt;

  writeJSON(filename, muted, {});
}

export function getRouletteMuted(groupId, memberId) {
  const filename = ROULETTE_MUTED_FILE;
  const muted = readJSON(filename, {});

  if (!muted[groupId] || !muted[groupId][memberId]) {
    return null;
  }

  const expiresAt = muted[groupId][memberId];

  if (Date.now() > expiresAt) {
    delete muted[groupId][memberId];

    if (Object.keys(muted[groupId]).length === 0) {
      delete muted[groupId];
    }

    writeJSON(filename, muted, {});

    return null;
  }

  return expiresAt;
}

export function removeRouletteMuted(groupId, memberId) {
  const filename = ROULETTE_MUTED_FILE;
  const muted = readJSON(filename, {});

  if (!muted[groupId] || !muted[groupId][memberId]) {
    return false;
  }

  delete muted[groupId][memberId];

  if (Object.keys(muted[groupId]).length === 0) {
    delete muted[groupId];
  }

  writeJSON(filename, muted, {});

  return true;
}
