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
  sel.removeAllRanges();
  sel.addRange(range);
}

function dataURItoBlob(dataURI) {
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
