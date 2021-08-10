const axios = require('axios')
const fs = require('fs-extra')

const setting = JSON.parse(fs.readFileSync('./config.json'))
let { 
    lolhuman,
    } = setting
	
const spotify = async (url) => new Promise((resolve, reject) => {
	axios.get(`http://lolhuman.herokuapp.com/api/spotify?apikey=${lolhuman}&url=${url}`)
	.then(res => {
		resolve(res.data.result)
	})
	.catch(err => {
		reject(err)
	})
})

module.exports = {
	spotify
}