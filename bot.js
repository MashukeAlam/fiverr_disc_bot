require('dotenv').config();
const { Client, Intents } = require('discord.js');
const express = require('express');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let MASTER_ARRAY = [];
let channels = [];
let INTERVAL = 50000000;
let currentTime = 0;


app.get('/', (req, res) => {
    res.render('index', {array: MASTER_ARRAY});
});

app.get('/install', (req, res) => {
    console.log(req.query);
    const channelList = req.query.channels.split(',');

    for (let i = 0; i < channelList.length; i++) {
        let time =  parseInt(req.query.time);
        if (req.query.time < 0) {
            time *= -1;
        }
        MASTER_ARRAY.push({link: req.query.link, channel: channelList[i], time});
    }
    MASTER_ARRAY = MASTER_ARRAY.sort((a, b) => a.time < b.time);
    INTERVAL = MASTER_ARRAY[0]['time'];
    console.log(MASTER_ARRAY);
    currentTime = new Date().getTime();
    res.redirect('/');
});

const PORT = process.env.PORT || 6969;

const client = new Client();

client.on('ready', () => {
    console.log(`${client.user.username} has logged in.`);
    // console.log(client.channels);
    client.channels.cache.forEach(element => {
        // console.log(element['name'], element["id"]);
        channels.push([element['name'], element['id']])
    });
    console.log(channels);
});

client.on('message', (msg) => {
    if (msg.author.bot) return;
    console.log(msg.content);
    client.channels.cache.get("828892242680086538").send("Yo?")
});

const getChannelId = (name) => {
    let res = -1;
    channels.forEach(el => {
        console.log(el[0], String(name), el[0] == String(name));
        if (el[0] === String(name)) {

            res = el[1];
        }
    });

    return res;
}

setInterval(() => {
    let prevTime = INTERVAL;
    console.log(INTERVAL, new Date().getTime() - currentTime);
    if (new Date().getTime() - currentTime > INTERVAL) {
        for (let i = 0; i < MASTER_ARRAY.length; i++) {
            const channelForThis = getChannelId(MASTER_ARRAY[i]['channel']);
            console.log(channelForThis);
            client.channels.cache.get(channelForThis).send(MASTER_ARRAY[i]['link']);
        }
        MASTER_ARRAY = []
    }
    
    
}, 20000);


client.login(process.env.DISCORD_TOKEN);

server.listen(PORT, '0.0.0.0', () => { console.log(`Server firing at ${PORT}`); });

