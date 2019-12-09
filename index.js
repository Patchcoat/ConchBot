const Discord = require('discord.js')
const client = new Discord.Client();
const auth = require('./auth.json');
const accDenMsg = "You're not cleared for that";
var queue = [];

client.on('ready', () => {
    console.log(`logged in as ${client.user.tag}!`);
});

function queueToString (queue) {
    if (queue.length == 0) {
        return "Empty Queue";
    }
    var queueString = "";
    for (var i = 0; i < queue.length; i++) {
        queueString += queue[i].username;
        if (i < queue.length-1) {
            queueString += ", ";
        }
    }
    return queueString;
}

client.on('message', msg => {
    const channel = client.channels.get(msg.channel.id);
    const guild = client.guilds.get(msg.member.guild.id);
    const GM = guild.roles.find(val => val.name === "GM");
    if (msg.content === '.r') {
        if (!queue.includes(msg.author)) {
            queue.push(msg.author);
        }
        channel.send(queueToString(queue));
    } else if (msg.content === '.l') {
        var index = queue.indexOf(msg.author)
        if (index > -1) {
            queue.splice(index, 1);
        }
        channel.send(queueToString(queue));
    } else if (msg.content.substring(0, 3) === '.l ') {
        if (msg.member._roles.indexOf(GM.id) > -1) {
            var extra = msg.content.substring(3);
            channel.send("'"+extra+"'");
        } else {
            msg.reply(accDenMsg);
        }
    } else if (msg.content === '.show') {
        if (msg.member._roles.indexOf(GM.id) > -1) {
            channel.send(queueToString(queue));
        } else {
            channel.send(GM.toString()+" "+queueToString(queue));
        }
    } else if (msg.content === '.clear') {
        if (msg.member._roles.indexOf(GM) > -1) {
            queue = [];
            channel.send(queueToString(queue));
        } else {
            msg.reply(accDenMsg);
        }
    } else if (msg.content.substring(0, 4) === '.log') {
        console.log(msg);
    }
});

client.login(auth.token);
