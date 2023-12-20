import * as moment from 'moment';

export function logInfo(message: string) {
  console.log(logFormat(ConsoleColor.FgGreen, 'INFO', message));
}

export function logWarn(message: string) {
  console.log(logFormat(ConsoleColor.FgYellow, 'WARN', message));
}

export function logError(message: string) {
  console.log(logFormat(ConsoleColor.FgRed, 'ERROR', message));
}

export function logDebug(message: string) {
  let environment = process.env.ENV;
  if (environment !== 'production') {
    console.log(logFormat(ConsoleColor.FgBlue, 'DEBUG', message));
  }
}

function logFormat(color, level, message: string): string {
  const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');

  return `${color}[${level}]${ConsoleColor.Reset}\t- ${timestamp} -\t${message}`;
}

enum ConsoleColor {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}
