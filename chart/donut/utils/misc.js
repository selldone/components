/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

const legendGap = '1em';

export const defaultColor = 'dodgerblue';

export const placement = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
};

export const placementStyles = {
  [placement.TOP]: {
    container: { flexDirection: 'column' },
    legend: { order: -1, margin: 0, marginBottom: legendGap }
  },
  [placement.RIGHT]: {
    container: {},
    legend: {
      flexDirection: 'column',
      margin: 0,
      marginLeft: legendGap
    }
  },
  [placement.BOTTOM]: {
    container: { flexDirection: 'column' },
    legend: {}
  },
  [placement.LEFT]: {
    container: {},
    legend: {
      flexDirection: 'column',
      order: -1,
      margin: 0,
      marginRight: legendGap
    }
  }
};

const isObject = obj => !!obj && obj.constructor === Object;

const sectionKeys = [
  { type: 'number', key: 'value', required: true },
  { key: 'label' },
  { key: 'color' }
];

export function sectionValidator(section) {
  if (!isObject(section)) return false;

  return sectionKeys.reduce((acc, curr) => {
    if (!acc) return false;

    let valid = true;
    if (curr.required) valid = valid && Object.hasOwnProperty.call(section, curr.key);
    if (curr.type) valid = valid && typeof section[curr.key] === curr.type;
    return acc && valid;
  }, true);
}
