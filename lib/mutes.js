const constants = require('../settings.js');
const IRC = require('./irc.js');


class MuteRequest {
    constructor(requester_nick, muted_nick, duration) {
        this.requester_nick = requester_nick
        this.muted_nick = muted_nick
        this.duration = duration
    }
}

let pending_mutes = new Set()
let muted = new Set();

const RegisterMuteRequest = (from, to, duration) => {
    const request = new MuteRequest(from, to, duration)
    pending_mutes.add(request)
}

const IsUserMuted = (nick) => {
    return muted.has(nick.toLowerCase())
}

const MuteUser = (nick, duration) => {
  if (IsUserMuted(nick)) return
  const clean_nick = nick.toLowerCase()
  muted.add(clean_nick)
  setTimeout(ExpireMute, duration, clean_nick)
  IRC.notice_chan(clean_nick, "You have been muted.", constants.IRC_CHAN);
}

const ExpireMute = (nick) => {
  if (IsUserMuted(nick)) {
    muted.delete(nick)
    IRC.notice_chan(nick, "You have been unmuted.", constants.IRC_CHAN)
  }
}

const HandleMuteWhois = (nicklist, nick, host) => {
    // find pending mute requests that match incoming whois info by nick of requester
    let request = null;
    for (const pending_request of pending_mutes.values()) {
        if (pending_request.requester_nick === nick) {
            request = pending_request;
            pending_mutes.delete(pending_request);
        }
    }

    // bail if whois nick has no pending mute request
    if (request === null) {
        return;
    }

    // check if matched requester has an approved hostmask
    for (const prefix of constants.MODERATOR_HOSTMASKS) {
        if (`${prefix}${nick}` === host) {
          // find the real nickname of the requested anonymous nick to mute
          for (const [real_nick, anon_nick] of Object.entries(nicklist)) {
              if (anon_nick === request.muted_nick) {
                MuteUser(real_nick, request.duration)
              }
          }
        }
    }
}

module.exports = {
    MuteRequest,
    MuteUser,
    IsUserMuted,
    RegisterMuteRequest,
    HandleMuteWhois,
    ExpireMute,
};