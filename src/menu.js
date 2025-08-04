/**
 * Menu do bot
 *
 * @author Dev Gui
 */
const { BOT_NAME } = require("./config");
const packageInfo = require("../package.json");
const { readMore } = require("./utils");
const { getPrefix } = require("./utils/database");

exports.menuMessage = (groupJid) => {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}
┊
┊ • ${BOT_NAME}
┊ • Data: ${date.toLocaleDateString("pt-br")}
┊ • Hora: ${date.toLocaleTimeString("pt-br")}
┊ • Prefixo: ${prefix}
┊ • Versão: ${packageInfo.version}
┊
╰─┈┈┈◜❁◞┈┈┈─╯

╭┈❪⚙️ꕸ▸ *MENU PRINCIPAL*
┊
┊•.̇𖥨֗☢️⭟${prefix}s
┊
╰─┈┈┈◜❁◞┈┈┈─╯

╭━━⪩ ADMINS ⪨━━
┊
┊•.̇𖥨֗☢️⭟${prefix}anti-image (1/0)
┊•.̇𖥨֗☢️⭟${prefix}anti-link (1/0)
┊•.̇𖥨֗☢️⭟${prefix}anti-video (1/0)
┊•.̇𖥨֗☢️⭟${prefix}ban
┊•.̇𖥨֗☢️⭟${prefix}delete
┊•.̇𖥨֗☢️⭟${prefix}fechar
┊•.̇𖥨֗☢️⭟${prefix}hidetag
┊•.̇𖥨֗☢️⭟${prefix}limpar
┊•.̇𖥨֗☢️⭟${prefix}link-grupo
┊•.̇𖥨֗☢️⭟${prefix}promover
┊•.̇𖥨֗☢️⭟${prefix}rebaixar
┊•.̇𖥨֗☢️⭟${prefix}revelar
┊•.̇𖥨֗☢️⭟${prefix}mute
┊•.̇𖥨֗☢️⭟${prefix}unmute
┊•.̇𖥨֗☢️⭟${prefix}welcome (1/0)
┊
╰─┈┈┈◜❁◞┈┈┈─╯`;
};
