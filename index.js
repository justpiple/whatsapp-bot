const {
    WAConnection,
    MessageType,
    Presence,
    MessageOptions,
    Mimetype,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    messageStubType,
    ReconnectMode,
    ProxyAgent,
    waChatKey,
} = require("@adiwajshing/baileys");
const fs = require('fs');
const moment = require('moment-timezone');
const afkJs = require('./lib/afk')
const vn = JSON.parse(fs.readFileSync('./lib/json/vn.json'))
const ClientJs = require('./lib/client');
const cron = require('node-cron');
const config = JSON.parse(fs.readFileSync('./config.json'));
let dataUser = JSON.parse(fs.readFileSync('./lib/json/dataUser.json'))
let dataGc = JSON.parse(fs.readFileSync('./lib/json/dataGc.json'))
global.vn = JSON.parse(fs.readFileSync('./lib/json/vn.json'))
moment.tz.setDefault('Asia/Jakarta').locale('id');
const { color } = require('./lib/func')
const Crypto = require('crypto')

/*if (data.body && vn.includes(data.body)){
	const vien = fs.readFileSync("./lib/vn"+ data.body+".mp3")
	Client.sendPtt(data.from, vien, 'vn.mp3', ``, data.message)
}*/
const starts = async (sesName) => {
    try {
        const Client = new ClientJs(config, sesName || config.defaultSessionName)
        Client.starts()
        const client = Client.mainClient
		require('./handler')(client, Client)
		detectChange('./handler.js', (mdl) =>{
			Client.cmd.removeAllListeners()
			Client.handlerStick.removeAllListeners()
			require('./handler')(client, Client)
			console.log(color('[ INFO ]', 'cyan'), `${mdl} auto updated!`)
		})
		
        client.on('CB:Presence', asd => {
        	asd = asd[1]
            if (!asd.id.endsWith('@g.us')) return
            if((asd.type == 'composing' || asd.type == 'recording') && afkJs.detectingAfk(asd.id, asd.participant)) {
            Client.sendText(asd.id, `@${asd.participant.split('@')[0]} terdeteksi melakukan aktivitas!, status afkMu telah dihapus`)
                }
        })
		lastblcklist = []
		client.on('CB:Call', json => {
			client.query({json: ["action","call",["call",{"from":client.user.jid,"to":json[1].from,"id":generateMessageID()},[["reject",{"call-id":json[1].id,"call-creator":json[1].from,"count":"0"},null]]]]}).then(() =>{
			setTimeout(async () =>{
			if (Client.blocklist.includes(json[1].from)) return
			client.blockUser(json[1].from, 'add')   
			}, 3000)
		}).catch()
           
		})
        client.on('new-msg', (message) => {
            if(message.key && message.key.remoteJid == 'status@broadcast') return
            if(message.key.fromMe && !config.self || !message.key.fromMe && config.self) return
			const body = message.body
			const from = message.key.remoteJid
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup ? message.participant : from
			if (global.vn.includes(body)) Client.sendPtt(from, `./lib/vn/${body}.mp3`, message)
			if (isGroup && !dataGc[from]){
				dataGc[from] = {afk:{}}
				fs.writeFileSync('./lib/json/dataGc.json', JSON.stringify(dataGc, null, 2))
			}
			if (!dataUser[sender]){
				dataUser[sender] = {limit: 0, premium: false}
				fs.writeFileSync('./lib/json/dataUser.json', JSON.stringify(dataUser))
			}
            if(isGroup) {
                if(afkJs.detectingAfk(from, sender)) Client.sendText(from, `@${sender.split('@')[0]} sekarang tidak afk!`)
                if(message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.mentionedJid) {
                    jids = message.message.extendedTextMessage.contextInfo.mentionedJid
                    jids.forEach(jid => {
                        takeData = afkJs.tagDetect(from, jid)
                        if(!takeData) return
                        duration = moment.duration(moment(takeData.time).diff(moment()))
                        Client.reply(from, `@${jid.split('@')[0]} sedang afk\nReason: ${takeData.reason}\nTime: ${duration.days()} Hari ${duration.hours()} Jam ${duration.minutes()} Menit ${duration.seconds()} detik`)
                    })
                }
            }
        })
		client.on('group-participants-update', (jdgn) => require('./lib/greet.js')(jdgn, Client, client))
    } catch (e) {
        console.error(e)
    }
}

cron.schedule('0 0 * * *', () => {
    for (users in dataUser){
		dataUser[users].limit = 0
	}
    fs.writeFileSync('./lib/json/dataUser.json', JSON.stringify(dataUser))
    console.log(color('[ INFO ]', 'cyan'), 'LIMIT RESETED!')
});
detectChange('./lib/text.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} change is detected!`))
detectChange('./lib/greet.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} change is detected!`))
function detectChange(module, cb){
	fs.watchFile(require.resolve(module), () => {
	 delete require.cache[require.resolve(module)]
	 if (cb) cb(module)
    })
}
const randomBytes = (length) => {
    return Crypto.randomBytes(length)
}
function generateMessageID() {
    return '3EB0' + randomBytes(7).toString('hex').toUpperCase()
}
starts(process.argv[2])
