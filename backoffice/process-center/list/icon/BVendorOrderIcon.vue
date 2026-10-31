<!--
Feature-local Lucide 1.17.0 outline subset used by the approved vendor Orders design.
Source: https://unpkg.com/lucide@1.17.0/dist/umd/lucide.js
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
<template>
  <svg
    class="b-vendor-order-icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component
      :is="node[0]"
      v-for="(node, index) in nodes"
      :key="index"
      v-bind="node[1]"
    />
  </svg>
</template>

<script lang="ts">
const icons = {
  inbox: [
    [
      "polyline",
      {
        points: "22 12 16 12 14 15 10 15 8 12 2 12",
      },
    ],
    [
      "path",
      {
        d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      },
    ],
  ],
  pause: [
    [
      "rect",
      {
        x: "14",
        y: "3",
        width: "5",
        height: "18",
        rx: "1",
      },
    ],
    [
      "rect",
      {
        x: "5",
        y: "3",
        width: "5",
        height: "18",
        rx: "1",
      },
    ],
  ],
  "credit-card": [
    [
      "rect",
      {
        width: "20",
        height: "14",
        x: "2",
        y: "5",
        rx: "2",
      },
    ],
    [
      "line",
      {
        x1: "2",
        x2: "22",
        y1: "10",
        y2: "10",
      },
    ],
  ],
  banknote: [
    [
      "rect",
      {
        width: "20",
        height: "12",
        x: "2",
        y: "6",
        rx: "2",
      },
    ],
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "2",
      },
    ],
    [
      "path",
      {
        d: "M6 12h.01M18 12h.01",
      },
    ],
  ],
  "square-x": [
    [
      "rect",
      {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
        ry: "2",
      },
    ],
    [
      "path",
      {
        d: "m15 9-6 6",
      },
    ],
    [
      "path",
      {
        d: "m9 9 6 6",
      },
    ],
  ],
  search: [
    [
      "path",
      {
        d: "m21 21-4.34-4.34",
      },
    ],
    [
      "circle",
      {
        cx: "11",
        cy: "11",
        r: "8",
      },
    ],
  ],
  "clipboard-list": [
    [
      "rect",
      {
        width: "8",
        height: "4",
        x: "8",
        y: "2",
        rx: "1",
        ry: "1",
      },
    ],
    [
      "path",
      {
        d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      },
    ],
    [
      "path",
      {
        d: "M12 11h4",
      },
    ],
    [
      "path",
      {
        d: "M12 16h4",
      },
    ],
    [
      "path",
      {
        d: "M8 11h.01",
      },
    ],
    [
      "path",
      {
        d: "M8 16h.01",
      },
    ],
  ],
  "shopping-basket": [
    [
      "path",
      {
        d: "m15 11-1 9",
      },
    ],
    [
      "path",
      {
        d: "m19 11-4-7",
      },
    ],
    [
      "path",
      {
        d: "M2 11h20",
      },
    ],
    [
      "path",
      {
        d: "m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4",
      },
    ],
    [
      "path",
      {
        d: "M4.5 15.5h15",
      },
    ],
    [
      "path",
      {
        d: "m5 11 4-7",
      },
    ],
    [
      "path",
      {
        d: "m9 11 1 9",
      },
    ],
  ],
  "circle-check": [
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "10",
      },
    ],
    [
      "path",
      {
        d: "m9 12 2 2 4-4",
      },
    ],
  ],
  package: [
    [
      "path",
      {
        d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      },
    ],
    [
      "path",
      {
        d: "M12 22V12",
      },
    ],
    [
      "polyline",
      {
        points: "3.29 7 12 12 20.71 7",
      },
    ],
    [
      "path",
      {
        d: "m7.5 4.27 9 5.15",
      },
    ],
  ],
  truck: [
    [
      "path",
      {
        d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
      },
    ],
    [
      "path",
      {
        d: "M15 18H9",
      },
    ],
    [
      "path",
      {
        d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      },
    ],
    [
      "circle",
      {
        cx: "17",
        cy: "18",
        r: "2",
      },
    ],
    [
      "circle",
      {
        cx: "7",
        cy: "18",
        r: "2",
      },
    ],
  ],
  "check-check": [
    [
      "path",
      {
        d: "M18 6 7 17l-5-5",
      },
    ],
    [
      "path",
      {
        d: "m22 10-7.5 7.5L13 16",
      },
    ],
  ],
  check: [
    [
      "path",
      {
        d: "M20 6 9 17l-5-5",
      },
    ],
  ],
  link: [
    [
      "path",
      {
        d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      },
    ],
    [
      "path",
      {
        d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      },
    ],
  ],
  download: [
    [
      "path",
      {
        d: "M12 15V3",
      },
    ],
    [
      "path",
      {
        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
      },
    ],
    [
      "path",
      {
        d: "m7 10 5 5 5-5",
      },
    ],
  ],
  "user-round": [
    [
      "circle",
      {
        cx: "12",
        cy: "8",
        r: "5",
      },
    ],
    [
      "path",
      {
        d: "M20 21a8 8 0 0 0-16 0",
      },
    ],
  ],
  "message-circle": [
    [
      "path",
      {
        d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      },
    ],
  ],
  "loader-circle": [
    [
      "path",
      {
        d: "M21 12a9 9 0 1 1-6.219-8.56",
      },
    ],
  ],
  x: [
    [
      "path",
      {
        d: "M18 6 6 18",
      },
    ],
    [
      "path",
      {
        d: "m6 6 12 12",
      },
    ],
  ],
  laptop: [
    [
      "path",
      {
        d: "M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z",
      },
    ],
    [
      "path",
      {
        d: "M20.054 15.987H3.946",
      },
    ],
  ],
  "list-checks": [
    [
      "path",
      {
        d: "M13 5h8",
      },
    ],
    [
      "path",
      {
        d: "M13 12h8",
      },
    ],
    [
      "path",
      {
        d: "M13 19h8",
      },
    ],
    [
      "path",
      {
        d: "m3 17 2 2 4-4",
      },
    ],
    [
      "path",
      {
        d: "m3 7 2 2 4-4",
      },
    ],
  ],
  "chevron-right": [
    [
      "path",
      {
        d: "m9 18 6-6-6-6",
      },
    ],
  ],
  "arrow-up-down": [
    [
      "path",
      {
        d: "m21 16-4 4-4-4",
      },
    ],
    [
      "path",
      {
        d: "M17 20V4",
      },
    ],
    [
      "path",
      {
        d: "m3 8 4-4 4 4",
      },
    ],
    [
      "path",
      {
        d: "M7 4v16",
      },
    ],
  ],
  "rotate-ccw": [
    [
      "path",
      {
        d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
      },
    ],
    [
      "path",
      {
        d: "M3 3v5h5",
      },
    ],
  ],
  "wallet-cards": [
    [
      "rect",
      {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
      },
    ],
    [
      "path",
      {
        d: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2",
      },
    ],
    [
      "path",
      {
        d: "M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21",
      },
    ],
  ],
  landmark: [
    [
      "path",
      {
        d: "M10 18v-7",
      },
    ],
    [
      "path",
      {
        d: "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z",
      },
    ],
    [
      "path",
      {
        d: "M14 18v-7",
      },
    ],
    [
      "path",
      {
        d: "M18 18v-7",
      },
    ],
    [
      "path",
      {
        d: "M3 22h18",
      },
    ],
    [
      "path",
      {
        d: "M6 18v-7",
      },
    ],
  ],
  "receipt-text": [
    [
      "path",
      {
        d: "M13 16H8",
      },
    ],
    [
      "path",
      {
        d: "M14 8H8",
      },
    ],
    [
      "path",
      {
        d: "M16 12H8",
      },
    ],
    [
      "path",
      {
        d: "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",
      },
    ],
  ],
  "map-pin": [
    [
      "path",
      {
        d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      },
    ],
    [
      "circle",
      {
        cx: "12",
        cy: "10",
        r: "3",
      },
    ],
  ],
  pencil: [
    [
      "path",
      {
        d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      },
    ],
    [
      "path",
      {
        d: "m15 5 4 4",
      },
    ],
  ],
  "scan-line": [
    [
      "path",
      {
        d: "M3 7V5a2 2 0 0 1 2-2h2",
      },
    ],
    [
      "path",
      {
        d: "M17 3h2a2 2 0 0 1 2 2v2",
      },
    ],
    [
      "path",
      {
        d: "M21 17v2a2 2 0 0 1-2 2h-2",
      },
    ],
    [
      "path",
      {
        d: "M7 21H5a2 2 0 0 1-2-2v-2",
      },
    ],
    [
      "path",
      {
        d: "M7 12h10",
      },
    ],
  ],
  history: [
    [
      "path",
      {
        d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
      },
    ],
    [
      "path",
      {
        d: "M3 3v5h5",
      },
    ],
    [
      "path",
      {
        d: "M12 7v5l4 2",
      },
    ],
  ],
  navigation: [
    [
      "polygon",
      {
        points: "3 11 22 2 13 21 11 13 3 11",
      },
    ],
  ],
  "sliders-horizontal": [
    [
      "path",
      {
        d: "M10 5H3",
      },
    ],
    [
      "path",
      {
        d: "M12 19H3",
      },
    ],
    [
      "path",
      {
        d: "M14 3v4",
      },
    ],
    [
      "path",
      {
        d: "M16 17v4",
      },
    ],
    [
      "path",
      {
        d: "M21 12h-9",
      },
    ],
    [
      "path",
      {
        d: "M21 19h-5",
      },
    ],
    [
      "path",
      {
        d: "M21 5h-7",
      },
    ],
    [
      "path",
      {
        d: "M8 10v4",
      },
    ],
    [
      "path",
      {
        d: "M8 12H3",
      },
    ],
  ],
  save: [
    [
      "path",
      {
        d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      },
    ],
    [
      "path",
      {
        d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
      },
    ],
    [
      "path",
      {
        d: "M7 3v4a1 1 0 0 0 1 1h7",
      },
    ],
  ],
  info: [
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "10",
      },
    ],
    [
      "path",
      {
        d: "M12 16v-4",
      },
    ],
    [
      "path",
      {
        d: "M12 8h.01",
      },
    ],
  ],
  ban: [
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "10",
      },
    ],
    [
      "path",
      {
        d: "M4.929 4.929 19.07 19.071",
      },
    ],
  ],
  "package-open": [
    [
      "path",
      {
        d: "M12 22v-9",
      },
    ],
    [
      "path",
      {
        d: "M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z",
      },
    ],
    [
      "path",
      {
        d: "M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13",
      },
    ],
    [
      "path",
      {
        d: "M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z",
      },
    ],
  ],
  "package-check": [
    [
      "path",
      {
        d: "M12 22V12",
      },
    ],
    [
      "path",
      {
        d: "m16 17 2 2 4-4",
      },
    ],
    [
      "path",
      {
        d: "M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753",
      },
    ],
    [
      "path",
      {
        d: "M3.29 7 12 12l8.71-5",
      },
    ],
    [
      "path",
      {
        d: "m7.5 4.27 8.997 5.148",
      },
    ],
  ],
  scale: [
    [
      "path",
      {
        d: "M12 3v18",
      },
    ],
    [
      "path",
      {
        d: "m19 8 3 8a5 5 0 0 1-6 0zV7",
      },
    ],
    [
      "path",
      {
        d: "M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1",
      },
    ],
    [
      "path",
      {
        d: "m5 8 3 8a5 5 0 0 1-6 0zV7",
      },
    ],
    [
      "path",
      {
        d: "M7 21h10",
      },
    ],
  ],
  store: [
    [
      "path",
      {
        d: "M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5",
      },
    ],
    [
      "path",
      {
        d: "M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",
      },
    ],
    [
      "path",
      {
        d: "M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05",
      },
    ],
  ],
  "arrow-up-right": [
    [
      "path",
      {
        d: "M7 7h10v10",
      },
    ],
    [
      "path",
      {
        d: "M7 17 17 7",
      },
    ],
  ],
  "chevron-down": [
    [
      "path",
      {
        d: "m6 9 6 6 6-6",
      },
    ],
  ],
  circle: [
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "10",
      },
    ],
  ],
  minus: [
    [
      "path",
      {
        d: "M5 12h14",
      },
    ],
  ],
  plus: [
    [
      "path",
      {
        d: "M5 12h14",
      },
    ],
    [
      "path",
      {
        d: "M12 5v14",
      },
    ],
  ],
  ruler: [
    [
      "path",
      {
        d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
      },
    ],
    [
      "path",
      {
        d: "m14.5 12.5 2-2",
      },
    ],
    [
      "path",
      {
        d: "m11.5 9.5 2-2",
      },
    ],
    [
      "path",
      {
        d: "m8.5 6.5 2-2",
      },
    ],
    [
      "path",
      {
        d: "m17.5 15.5 2-2",
      },
    ],
  ],
  weight: [
    [
      "circle",
      {
        cx: "12",
        cy: "5",
        r: "3",
      },
    ],
    [
      "path",
      {
        d: "M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z",
      },
    ],
  ],
  phone: [
    [
      "path",
      {
        d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      },
    ],
  ],
  copy: [
    [
      "rect",
      {
        width: "14",
        height: "14",
        x: "8",
        y: "8",
        rx: "2",
        ry: "2",
      },
    ],
    [
      "path",
      {
        d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
      },
    ],
  ],
  clock: [
    [
      "circle",
      {
        cx: "12",
        cy: "12",
        r: "10",
      },
    ],
    [
      "path",
      {
        d: "M12 6v6l4 2",
      },
    ],
  ],
  zap: [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      },
    ],
  ],
};

export default {
  name: "BVendorOrderIcon",
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 16 },
    strokeWidth: { type: Number, default: 1.7 },
  },
  computed: {
    nodes() {
      return icons[this.name] || [];
    },
  },
};
</script>

<style scoped>
.b-vendor-order-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
