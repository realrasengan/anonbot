const header = `**** AnonChan Help ****`;
const footer = `**** End of Help ****`;

const help = `AnonChan lets you chat anonymously.  The following commands are available:
!NEW - Get a new identity
You can also get more information with HELP <command>
**** End of Help ****`;

const help_new = `!NEW lets you get a new identity.
Syntax: NEW
Example: NEW`;

const help_mute = `!MUTE will quiet a user
Syntax: MUTE <anonymous-nick> [<duration>]
Example: MUTE fluffybunny10 1y1w1d1h1m1s

Duration supports:
  y: years, w: weeks, d: days, m: minutes, s: seconds
`

const none = `No such command `;

module.exports = {
  header,
  footer,
  help,
  help_new,
  help_mute,
  none
}
