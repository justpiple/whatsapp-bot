const fs = require('fs');
const dataGc = JSON.parse(fs.readFileSync('./lib/json/dataGc.json'));


const detectingAfk = (gc, sender) => {
	if (!dataGc[gc]) dataGc[gc] = {afk: {}}
	sender = sender.endsWith('@c.us') ? sender.replace('@c.us', '@s.whatsapp.net') : sender
	if (dataGc[gc].afk && dataGc[gc].afk[sender]){
		delete dataGc[gc].afk[sender]
		fs.writeFileSync('./lib/json/dataGc.json', JSON.stringify(dataGc, null, 2))
		return true
	}
	return null
}

const addAfk = (gc, sender, reason, time) =>{
	dataGc[gc].afk[sender] = {reason,time}
	fs.writeFileSync('./lib/json/dataGc.json', JSON.stringify(dataGc, null, 2))
	return 
}

const tagDetect = (gc, sender) =>{
	return dataGc[gc].afk && dataGc[gc].afk[sender] ? dataGc[gc].afk[sender] : null
}

module.exports = {
	detectingAfk,
	addAfk,
	tagDetect
}