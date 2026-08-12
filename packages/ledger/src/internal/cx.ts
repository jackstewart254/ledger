// internal — join conditional class names. Not exported from the barrel.
export const cx = (...parts: Array<string | false | undefined>): string =>
  parts.filter(Boolean).join(" ");
