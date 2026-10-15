import fs from 'node:fs/promises';
const original = await fs.readFile('reference/original.html', 'utf8');
const endingCss = await fs.readFile('public/ending.css', 'utf8');
const contentLoader = await fs.readFile('public/content-loader.js', 'utf8');
const content = JSON.parse(await fs.readFile('public/content.json', 'utf8'));
const speakerName = typeof content.greetings?.['text-2'] === 'string'
  ? content.greetings['text-2'].trim().match(/^tớ là\s+(.+)$/i)?.[1].trim()
  : '';
const endingSuffix = typeof content.ending?.titleSuffix === 'string'
  ? content.ending.titleSuffix
  : `cùng ${speakerName || 'Tiny'} ✦`;
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
let fontCss = await fs.readFile('public/fonts.css', 'utf8');
for (const file of ['courier-prime-1.woff2', 'courier-prime-2.woff2']) {
  const font = await fs.readFile(`public/fonts/${file}`);
  fontCss = fontCss.replace(`/fonts/${file}`, `data:font/woff2;base64,${font.toString('base64')}`);
}
const marker = /(<script>\s*const text1 = document\.getElementById\('text-1'\);)/;
if (!marker.test(original)) throw new Error('Reference script marker changed');
const shopStart = original.indexOf('<section id="tiny-shop-scene"');
const shopDisplay = original.indexOf('  <div class="shop-display">', shopStart);
const shopEnd = original.indexOf('</section>', shopDisplay) + '</section>'.length;
if (shopStart < 0 || shopDisplay < 0 || shopEnd < 10) throw new Error('Reference ending marker changed');
const originalDecor = original.slice(shopStart, shopDisplay);
const personalDecor = originalDecor
  .replace('<section id="tiny-shop-scene"', '<section id="tiny-shop-scene" class="creator-ending"')
  .replace('aria-label="Gian hàng ủng hộ Tiny"', 'aria-label="Lời kết và liên kết cá nhân"')
  .replace(/<h2 class="shop-heading">[\s\S]*?<\/h2>/, `<h2 class="shop-heading"><span id="ending-title-top">cảm ơn cậu đã</span><span><em id="ending-title-accent">ở đây</em> <span id="ending-title-suffix">${escapeHtml(endingSuffix)}</span></span></h2>`);
const personalEnding = `${personalDecor}
  <main class="creator-panel" aria-label="Kết nối với người tạo trang">
    <span class="creator-panel-star" aria-hidden="true">✦</span>
    <p class="creator-kicker" id="ending-kicker">một lời nhắn nhỏ</p>
    <h3 id="ending-message">câu chuyện chưa kết thúc đâu...</h3>
    <p class="creator-description" id="ending-description">Nếu cậu muốn gặp lại tớ, ghé qua một trong hai góc nhỏ này nhé.</p>
    <nav class="creator-links" aria-label="Mạng xã hội của người tạo trang">
      <a class="creator-link creator-tiktok" id="ending-tiktok" href="https://www.tiktok.com/@congabuon" target="_blank" rel="noopener noreferrer" aria-label="TikTok @congabuon, mở trong tab mới">
        <span class="creator-link-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M19.1 3.5v16.8a6.5 6.5 0 1 1-5.4-6.4v4.2a2.6 2.6 0 1 0 1.4 2.2V3.5h4c.5 3.5 2.6 5.6 6.8 5.8v4.1c-2.9 0-5.2-1.1-6.8-2.7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="creator-link-copy"><strong>TikTok</strong><small id="ending-tiktok-label">@congabuon</small></span><span class="creator-link-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="creator-link creator-github" id="ending-github" href="https://github.com/Kakajshd" target="_blank" rel="noopener noreferrer" aria-label="GitHub Kakajshd, mở trong tab mới">
        <span class="creator-link-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 3.8a12.2 12.2 0 0 0-3.86 23.77c.61.11.83-.26.83-.59v-2.12c-3.38.74-4.09-1.44-4.09-1.44-.55-1.41-1.35-1.78-1.35-1.78-1.1-.75.09-.74.09-.74 1.22.09 1.86 1.25 1.86 1.25 1.09 1.86 2.86 1.32 3.56 1.01.11-.79.42-1.32.77-1.63-2.7-.31-5.54-1.35-5.54-6.02 0-1.33.47-2.42 1.25-3.28-.13-.3-.54-1.55.12-3.23 0 0 1.03-.33 3.36 1.25a11.7 11.7 0 0 1 6.12 0c2.33-1.58 3.35-1.25 3.35-1.25.67 1.68.25 2.93.12 3.23.78.86 1.25 1.95 1.25 3.28 0 4.68-2.84 5.7-5.55 6.01.43.37.82 1.08.82 2.18v3.24c0 .33.22.71.84.59A12.2 12.2 0 0 0 16 3.8Z" fill="currentColor"/></svg></span>
        <span class="creator-link-copy"><strong>GitHub</strong><small id="ending-github-label">Kakajshd</small></span><span class="creator-link-arrow" aria-hidden="true">↗</span>
      </a>
    </nav>
    <p class="creator-signoff" id="ending-signoff">hẹn gặp lại ở những câu chuyện tiếp theo ♡</p>
  </main>
</section>`;
const withPersonalEnding = original.slice(0, shopStart) + personalEnding + original.slice(shopEnd);
const html = withPersonalEnding
  .replace('<title>Sự thức giấc của Tiny - Ngày 20/10</title>', `<title>Sự thức giấc của ${escapeHtml(speakerName || 'Tiny')} - Ngày 20/10</title>`)
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<link rel="icon" href="data:,">')
  .replace('<link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">', `<style>${fontCss}</style>`)
  .replace('</head>', `<style>${endingCss}</style></head>`)
  .replace("const SHARE_FLIGHT_URL = 'https://20-10-vuive.kazvndc-edu.workers.dev/';", "const SHARE_FLIGHT_URL = location.href;")
  .replace('href="https://20-10-vuive.kazvndc-edu.workers.dev/" target="_blank"', 'href="/" target="_blank"')
  .replace('const v = Math.min(1, (now - musicResumeFadeStart) / 850);', 'const v = Math.max(0, Math.min(1, (now - musicResumeFadeStart) / 850));')
  .replace(/const lyricCues = (\[[^\r\n]*\]);/, (_, originalCues) => `const originalLyricCues = ${originalCues};
        const configuredLyrics = window.TINY_CONTENT?.lyrics;
        const lyricCues = Array.isArray(configuredLyrics)
            ? configuredLyrics.filter(cue => cue && typeof cue.time === 'number' && Number.isFinite(cue.time) && cue.time >= 0 && typeof cue.text === 'string')
                .map(cue => ({time:cue.time,text:cue.text})).sort((a,b) => a.time - b.time)
            : originalLyricCues;`)
  .replace('const MUSIC_HOLD_TIME = 9.7;', `const musicTiming = window.TINY_CONTENT?.musicTiming || {};
        const MUSIC_HOLD_TIME = typeof musicTiming.holdAt === 'number' && Number.isFinite(musicTiming.holdAt)
            ? Math.max(.5, musicTiming.holdAt) : 9.7;`)
  .replace('const MUSIC_FADE_START = 8.35;', `const MUSIC_FADE_START = Math.max(0, MUSIC_HOLD_TIME - (
            typeof musicTiming.fadeDuration === 'number' && Number.isFinite(musicTiming.fadeDuration)
                ? Math.max(.05, musicTiming.fadeDuration) : 1.35));`)
  .replace('const MUSIC_VOLUME = 0.84;', `const MUSIC_VOLUME = typeof musicTiming.volume === 'number' && Number.isFinite(musicTiming.volume)
            ? Math.max(0, Math.min(1, musicTiming.volume)) : .84;`)
  .replace(marker, `<script>${contentLoader}</script>\n    $1`);
await fs.writeFile('index.html', html);
console.log(`Wrote index.html: ${Buffer.byteLength(html)} bytes`);
