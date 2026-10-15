/* Runs after the original scene markup and before its animation script. */
(() => {
  let config;
  let configPath = '';
  try {
    for (const path of ['/content.json', '/public/content.json']) {
      const request = new XMLHttpRequest();
      request.open('GET', path, false);
      request.send();
      if (request.status === 200) {
        config = JSON.parse(request.responseText);
        configPath = path;
        break;
      }
    }
    if (!config) throw new Error('content.json was not found');
  } catch (error) {
    console.warn('Could not load content.json; using the original content.', error);
    return;
  }
  window.TINY_CONTENT = config;
  const name = typeof config.recipientName === 'string' ? config.recipientName.trim() : '';
  const wishes = config.greetings || {};
  const speakerName = typeof wishes['text-2'] === 'string'
    ? wishes['text-2'].trim().match(/^tớ là\s+(.+)$/i)?.[1].trim()
    : '';
  if (speakerName) document.title = document.title.replaceAll('Tiny', speakerName);
  for (let i = 1; i <= 13; i++) {
    const node = document.getElementById(`text-${i}`);
    if (!node) continue;
    const defaultText = node.innerText;
    const configured = typeof wishes[node.id] === 'string' ? wishes[node.id] : defaultText;
    const nextText = name
      ? (i === 1 && configured === 'này cậu gì ơi' ? `này ${name} ơi` : configured.replaceAll('cậu', name))
      : configured;
    if (nextText.replace(/\s+/g, ' ').trim() === defaultText.replace(/\s+/g, ' ').trim() && !name) continue;
    // Keep the original highlighted phrases and line breaks where possible.
    if (i === 5 || i === 10 || i === 12 || i === 13) {
      const original = node.innerHTML;
      const plain = node.textContent.trim().replace(/\s+/g, ' ');
      if (configured.replace(/\s+/g, ' ') === plain && name) {
        node.innerHTML = original.replaceAll('cậu', name);
        continue;
      }
    }
    node.textContent = '';
    nextText.split('\n').forEach((line, index) => {
      if (index) node.append(document.createElement('br'));
      node.append(document.createTextNode(line));
    });
  }
  const share = config.shareScene || {};
  const replaceRecipient = value => name ? value.replaceAll('cậu', name) : value;
  const heading = document.querySelector('.share-heading-original');
  if (heading && typeof share.heading === 'string') heading.firstChild.nodeValue = replaceRecipient(share.heading);
  const question = heading?.querySelector('.share-soft');
  if (question && typeof share.question === 'string') question.textContent = replaceRecipient(share.question);
  const thanks = document.querySelector('.share-heading-thanks');
  if (thanks && typeof share.thanks === 'string') thanks.textContent = replaceRecipient(share.thanks);
  const buttonWords = document.querySelector('#share-fuel-button .share-fuel-words strong');
  if (buttonWords && typeof share.button === 'string') {
    buttonWords.textContent = share.button;
    document.getElementById('share-fuel-button')?.setAttribute('aria-label', `${share.button}, sao chép liên kết và tiếp nhiên liệu cho máy bay`);
  }
  const resolveMediaPath = source => configPath.startsWith('/public/') && source.startsWith('/media/')
    ? `/public${source}` : source;
  const imageTargets = {
    twoPeople: '#anh-hai-nguoi',
    womanMobile: '#woman-complete-mobile',
  };
  for (const [key, source] of Object.entries(config.images || {})) {
    if (typeof source !== 'string' || !source.trim()) continue;
    const path = resolveMediaPath(source.trim());
    if (key === 'womanDesktop') {
      const scene = document.getElementById('woman-scene');
      if (scene) scene.style.backgroundImage = `url(${JSON.stringify(path)})`;
      continue;
    }
    let image;
    try { image = document.querySelector(imageTargets[key] || key); }
    catch { console.warn(`Không tìm thấy vị trí ảnh: ${key}`); continue; }
    if (image instanceof HTMLImageElement) image.src = path;
  }
  if (typeof config.music === 'string' && config.music.trim()) {
    const audio = document.getElementById('tiny-soundtrack');
    if (audio instanceof HTMLAudioElement) audio.src = resolveMediaPath(config.music.trim());
  }
  const manualShare = document.getElementById('share-copy-manual');
  if (manualShare instanceof HTMLAnchorElement) {
    manualShare.href = location.href;
    manualShare.textContent = location.href;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const ending = config.ending || {};
    if (speakerName && typeof ending.titleSuffix !== 'string') {
      const suffix = document.getElementById('ending-title-suffix');
      if (suffix) suffix.textContent = `cùng ${speakerName} ✦`;
    }
    const textFields = {
      titleTop: 'ending-title-top',
      titleAccent: 'ending-title-accent',
      titleSuffix: 'ending-title-suffix',
      kicker: 'ending-kicker',
      message: 'ending-message',
      description: 'ending-description',
      tiktokLabel: 'ending-tiktok-label',
      githubLabel: 'ending-github-label',
      signoff: 'ending-signoff',
    };
    for (const [key, id] of Object.entries(textFields)) {
      if (typeof ending[key] === 'string') {
        const node = document.getElementById(id);
        if (node) node.textContent = ending[key];
      }
    }
    for (const [key, id, label] of [
      ['tiktokUrl', 'ending-tiktok', 'TikTok'],
      ['githubUrl', 'ending-github', 'GitHub'],
    ]) {
      const link = document.getElementById(id);
      if (!(link instanceof HTMLAnchorElement)) continue;
      if (typeof ending[key] === 'string') {
        try {
          const url = new URL(ending[key]);
          if (url.protocol === 'https:' || url.protocol === 'http:') link.href = url.href;
        } catch { /* Keep the default link for invalid URLs. */ }
      }
      const handle = link.querySelector('small')?.textContent || '';
      link.setAttribute('aria-label', `${label} ${handle}, mở trong tab mới`);
    }
  }, { once: true });
})();
