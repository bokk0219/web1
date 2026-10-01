---
name: english-wrapup
description: Turn today's English role-play practice into Hyunju's study files in one go — corrected dialogue script for ElevenLabs audio, a phone-friendly chat-bubble script PDF, and the cumulative word book PDF. Use when the user says things like "오늘 정리해줘", "대본이랑 PDF, 단어장 만들어줘", or "/english-wrapup" after a practice session.
---

# English practice wrap-up

Hyunju (50s, Korean, beginner) practices everyday English by role-play with Claude (see the
`english-tutor` skill). After each session this skill saves the day as data and builds three files
from it with `english/build.cjs`. Everything to the user is written in Korean.

## 1. Write `english/data/dayNN.json`

Next day number = highest existing `english/data/dayNN.json` + 1 (two digits). One file per session.
Copy the shape of the latest existing file:

```json
{
  "day": 7,
  "date": "YYYY-MM-DD",
  "slug": "Restaurant",
  "title": "At the Restaurant",
  "title_ko": "식당에서 주문하기",
  "vocab_title_ko": "식당에서 주문하기",
  "lines": [
    { "role": "partner", "name": "Mike", "en": "...", "ko": "..." },
    { "role": "me", "name": "Hyunju", "en": "...", "ko": "..." }
  ],
  "vocab": [
    { "word": "...", "pos": "명사", "meaning": "...", "example": "I need some <b>medicine</b>." }
  ]
}
```

**lines** — the conversation as it happened, cleaned up:
- `me` lines use the **corrected** version of what Hyunju said (the ✏️/💡 corrections given in the
  session), never her original mistakes. Don't invent content she didn't say; if a question went
  unanswered, end the script before it or drop that question.
- `partner` lines are Claude's in-character lines, without emoji, stage directions or feedback.
  Merge two partner turns in a row into one.
- She wants **at least 15 turns** a day. Keep the total around 1,000–1,200 characters of English
  by keeping partner lines short — each character costs one ElevenLabs credit, and Starter's
  30,000 credits a month is about 1,000 a day. Never pad the script with lines that weren't said;
  if the session itself was short, keep it as is and say so.
- Write numbers so TTS reads them well ("fifteenth floor", "six dollars and fifty cents").
- `ko`: natural Korean translation. Friends talk in 반말; staff, doctors, neighbors in 존댓말.
- `slug`: one English word, PascalCase, used in file names (`Day07_Restaurant`).

**vocab** — 5–10 entries: words/expressions she didn't know, misspelled, or was corrected on in
this session (e.g. drowsy, runny nose, get in touch **with**). Don't repeat an entry already in an
earlier day's file. `pos` is one of 명사 / 동사 / 형용사 / 부사 / 표현. `meaning` is short Korean,
and may add a hint in parentheses (e.g. "(with 필수)"). `example` comes from today's dialogue with
the word wrapped in `<b>…</b>`; no other HTML.

## 2. Build

```bash
NODE_PATH=$(npm root -g) node english/build.cjs <day> --preview <scratchpad>/preview
```

This writes `english/output/scripts/Hyunju_Script_DayNN_Slug.pdf`,
`english/output/audio/DayNN_Slug.txt`, and rebuilds `english/output/vocab/Hyunju_Vocab_Day01-NN.pdf`
(the previous word book file is deleted). Open the preview PNGs with Read and check that Korean,
the Jua title font and every bubble render correctly before going on. If a template or the build
script changes, rebuild with `all`.

Playwright is installed globally; if `require('playwright')` fails, check `npm root -g`. Fonts are
local in `english/templates/fonts/` (Chromium here can't fetch Google Fonts through the proxy).

## 3. Commit and push

Commit `english/data/dayNN.json` and everything changed under `english/output/`, then push to the
session's working branch.

## 4. Hand over

- Send the script PDF and the word book PDF with SendUserFile (`display: "render"`).
- In the reply, paste the audio script from `english/output/audio/DayNN_Slug.txt` in a code block,
  with a legend like "🔵 = Mike (웨이터) / 🔴 = Hyunju (나) · N줄, 약 N자", and remind her not to paste
  the emoji — in ElevenLabs (Eleven v3, Add speaker) each line goes in its own box with its voice.
- Mention the word count added and the new total. Keep it short.
