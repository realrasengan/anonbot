const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const fs = require('fs');
const Help = require('./lib/help.js');  // help text
const constants = require('./lib/constants.js');  // constants and settings
const IRC = new (require('./lib/irc.js')).IRC();  // irc client, connected

// Hack
// TODO: Better way to ensure one instance of bot only (pid file method breaks if process exits unexpectedly)
var app = require('express')();
app.listen(22534);

// Nickslist - Stored in RAM, no logs, no leaks.
let nicklist = [];

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
    default:
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
