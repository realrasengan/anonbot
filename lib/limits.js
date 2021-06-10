const parseDuration = require('parse-duration')

const settings = require('../settings')


const buildup_map = new Map()
const timeout_map = new Map()
const decay_rate =
  parseDuration(settings.BUILDUP_DECAY_RATE) || settings.BUILDUP_DECAY_RATE


const SetTimeout = (nick) => {
  CancelTimeout(nick)
  const timeout = setTimeout(DecrementBuildup, decay_rate, nick)
  timeout_map.set(nick, timeout)
}

const CancelTimeout = (nick) => {
  const timeout = timeout_map.get(nick)
  if (timeout) {
    clearTimeout(timeout)
  }
}

const IsUserFlooded = (nick) =>
    GetUserBuildup(nick) > settings.MAX_MESSAGE_BUILDUP;

const GetUserBuildup =
  (nick) => buildup_map.get(nick) || 0

const SetUserBuildup = (nick, buildup) => {
  if (buildup <= 0) {
    ClearUserBuildup(nick)
  } else {
    buildup_map.set(nick, buildup)}
  }

const ClearUserBuildup = (nick) => {
    buildup_map.delete(nick)
    clearTimeout(nick)
}

const IncrementBuildup = (nick) => {
  let buildup = GetUserBuildup(nick)
  buildup += 1
  SetUserBuildup(nick, buildup)
  SetTimeout(nick)
  console.log(`${nick}++ ${buildup}`)
  return buildup
}

const DecrementBuildup = (nick) => {
  let buildup = GetUserBuildup(nick)
  buildup = Math.max(0, buildup - 1)
  if (buildup === 0) {
    ClearUserBuildup(nick)
  } else {
    SetUserBuildup(nick, buildup)
    SetTimeout(nick)
  }
  console.log(`${nick}-- ${buildup}`)
  return buildup
}

module.exports = {
  IsUserFlooded,
  GetUserBuildup,
  SetUserBuildup,
  ClearUserBuildup,
  CancelTimeout,
  SetTimeout,
  IncrementBuildup,
  DecrementBuildup,
}