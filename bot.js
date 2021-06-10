const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const fs = require('fs');
const parseDuration = require('parse-duration')

const Help = require('./lib/help.js');  // help text
const constants = require('./settings.js');  // constants and settings
const IRC = require('./lib/irc.js');  // irc client, connected
const { IncrementBuildup, ClearUserBuildup } = require('./lib/limits.js');
const Mutes = require('./lib/mutes.js');

// Hack
// TODO: Better way to ensure one instance of bot only (pid file method breaks if process exits unexpectedly)
var app = require('express')();
app.listen(22534);

// Nickslist - Stored in RAM, no logs, no leaks.
let nicklist = [];

const flood_mute_time = parseDuration(constants.FLOOD_MUTE_TIME) || constants.FLOOD_MUTE_TIME

// Main listener
IRC.addListener('raw',async (message) => {
  if(message.command==='NOTICE' &&
    (message.args[0].toLowerCase()==='@'+constants.IRC_CHAN.toLowerCase()))
    parse(message.nick,message.args[1]);
  else if(message.command==='JOIN')
    IRC.whois(message.nick);
  else if(message.command==='PART' || message.command==='KICK' || message.command==='QUIT')
    delete nicklist[message.nick.toLowerCase()];
  else if(message.command==='330') {
    if(message.args[1].toLowerCase()!==message.args[2].toLowerCase()) {
      IRC.mode(constants.IRC_CHAN,'+b',message.args[1]+"!*@*");
      IRC.remove(constants.IRC_CHAN,message.args[1],"Sorry, but only primary nicks may join this channel.");
      setTimeout(() => {
        IRC.mode(constants.IRC_CHAN,'-b',message.args[1]+"!*@*");
      },10000);
    }
  }
});

// Whois Listener
IRC.addListener('whois', async (info) => {
    const { nick, host } = info;
    Mutes.HandleMuteWhois(nicklist, nick, host)
})

// Main bot processor
async function parse(from,msg) {
  msg=msg.split(" ");
  switch(msg[0].toLowerCase()) {
    case "!help":
      if(!msg[1])
        IRC.notice_chan(from,Help.help,constants.IRC_CHAN);
      else {
        IRC.notice_chan(from,Help.header,constants.IRC_CHAN);
        switch(msg[1].toLowerCase()) {
          case '!new':
            IRC.notice_chan(from,Help.help_new,constants.IRC_CHAN);
            break;
          case '!mute':
            IRC.notice_chan(from, Help.help_mute, constants.IRC_CHAN);
            break;
          default:
            IRC.notice_chan(from,Help.none+msg[1],constants.IRC_CHAN);
            break;
        }
        IRC.notice_chan(from,Help.footer,constants.IRC_CHAN);
      }
      break;
    case '!new':
      nicklist[from]=getNick();
      IRC.notice_chan(from,"Your nick is now "+nicklist[from],constants.IRC_CHAN);
      break;
    case '!mute':
      let duration = 3600000 // 1 hour
      if (msg.length === 3) {
        duration = parseDuration(msg[2])
        if (duration === null) {
          IRC.notice_chan(from, `Couldn't parse mute duration: ${msg[2]}`, constants.IRC_CHAN);
          break;
        }
      }
      Mutes.RegisterMuteRequest(from, msg[1], duration)
      IRC.client.whois(from)
      break;
    default:
      const isMuted = Mutes.IsUserMuted(from)

      if (isMuted) {
        IRC.notice_chan(from, "You are muted.", constants.IRC_CHAN);
        break;
      }

      const buildup = IncrementBuildup(from)

      if (buildup > constants.MAX_MESSAGE_BUILDUP) {
        ClearUserBuildup(from)
        Mutes.MuteUser(from, flood_mute_time);
        break;
      }

      if(typeof nicklist[from] === 'undefined') {
        nicklist[from]=getNick();
        IRC.notice_chan(from,"Your nick is now "+nicklist[from],constants.IRC_CHAN);
      }

      IRC.say(constants.IRC_CHAN,"<"+nicklist[from]+"> "+msg.join(" "));
      break;
  }
};

// Random nick gen
function getNick() {
  let nick = uniqueNamesGenerator({ dictionaries: [animals] });
  let color = uniqueNamesGenerator({ dictionaries: [colors] });
  return color+nick+Math.floor(Math.random() * 9);
}
