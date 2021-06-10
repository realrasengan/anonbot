// Password
const PASSWORD_FILE = "/home/shellsuser/Software/anonbot/.password";

// IRC
const IRC_SERVER = "chat.freenode.net";
const IRC_NICK = "AnonChan";
const IRC_USER = "anonchan";
const IRC_GECOS = "Anonymous Channel";
const IRC_CHAN = "#anonchan";

const MODERATOR_HOSTMASKS = [
    'freenode/helper/',
    'freenode/staff/',
]

/* Flood protection

- For every message sent, user buildup increases.
- Build up decays over time.
- Too much buildup results in a mute of the configured duration
*/
const MAX_MESSAGE_BUILDUP = 4
const BUILDUP_DECAY_RATE = "1s"
const FLOOD_MUTE_TIME = "3h"

module.exports = {
  PASSWORD_FILE,
  IRC_SERVER,
  IRC_NICK,
  IRC_USER,
  IRC_GECOS,
  IRC_CHAN,
  MODERATOR_HOSTMASKS,
  MAX_MESSAGE_BUILDUP,
  BUILDUP_DECAY_RATE,
  FLOOD_MUTE_TIME,
}

