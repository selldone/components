/**
 * Starter loading screens for custom domains: inline HTML and CSS only, with no
 * external files or scripts, and a static reduced-motion state. When a sample is
 * picked, {{name}} and {{loading}} become escaped shop and status text.
 */
const FONT = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const SR_ONLY = `.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`;

export const DOMAIN_LOADING_SAMPLES = [
  {
    id: "pulse",
    head: `<style>
  /* Change these colors to match your brand. */
  :root { --accent: #0061e0; --text: #15171c; --background: #ffffff; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: var(--background);
    color: var(--text);
    font: 600 clamp(20px, 4vw, 28px)/1.3 ${FONT};
  }
  .loader { display: grid; justify-items: center; gap: 20px; padding: 24px; text-align: center; }
  .dots { display: flex; gap: 8px; }
  .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
  .dots i:nth-child(2) { animation-delay: 0.15s; }
  .dots i:nth-child(3) { animation-delay: 0.3s; }
  @keyframes pulse { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.7); } 40% { opacity: 1; transform: scale(1); } }
  ${SR_ONLY}
  @media (prefers-reduced-motion: reduce) { .dots i { animation: none; opacity: 0.6; } }
</style>`,
    body: `<div class="loader" role="status">
  <div dir="auto">{{name}}</div>
  <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
  <span class="sr-only">{{loading}}</span>
</div>`,
  },
  {
    id: "ring",
    head: `<style>
  /* Change these colors to match your brand. */
  :root { --accent: #0061e0; --track: #e6e8ec; --text: #5b616e; --background: #ffffff; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: var(--background);
    color: var(--text);
    font: 500 14px/1.5 ${FONT};
  }
  .loader { display: grid; justify-items: center; gap: 16px; }
  .ring { box-sizing: border-box; width: 40px; height: 40px; border: 3px solid var(--track); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .ring { animation: none; } }
</style>`,
    body: `<div class="loader" role="status">
  <div class="ring" aria-hidden="true"></div>
  <div dir="auto">{{loading}}</div>
</div>`,
  },
  {
    id: "bar",
    head: `<style>
  /* Change these colors to match your brand. */
  :root { --accent: #0061e0; --track: #e9ecf1; --text: #15171c; --background: #ffffff; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: var(--background);
    color: var(--text);
    font: 600 clamp(18px, 3.4vw, 24px)/1.3 ${FONT};
  }
  .bar { position: fixed; inset: 0 0 auto; height: 3px; overflow: hidden; background: var(--track); }
  .bar::after { content: ""; position: absolute; inset: 0; width: 35%; border-radius: 3px; background: var(--accent); animation: slide 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
  ${SR_ONLY}
  @media (prefers-reduced-motion: reduce) { .bar::after { animation: none; width: 100%; opacity: 0.4; } }
</style>`,
    body: `<div class="bar" aria-hidden="true"></div>
<div role="status">
  <div dir="auto">{{name}}</div>
  <span class="sr-only">{{loading}}</span>
</div>`,
  },
  {
    id: "skeleton",
    head: `<style>
  /* Shaped like the default storefront; one light sweep animates the whole page. */
  :root { --block: #eceef1; --background: #ffffff; }
  html, body { margin: 0; overflow: hidden; background: var(--background); }
  .page { padding: 0 16px; }
  .page i { display: block; border-radius: 8px; background: var(--block); }
  .top { display: flex; align-items: center; gap: 14px; height: 64px; }
  .top .logo { flex: none; width: 44px; height: 44px; border-radius: 12px; }
  .top .name { width: 110px; height: 16px; }
  .top .search { flex: 0 1 620px; height: 44px; margin: 0 auto; border-radius: 10px; }
  .icons { display: flex; gap: 18px; margin-inline-start: auto; }
  .icons i { width: 30px; height: 30px; }
  .menu { display: flex; justify-content: center; align-items: center; gap: 32px; height: 56px; }
  .menu i { width: 72px; height: 12px; }
  .cats { display: flex; gap: 20px; margin: 36px 0 44px; overflow: hidden; }
  .cats i { flex: none; width: 257px; height: 330px; border-radius: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .grid i { aspect-ratio: 309 / 360; background: linear-gradient(var(--block) 0 0) top / 100% 62% no-repeat, linear-gradient(var(--block) 0 0) 6% 79% / 64% 12px no-repeat, linear-gradient(var(--block) 0 0) 94% 94% / 30% 16px no-repeat; }
  .page::after { content: ""; position: fixed; inset: 0 auto 0 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent); animation: sweep 1.6s ease-in-out infinite; }
  @keyframes sweep { from { transform: translateX(-100%); } to { transform: translateX(350%); } }
  ${SR_ONLY}
  @media (max-width: 1263px) {
    .top { flex-wrap: wrap; height: auto; padding-top: 10px; row-gap: 12px; }
    .top .search { order: 1; flex: 1 0 100%; height: 48px; }
  }
  @media (max-width: 599px) {
    .page { padding: 0 8px; }
    .top .name, .top .search, .menu, .icons i:nth-child(n + 3) { display: none; }
    .cats { gap: 14px; margin: 18px 0 28px; }
    .cats i { width: 100px; height: 132px; border-radius: 0; background: radial-gradient(circle at 50% 50px, var(--block) 49px, transparent 50px), linear-gradient(var(--block) 0 0) 50% 100% / 64% 10px no-repeat; }
    .grid { grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .grid i { aspect-ratio: 1; }
  }
  @media (prefers-reduced-motion: reduce) { .page::after { display: none; } }
</style>`,
    body: `<div class="page" role="status">
  <div class="top"><i class="logo"></i><i class="name"></i><i class="search"></i><span class="icons"><i></i><i></i><i></i><i></i></span></div>
  <div class="menu"><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="cats"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <span class="sr-only">{{loading}}</span>
</div>`,
  },
  {
    id: "bag",
    head: `<style>
  /* Change these colors to match your brand. */
  :root { --accent: #0061e0; --text: #15171c; --background: #ffffff; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: var(--background);
    color: var(--text);
    font: 600 clamp(18px, 3.4vw, 24px)/1.3 ${FONT};
  }
  .loader { display: grid; justify-items: center; text-align: center; }
  .bag { width: 56px; height: 56px; fill: none; stroke: var(--accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; animation: hop 1.1s ease-in-out infinite; }
  .shadow { width: 36px; height: 6px; margin: 6px 0 22px; border-radius: 50%; background: rgba(0, 0, 0, 0.12); animation: shadow 1.1s ease-in-out infinite; }
  @keyframes hop { 50% { transform: translateY(-10px); } }
  @keyframes shadow { 50% { transform: scaleX(0.6); opacity: 0.5; } }
  ${SR_ONLY}
  @media (prefers-reduced-motion: reduce) { .bag, .shadow { animation: none; } }
</style>`,
    body: `<div class="loader" role="status">
  <svg class="bag" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 17h30l-2.4 22.6a3 3 0 0 1-3 2.7H14.4a3 3 0 0 1-3-2.7z" />
    <path d="M17 17v-3a7 7 0 0 1 14 0v3" />
  </svg>
  <div class="shadow" aria-hidden="true"></div>
  <div dir="auto">{{name}}</div>
  <span class="sr-only">{{loading}}</span>
</div>`,
  },
  {
    id: "midnight",
    head: `<style>
  /* A dark screen with a soft light sweep over your store name. */
  :root { --text: #f4f5f7; --muted: #5d6270; --background: #0c0e13; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: var(--background);
    color: var(--text);
    font: 600 clamp(22px, 4.4vw, 34px)/1.25 ${FONT};
    letter-spacing: -0.01em;
  }
  .loader { display: grid; justify-items: center; gap: 18px; padding: 24px; text-align: center; }
  .name { background: linear-gradient(90deg, var(--muted) 30%, var(--text) 50%, var(--muted) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: sweep 2.4s linear infinite; }
  .line { position: relative; width: 72px; height: 2px; overflow: hidden; border-radius: 2px; background: var(--muted); }
  .line::after { content: ""; position: absolute; inset: 0; width: 40%; background: var(--text); animation: slide 1.6s ease-in-out infinite; }
  @keyframes sweep { from { background-position: 100% 0; } to { background-position: 0 0; } }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
  ${SR_ONLY}
  @media (prefers-reduced-motion: reduce) { .name { animation: none; background: none; color: var(--text); } .line::after { animation: none; width: 100%; } }
</style>`,
    body: `<div class="loader" role="status">
  <div class="name" dir="auto">{{name}}</div>
  <div class="line" aria-hidden="true"></div>
  <span class="sr-only">{{loading}}</span>
</div>`,
  },
];
