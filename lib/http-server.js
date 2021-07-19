const express = require('express')
const fs = require("fs")
const qrcode = require('qrcode')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = optn.port || process.env.PORT || 5000;

module.exports = (client) => {
try{	
let lastqr = false
client.on("qr", qr =>{
	qrcode.toDataURL(qr, function (err, url) {
	lastqr = url
	io.emit('qr', lastqr)
	})
})	
client.on("open", () =>{
	io.emit('con', {jid: client.user.jid})
	lastqr = false
})
client.on("close", () => io.emit('close', "IDLE"))
io.on('connection', () => io.emit('config', global.configs))
io.on('connection', (socket) => lastqr ? io.emit('qr', lastqr) : io.emit('con', {jid: client.user ? client.user.jid : false})); 
app.use(express.static('public'))
app.get("/configs", (req, res)=>{
	if (req.query.submit) {
		delete req.query.submit
		for (s in req.query){
		if (s == "ownerList") global.configs[s] = req.query[s].split("\r\n")
		else if (s == "maxLimit") global.configs[s] = Number(req.query[s])
		else global.configs[s] = req.query[s] 
		}
		if (!req.query["autoRead"]) global.configs["autoRead"] = false
		if (req.query["autoRead"]) global.configs["autoRead"] = true
		fs.writeFileSync("./config.json", JSON.stringify(global.configs, null, 3))
	}
	res.sendFile("public/configs.html", {root: "./"})
})
server.listen(PORT, () => {
	console.log(`Server Running on Port ${PORT}`)
});
} catch {
	
}
}