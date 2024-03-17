const keyMirror = <T extends string>(keys: T[]): { [K in T]: K } =>
    keys.reduce<{ [K in T]: K }>((acc, k) => {
      acc[k] = k;
      return acc;
    }, {} as { [K in T]: K });

export const events = keyMirror([
  "drag",
  "dragend",
  "dragenter",
  "dragleave",
  "dragstart",
  "dragover",
  "drop",
]);

export const dropEffects = keyMirror(["copy", "move", "link", "none"]);

export const effectsAllowed = keyMirror([
  "none",
  "copy",
  "copyLink",
  "copyMove",
  "link",
  "linkMove",
  "move",
  "all",
  "uninitialized",
]);
