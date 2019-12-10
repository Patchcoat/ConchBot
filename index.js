const Discord = require('discord.js')
const client = new Discord.Client();
//const auth = require('./auth.json').token;
const auth = process.env.ACCESS_TOKEN;
const accDenMsg = "You're not cleared for that";
const helpText = "\n.r to raise your hand\n.l to lower your hand\n.show to show the current queue\n.clear to clear the queue (GM only)";
var queue = [];
const ActionEnum = Object.freeze({
    "help":1,
    "raise":2,
    "lower":3,
    "lowerIt":4,
    "show":5,
    "clear":6,
    "log":7});

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
    let action;
    // Assign Actions
    switch(msg.content) {
        case '.h':
            action = ActionEnum.help;
            break;
        case '.help':
            action = ActionEnum.help;
            break;
        case '.r':
            action = ActionEnum.raise;
            break;
        case '.l':
            action = ActionEnum.lower;
            break;
        case '.show':
            action = ActionEnum.show;
            break;
        case '.clear':
            action = ActionEnum.clear;
            break;
        default:
            break;
    }
    // More Advanced Actions
    if (msg.content.substring(0, 3) === '.l ') {
        action = ActionEnum.lowerIt;
    }
    if (msg.content.substring(0, 4) === '.log') {
        action = ActionEnum.log;
    }
    // Execute the action
    switch (action) {
        case ActionEnum.help:
            msg.reply(helpText);
            break;
        case ActionEnum.raise:
            if (!queue.includes(msg.author)) {
                queue.push(msg.author);
            }
            channel.send(queueToString(queue));
            break;
        case ActionEnum.lower:
            var index = queue.indexOf(msg.author);
            if (index > -1) {
                queue.splice(index, 1);
            }
            channel.send(queueToString(queue));
            break;
        case ActionEnum.show:
            if (msg.member._roles.indexOf(GM.id) > -1) {
                channel.send(queueToString(queue));
            } else {
                channel.send(GM.toString()+" "+queueToString(queue));
            }
            break;
        case ActionEnum.clear:
            if (msg.member._roles.indexOf(GM) > -1) {
                queue = [];
                channel.send(queueToString(queue));
            } else {
                msg.reply(accDenMsg);
            }
            break;
        case ActionEnum.lowerIt:
            if (msg.member._roles.indexOf(GM.id) > -1) {
                var extra = msg.content.substring(3);
                channel.send("'"+extra+"'");
            } else {
                msg.reply(accDenMsg);
            }
            break;
        case ActionEnum.log:
            console.log(msg);
            break;
    }
    if (msg.isMentioned(client.user)) {
        var patt = /thanks(,? bot.?|.?)/i
        if (patt.test(msg.content)) {
            msg.reply("You're welcome.");
        }
    }
});

client.login(auth);
