const Discord = require('discord.js')
const client = new Discord.Client();
//const auth = require('./auth.json').token;
const auth = process.env.ACCESS_TOKEN;
const accDenMsg = "You're not cleared for that";
const helpText = "\n.rh to raise your hand\n.lh to lower your hand\n.show to show the current queue\n.clear to clear the queue (GM only)";
var queue = new Map();
var admin = '';
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

function queueToString (queue, id) {
    if (queue.get(id).length == 0) {
        return "Empty Queue";
    }
    var queueString = "";
    for (var i = 0; i < queue.get(id).length; i++) {
        queueString += queue.get(id)[i].username;
        if (i < queue.get(id).length-1) {
            queueString += ", ";
        }
    }
    return queueString;
}

client.on('message', msg => {
    const chID = msg.channel.id;
    const channel = client.channels.get(chID);
    const GM = msg.guild.roles.find(val => val.name === "GM");
    let action;
    // handle the queue
    if (queue.get(chID)) {
        queue.set(chID, []);
    }
    // Assign Actions
    switch(msg.content) {
        case '.h':
            action = ActionEnum.help;
            break;
        case '.help':
            action = ActionEnum.help;
            break;
        case '.rh':
            action = ActionEnum.raise;
            break;
        case '.lh':
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
    if (msg.content.substring(0, 3) === '.lh ') {
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
            if (!queue.get(chID).includes(msg.author)) {
                queue.get(chID).push(msg.author);
            }
            channel.send(queueToString(queue, chID));
            break;
        case ActionEnum.lower:
            var index = queue.get(chID).indexOf(msg.author);
            if (index > -1) {
                queue.get(chID).splice(index, 1);
            }
            channel.send(queueToString(queue, chID));
            break;
        case ActionEnum.show:
            if (msg.member._roles.indexOf(GM.id) > -1) {
                channel.send(queueToString(queue, chID));
            } else {
                channel.send(GM.toString()+" "+queueToString(queue, chID));
            }
            break;
        case ActionEnum.clear:
            if (msg.member._roles.indexOf(GM.id) > -1 || msg.member.user.id == admin) {
                queue.get(chID) = [];
                channel.send(queueToString(queue, chID));
            } else {
                msg.reply(accDenMsg);
            }
            break;
        case ActionEnum.lowerIt:
            if (msg.member._roles.indexOf(GM.id) > -1 || msg.member.user.id == admin) {
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
        var good = /.*good bot.?/i
        if (good.test(msg.content)) {
            channel.send("(　＾∇＾)");
        }
        var littleS = /.*now listen here you little.*/i
        if (littleS.test(msg.content)) {
            if (msg.member._roles.indexOf(GM.id) > -1 || msg.member.user.id == admin) {
                msg.reply("I'm sorry");
            } else {
                msg.reply("no u");
            }
        }
        var talkBack = /.*don't talk back to me.*/i
        if (talkBack.test(msg.content)) {
            msg.reply("(;¬_¬)");
        }
        var ctrl = /.*assuming direct control.*/i
        var noCtrl = /.*giving up control.*/i
        var nuke = /.*tactical nuke.*/i
        if (msg.member.user.id == '219719949462011904') {
            if (ctrl.test(msg.content)) {
                admin = msg.member.user.id;
                msg.reply("You now have full control");
            } else if (noCtrl.test(msg.content)) {
                admin = "";
                msg.reply("You are no longer in control");
            } else if (nuke.test(msg.content) && msg.member.user.id == admin) {
                queue = new Map();
                channel.send("It is done.");
            }
        } else {
            msg.reply(accDenMsg);
        }
    }
});

client.login(auth);
