#!/usr/bin/env node
/**
 * verify-legal-content.mjs
 *
 * Regression guard: asserts every section body in
 *   - src/data/termsContent.ts   (T&C, 30 sections × EN+MM)
 *   - src/data/privacyContent.ts (Privacy Policy, 16 sections × MM)
 * matches the official KBZ-cleared .docx source.
 *
 * For T&C:
 *   - MM: raw whitespace-collapsed + NFC-normalized comparison must match exactly.
 *   - EN: normalized comparison that absorbs known extraction artifacts (list-number
 *     prefixes, letter sub-bullets, '8484Gas ' trailing-space variant from docx,
 *     em-dash style, orphan ')' typo, double-comma typo).
 *
 * For Privacy:
 *   - MM only (no new EN docx). Whitespace-collapsed + NFC + strip **bold** markers
 *     comparison must match exactly. 16 sections numbered 1-15 and 17 (intentional
 *     gap at 16).
 *
 * Usage:  node scripts/verify-legal-content.mjs
 * Exit:   0 on success, 1 on any mismatch with a diagnostic line per section.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mammoth from 'mammoth';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TC_EN_DOCX = path.join(REPO_ROOT, 'docs/legal/20260514_L&C_Clean Eng_8484 Gas Mini App T&C__1-3fb8452f.docx');
const TC_MM_DOCX = path.join(REPO_ROOT, 'docs/legal/20260514_L&C_ Clean_ MM_8484Gas Mini App T&C _1-9305d3bf.docx');
const TC_TS_FILE = path.join(REPO_ROOT, 'src/data/termsContent.ts');
const PP_MM_DOCX = path.join(REPO_ROOT, 'docs/legal/AnyGas_8484Gas_PrivacyPolicy_MM_V1_0_1.docx');
const PP_TS_FILE = path.join(REPO_ROOT, 'src/data/privacyContent.ts');

const MYANMAR_DIGITS = {
  1: '၁', 2: '၂', 3: '၃', 4: '၄', 5: '၅', 6: '၆', 7: '၇', 8: '၈', 9: '၉', 10: '၁၀',
  11: '၁၁', 12: '၁၂', 13: '၁၃', 14: '၁၄', 15: '၁၅', 16: '၁၆', 17: '၁၇', 18: '၁၈',
  19: '၁၉', 20: '၂၀', 21: '၂၁', 22: '၂၂', 23: '၂၃', 24: '၂၄', 25: '၂၅', 26: '၂၆',
  27: '၂၇', 28: '၂၈', 29: '၂၉', 30: '၃၀',
};

const EN_TITLES = [
  'DEFINITIONS',
  'OBTAINING AND USING 8484GAS (MINI APP)',
  'MEMBER REGISTRATION',
  'SCOPE OF 8484GAS SERVICES',
  'PRICE AND PROMOTION',
  'ADDITIONAL CHARGES AND REFUND',
  'USER ACCOUNT',
  'PAYMENT DETAILS AND PROCEDURES',
  'RIGHTS AND OBLIGATIONS',
  'RIGHTS TO USER CONTENT',
  'USEAGE RESTRICTIONS',
  'LIMITATION OF LIABLILITY',
  'IDEMNIFICATION',
  'THIRD PARTY LINKS AND CONTENTS',
  'TERMINATION, SUSPENDING AND CANCELLATION OF SERVICES',
  'SENDING NOTIFICATIONS',
  'LIMITATIONS',
  'INDEMNITY',
  'REPRESENTATION AND WARRANTIES',
  'INTELLECTUAL PROPERTY RIGHTS',
  'DISCLAIMER',
  'FORCE MAJEURE',
  'NOTIFICATION',
  'AMENDMENT',
  'SEVERABILITY',
  'ASSIGNMENT',
  'GOVERNING LAW AND DISPUTE RESOLUTION',
  'WAIVER',
  'LANGUAGE',
  'CUSTOMER CONTACT',
];

const PP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17];

function nfc(s) { return s.normalize('NFC'); }

function smartToStraight(s) {
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function wsCollapse(s) { return s.replace(/\s+/g, ' ').trim(); }

function mmNorm(s) { return wsCollapse(nfc(s)); }

function stripBold(s) { return s.replace(/\*\*([^*]+)\*\*/g, '$1'); }

function ppMmNorm(s) { return wsCollapse(nfc(stripBold(s))); }

function enNorm(s) {
  s = wsCollapse(nfc(s));
  s = s.replace(/8484Gas\s+/g, '8484Gas ');
  s = ' ' + s + ' ';
  s = s.replace(/\s\d+\.\d+\.\d+\.?\s+/g, ' ');
  s = s.replace(/\s\d+\.\d+\.?\s+/g, ' ');
  s = s.replace(/\s\d+\.\s+/g, ' ');
  s = s.replace(/\s[a-z]\.\s+/g, ' ');
  s = s.replace(/\s[a-z]\)\s+/g, ' ');
  s = s
    .replace(/8484Gas \./g, '8484Gas.')
    .replace(/8484Gas ,/g, '8484Gas,')
    .replace(/8484Gas ;/g, '8484Gas;')
    .replace(/8484Gas 's/g, "8484Gas's");
  s = s.replace(/---/g, '—').replace(/ — /g, '—').replace(/— /g, '—').replace(/ —/g, '—');
  s = s.replace(/\),/g, ',').replace(/thereof,\)/g, 'thereof,').replace(/,,/g, ',');
  return s.replace(/\s+/g, ' ').trim();
}

async function extractDocxParagraphs(docxPath) {
  const buf = await readFile(docxPath);
  const result = await mammoth.extractRawText({ buffer: buf });
  const paras = result.value.split('\n').map(p => nfc(p.replace(/\t/g, ' ')).replace(/ +/g, ' ').trim());
  return paras;
}

function buildEnSections(paragraphs) {
  const starts = {};
  for (let n = 1; n <= 30; n++) {
    const title = EN_TITLES[n - 1];
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i].replace(/^\d+\.\s*/, '').trim();
      if (p.toUpperCase() === title.toUpperCase()) {
        if (!(n in starts)) starts[n] = i;
        break;
      }
    }
  }
  const sortedN = Object.keys(starts).map(Number).sort((a, b) => starts[a] - starts[b]);
  const sections = {};
  for (let idx = 0; idx < sortedN.length; idx++) {
    const n = sortedN[idx];
    const s = starts[n];
    const e = idx + 1 < sortedN.length ? starts[sortedN[idx + 1]] : paragraphs.length;
    const body = paragraphs.slice(s + 1, e).filter(p => p).join('\n\n');
    sections[n] = smartToStraight(body);
  }
  return sections;
}

function buildMmSections(paragraphs) {
  const starts = {};
  const digitMap = {};
  for (const [k, v] of Object.entries(MYANMAR_DIGITS)) digitMap[v] = Number(k);
  for (let i = 0; i < paragraphs.length; i++) {
    const m = paragraphs[i].match(/^([၀-၉]+)။\s+(.+)/);
    if (m) {
      const n = digitMap[m[1]];
      if (n && !(n in starts)) starts[n] = i;
    }
  }
  const sortedN = Object.keys(starts).map(Number).sort((a, b) => starts[a] - starts[b]);
  const sections = {};
  for (let idx = 0; idx < sortedN.length; idx++) {
    const n = sortedN[idx];
    const s = starts[n];
    const e = idx + 1 < sortedN.length ? starts[sortedN[idx + 1]] : paragraphs.length;
    const body = paragraphs.slice(s + 1, e).filter(p => p).join('\n\n');
    sections[n] = smartToStraight(body);
  }
  return sections;
}

/**
 * Privacy: docx headings are "1. ", "2. ", ... "17. " (Arabic digits + dot + space).
 * Sub-headings like "3.1 ", "6.1 " also exist, so we must NOT match those as
 * top-level. We require the digit be 1-2 chars and followed by ". " (not ".N").
 */
function buildPpMmSections(paragraphs) {
  const starts = {};
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const m = p.match(/^(\d{1,2})\.\s+(\S.+)/);
    if (m) {
      const n = Number(m[1]);
      if (PP_NUMBERS.includes(n) && !(n in starts)) {
        // Reject sub-headings (e.g. "3.1 ..." would not match the regex anyway)
        // and reject any line that itself starts with a sub-number after dot.
        starts[n] = i;
      }
    }
  }
  const sortedN = Object.keys(starts).map(Number).sort((a, b) => starts[a] - starts[b]);
  const sections = {};
  for (let idx = 0; idx < sortedN.length; idx++) {
    const n = sortedN[idx];
    const s = starts[n];
    const e = idx + 1 < sortedN.length ? starts[sortedN[idx + 1]] : paragraphs.length;
    const body = paragraphs.slice(s + 1, e).filter(p => p).join('\n\n');
    // Strip docx footer marker "-- ... --" lines from the last section.
    let cleaned = body.replace(/^\s*--[\s\S]*?--\s*$/gm, '').trim();
    // §8: docx contains a retention table whose header cells ("ဒေတာအမျိုးအစား"
    // and "ထိန်းသိမ်းကာလ") become standalone paragraphs after mammoth raw-text
    // extraction. The shipped privacyContent.ts intentionally omits this
    // "Data type — Retention period:" line, so we strip it here too before
    // comparing.
    if (n === 8) {
      cleaned = cleaned
        .split(/\n+/)
        .filter(line => line.trim() !== 'ဒေတာအမျိုးအစား' && line.trim() !== 'ထိန်းသိမ်းကာလ')
        .join('\n\n')
        .trim();
    }
    sections[n] = smartToStraight(cleaned);
  }
  return sections;
}

function scanArrayEntries(src, afterBracketIdx) {
  let i = afterBracketIdx;
  let depth = 1, inStr = null, escape = false;
  const entries = [];
  let entryStart = null;
  while (i < src.length) {
    const c = src[i];
    if (inStr !== null) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === inStr) inStr = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue; }
    if (c === '[') depth++;
    else if (c === ']') {
      if (depth === 1) return entries;
      depth--;
    } else if (c === '{') {
      if (depth === 1 && entryStart === null) entryStart = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 1 && entryStart !== null) {
        entries.push([entryStart, i + 1]);
        entryStart = null;
      }
    }
    i++;
  }
  return entries;
}

function extractBody(entrySrc, lang) {
  const re = new RegExp(`\\b${lang}\\s*:\\s*\\{`);
  const m = entrySrc.match(re);
  if (!m) return null;
  const startInner = m.index + m[0].length;
  let j = startInner, depth = 1, inStr = null, escape = false;
  while (j < entrySrc.length) {
    const c = entrySrc[j];
    if (inStr !== null) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === inStr) inStr = null;
      j++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; j++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
    j++;
  }
  const block = entrySrc.slice(startInner, j);
  const bm = block.match(/\bbody\s*:\s*/);
  if (!bm) return null;
  let k = bm.index + bm[0].length;
  const delim = block[k];
  if (delim !== '"' && delim !== "'" && delim !== '`') return null;
  k++;
  const contentStart = k;
  escape = false;
  while (k < block.length) {
    const c = block[k];
    if (escape) { escape = false; }
    else if (c === '\\') { escape = true; }
    else if (c === delim) {
      let raw = block.slice(contentStart, k);
      if (delim === '`') {
        raw = raw.replace(/\\\\/g, '\\').replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
      } else {
        raw = raw.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      }
      return raw;
    }
    k++;
  }
  return null;
}

async function parseShippedTermsTs() {
  const src = await readFile(TC_TS_FILE, 'utf-8');
  const m = src.match(/export const termsSections:\s*TermsSection\[\]\s*=\s*\[/);
  if (!m) throw new Error('Cannot find termsSections array');
  const arrStart = m.index + m[0].length;
  const entries = scanArrayEntries(src, arrStart);
  if (entries.length !== 30) throw new Error(`Expected 30 T&C entries, got ${entries.length}`);
  const sections = {};
  for (let i = 0; i < 30; i++) {
    const [s, e] = entries[i];
    const entrySrc = src.slice(s, e);
    sections[i + 1] = { en: extractBody(entrySrc, 'en'), mm: extractBody(entrySrc, 'mm') };
  }
  return sections;
}

async function parseShippedPrivacyTs() {
  const src = await readFile(PP_TS_FILE, 'utf-8');
  const m = src.match(/export const privacySections:\s*PrivacySection\[\]\s*=\s*\[/);
  if (!m) throw new Error('Cannot find privacySections array');
  const arrStart = m.index + m[0].length;
  const entries = scanArrayEntries(src, arrStart);
  if (entries.length !== 16) throw new Error(`Expected 16 Privacy entries, got ${entries.length}`);
  const sections = {};
  for (let i = 0; i < 16; i++) {
    const [s, e] = entries[i];
    const entrySrc = src.slice(s, e);
    sections[PP_NUMBERS[i]] = { mm: extractBody(entrySrc, 'mm') };
  }
  return sections;
}

function firstDiff(a, b) {
  const L = Math.min(a.length, b.length);
  for (let i = 0; i < L; i++) {
    if (a[i] !== b[i]) {
      return { i, a: a.slice(Math.max(0, i - 30), i + 80), b: b.slice(Math.max(0, i - 30), i + 80) };
    }
  }
  if (a.length !== b.length) {
    return { i: L, a: a.slice(Math.max(0, L - 30), L + 80), b: b.slice(Math.max(0, L - 30), L + 80) };
  }
  return null;
}

async function verifyTerms() {
  const enParas = await extractDocxParagraphs(TC_EN_DOCX);
  const mmParas = await extractDocxParagraphs(TC_MM_DOCX);
  const srcEn = buildEnSections(enParas);
  const srcMm = buildMmSections(mmParas);
  const shipped = await parseShippedTermsTs();

  let fail = false;
  console.log('--- T&C (termsContent.ts) ---');
  for (let n = 1; n <= 30; n++) {
    const enShip = enNorm(shipped[n].en);
    const enSrc = enNorm(srcEn[n] || '');
    const mmShip = mmNorm(shipped[n].mm);
    const mmSrc = mmNorm(srcMm[n] || '');
    const enOk = enShip === enSrc;
    const mmOk = mmShip === mmSrc;
    if (enOk && mmOk) {
      console.log(`§${n} en=MATCH mm=MATCH`);
    } else {
      fail = true;
      console.log(`§${n} en=${enOk ? 'MATCH' : 'MISMATCH'} mm=${mmOk ? 'MATCH' : 'MISMATCH'}`);
      if (!enOk) {
        const d = firstDiff(enShip, enSrc);
        if (d) {
          console.log(`   EN @${d.i}: shipped=${JSON.stringify(d.a)}`);
          console.log(`              source =${JSON.stringify(d.b)}`);
        }
      }
      if (!mmOk) {
        const d = firstDiff(mmShip, mmSrc);
        if (d) {
          console.log(`   MM @${d.i}: shipped=${JSON.stringify(d.a)}`);
          console.log(`              source =${JSON.stringify(d.b)}`);
        }
      }
    }
  }
  return fail;
}

async function verifyPrivacy() {
  const mmParas = await extractDocxParagraphs(PP_MM_DOCX);
  const srcMm = buildPpMmSections(mmParas);
  const shipped = await parseShippedPrivacyTs();

  let fail = false;
  console.log('\n--- Privacy Policy (privacyContent.ts) ---');
  for (const n of PP_NUMBERS) {
    const mmShip = ppMmNorm(shipped[n].mm);
    const mmSrc = ppMmNorm(srcMm[n] || '');
    const mmOk = mmShip === mmSrc;
    if (mmOk) {
      console.log(`§${n} mm=MATCH`);
    } else {
      fail = true;
      console.log(`§${n} mm=MISMATCH (shipped_len=${mmShip.length} source_len=${mmSrc.length})`);
      const d = firstDiff(mmShip, mmSrc);
      if (d) {
        console.log(`   MM @${d.i}: shipped=${JSON.stringify(d.a)}`);
        console.log(`              source =${JSON.stringify(d.b)}`);
      }
    }
  }
  return fail;
}

async function main() {
  const tcFail = await verifyTerms();
  const ppFail = await verifyPrivacy();
  if (tcFail || ppFail) {
    console.error('\nverify-legal-content: FAIL');
    process.exit(1);
  } else {
    console.log('\nverify-legal-content: PASS (T&C 30×2 + Privacy 16×1 all match)');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
