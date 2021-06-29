const {color} = require('./func')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
module.exports = logs = async (message, body, prefix, client) =>{
// if (message.key.fromMe) return
const from = message.key.remoteJid  
const isCmd = body.startsWith(prefix)
const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
const isGroup = from.endsWith('@g.us')
const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const sender = isGroup ? message.participant : message.key.remoteJid
const t = message.messageTimestamp.low
let authorname = message.key.fromMe ? 'ME/SELF' : client.contacts[sender] ? client.contacts[sender].vname || client.contacts[sender].notify || sender.split('@')[0] || undefined : sender.split('@')[0]

if (isGroup){
  if (isCmd) console.log(color('[ CMD ]', 'yellow'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), command,color('from', 'yellow'), authorname, color('in'), groupName)
  if (!isCmd) console.log(color('[ MSG ]', 'purple'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), color('from', 'yellow'), authorname, color('in'), groupName)
} 
if (!isGroup){
  if (isCmd) console.log(color('[ CMD ]', 'yellow'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), command,color('from', 'yellow'), authorname)
  if (!isCmd) console.log(color('[ MSG ]', 'purple'),color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'green') ,color('from', 'yellow'), authorname)
}
}