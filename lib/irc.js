const irc = require('irc');
const fs = require('fs');

const constants = require('../settings.js');


class IRC {
  constructor() {
    this.client = new irc.Client(constants.IRC_SERVER,constants.IRC_NICK, {
      userName: constants.IRC_USER,
      realName: constants.IRC_GECOS,
      sasl:true,
      password:fs.readFileSync(constants.PASSWORD_FILE,'utf-8').trim(),
      channels:[constants.IRC_CHAN]
    });
    this.client.addListener('error', function(message) {
      console.log('[e]: ', message);
    });
  }
  notice(to,msg) {
    if(msg.includes("\n")) {
      msg=msg.split("\n");
      for(let i=0;i<msg.length;i++)
        this.client.send('NOTICE',to,msg[i]);
    }
    else
      this.client.send('NOTICE',to,msg);
  }
  notice_chan(to,msg,chan) {
    if(msg.includes("\n")) {
      msg=msg.split("\n");
      for(let i=0;i<msg.length;i++)
        this.client.send('NOTICE',to,'['+chan+'] '+msg[i]);
    }
    else
      this.client.send('NOTICE',to,'['+chan+'] '+msg);
  }
  whois(nick) {
    this.client.send('WHOIS',nick);
  }
  remove(chan,nick,msg) {
    this.client.send('REMOVE',chan,nick,msg);
  }
  mode(target,mode,parms) {
    this.client.send('MODE',target,mode,parms);
  }
  say(target,msg) {
    this.client.say(target,msg);
  }
  addListener(type,func) {
    this.client.addListener(type,func);
  }

}

module.exports = new IRC();
