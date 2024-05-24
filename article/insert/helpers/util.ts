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

/**
 * Placing caret to element and selected position
 *
 * @param {Element} el
 * @param {integer} position
 * @return {void}
 */

function placeCaret(el: Element, position: number) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(el.childNodes[0], position);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  const byteString = atob(dataURI.split(",")[1]),
    // separate out the mime component
    mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0],
    // write the bytes of the string to an ArrayBuffer
    arrayBuffer = new ArrayBuffer(byteString.length),
    _ia = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i);
  }

  const dataView = new DataView(arrayBuffer);
  return new Blob([dataView], { type: mimeString });
}
