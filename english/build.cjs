// Builds Hyunju's English practice files from english/data/dayNN.json.
//
//   NODE_PATH=$(npm root -g) node english/build.cjs            # latest day + word book
//   NODE_PATH=$(npm root -g) node english/build.cjs 3 7        # days 3 and 7 + word book
//   NODE_PATH=$(npm root -g) node english/build.cjs all        # every day + word book
//   ... --preview <dir>                                       # also save PNG previews there
//
// Outputs (english/output/):
//   scripts/Hyunju_Script_DayNN_Slug.pdf   phone-width chat-bubble script, one page per day
//   vocab/Hyunju_Vocab_DayAA-BB.pdf        cumulative word book (older word books are removed)
//   audio/DayNN_Slug.txt                   one line per speaker turn, for ElevenLabs Dialogue mode

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const TPL = path.join(ROOT, 'templates');
const OUT = path.join(ROOT, 'output');
const pad = n => String(n).padStart(2, '0');

function loadDays() {
  return fs.readdirSync(DATA)
    .filter(f => /^day\d+\.json$/.test(f))
    .map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')))
    .sort((a, b) => a.day - b.day);
}

function parseArgs(argv, days) {
  let preview = null;
  const picks = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--preview') preview = argv[++i];
    else picks.push(argv[i]);
  }
  let targets;
  if (picks.includes('all')) targets = days;
  else if (picks.length) targets = picks.map(n => {
    const d = days.find(x => x.day === Number(n));
    if (!d) throw new Error(`english/data/day${pad(n)}.json not found`);
    return d;
  });
  else targets = [days[days.length - 1]];
  return { targets, preview };
}

// Renders a template page, hands it the data, and prints #page as one tall PDF page.
async function renderPdf(browser, template, payload, pdfPath, previewPath) {
  const page = await browser.newPage({ viewport: { width: 416, height: 800 } });
  await page.goto('file://' + path.join(TPL, template), { waitUntil: 'load' });
  await page.evaluate(p => render(p), payload);
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.getElementById('page').getBoundingClientRect().height);
  await page.pdf({ path: pdfPath, width: '110mm', height: Math.ceil(height + 2) + 'px',
    printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  if (previewPath) await page.locator('#page').screenshot({ path: previewPath });
  await page.close();
}

function audioScript(d) {
  return d.lines.map(l => `${l.role === 'me' ? '🔴' : '🔵'} ${l.en}`).join('\n') + '\n';
}

(async () => {
  const days = loadDays();
  if (!days.length) throw new Error('no english/data/dayNN.json files');
  const { targets, preview } = parseArgs(process.argv.slice(2), days);
  for (const dir of ['scripts', 'vocab', 'audio']) fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  if (preview) fs.mkdirSync(preview, { recursive: true });

  const browser = await chromium.launch();
  for (const d of targets) {
    const base = `Day${pad(d.day)}_${d.slug}`;
    const pdf = path.join(OUT, 'scripts', `Hyunju_Script_${base}.pdf`);
    await renderPdf(browser, 'script.html', d, pdf, preview && path.join(preview, `script_${base}.png`));
    const txt = path.join(OUT, 'audio', `${base}.txt`);
    fs.writeFileSync(txt, audioScript(d));
    const chars = d.lines.reduce((n, l) => n + l.en.length, 0);
    console.log(`script  ${path.relative(process.cwd(), pdf)}`);
    console.log(`audio   ${path.relative(process.cwd(), txt)}  (${d.lines.length} turns, ~${chars} credits)`);
  }

  const withWords = days.filter(d => d.vocab && d.vocab.length);
  const first = withWords[0].day, last = withWords[withWords.length - 1].day;
  const vocabDir = path.join(OUT, 'vocab');
  const vocabPdf = path.join(vocabDir, `Hyunju_Vocab_Day${pad(first)}-${pad(last)}.pdf`);
  for (const f of fs.readdirSync(vocabDir)) {
    if (/^Hyunju_Vocab_.*\.pdf$/.test(f) && path.join(vocabDir, f) !== vocabPdf) fs.unlinkSync(path.join(vocabDir, f));
  }
  await renderPdf(browser, 'vocab.html', days, vocabPdf, preview && path.join(preview, 'vocab.png'));
  const words = withWords.reduce((n, d) => n + d.vocab.length, 0);
  console.log(`vocab   ${path.relative(process.cwd(), vocabPdf)}  (${words} words)`);
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
