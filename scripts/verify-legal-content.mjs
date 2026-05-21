#!/usr/bin/env node
/**
 * verify-legal-content.mjs
 *
 * Regression guard: asserts every section body in src/data/termsContent.ts matches
 * the official KBZ-cleared .docx source.
 *
 * - MM: raw whitespace-collapsed + NFC-normalized comparison must match exactly.
 * - EN: normalized comparison that absorbs known extraction artifacts (list-number
 *   prefixes, letter sub-bullets, '8484Gas ' trailing-space variant from docx,
 *   em-dash style, orphan ')' typo, double-comma typo).
 *
 * Usage:  node scripts/verify-legal-content.mjs
 * Exit:   0 on success, 1 on any mismatch with a diagnostic line per section.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mammoth from 'mammoth';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EN_DOCX = path.join(REPO_ROOT, 'docs/legal/20260514_L&C_Clean Eng_8484 Gas Mini App T&C__1-3fb8452f.docx');
const MM_DOCX = path.join(REPO_ROOT, 'docs/legal/20260514_L&C_ Clean_ MM_8484Gas Mini App T&C _1-9305d3bf.docx');
const TS_FILE = path.join(REPO_ROOT, 'src/data/termsContent.ts');

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

function nfc(s) {
  return s.normalize('NFC');
}

function smartToStraight(s) {
  return s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function wsCollapse(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function mmNorm(s) {
  return wsCollapse(nfc(s));
}

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
  // mammoth converts to plain text; paragraphs are separated by \n
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
      // Backtick template literals: \\ \` are escapes; otherwise just unescape \\ → \  and \` → `
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

async function parseShippedTs() {
  const src = await readFile(TS_FILE, 'utf-8');
  const m = src.match(/export const termsSections:\s*TermsSection\[\]\s*=\s*\[/);
  if (!m) throw new Error('Cannot find termsSections array');
  const arrStart = m.index + m[0].length;
  const entries = scanArrayEntries(src, arrStart);
  if (entries.length !== 30) throw new Error(`Expected 30 entries, got ${entries.length}`);
  const sections = {};
  for (let i = 0; i < 30; i++) {
    const [s, e] = entries[i];
    const entrySrc = src.slice(s, e);
    sections[i + 1] = {
      en: extractBody(entrySrc, 'en'),
      mm: extractBody(entrySrc, 'mm'),
    };
  }
  return sections;
}

async function main() {
  const enParas = await extractDocxParagraphs(EN_DOCX);
  const mmParas = await extractDocxParagraphs(MM_DOCX);
  const srcEn = buildEnSections(enParas);
  const srcMm = buildMmSections(mmParas);
  const shipped = await parseShippedTs();

  let fail = false;
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
      const enInfo = enOk ? 'MATCH' : `MISMATCH (delta=${enShip.length - enSrc.length})`;
      const mmInfo = mmOk ? 'MATCH' : `MISMATCH (delta=${mmShip.length - mmSrc.length})`;
      console.log(`§${n} en=${enInfo} mm=${mmInfo}`);
      if (!enOk) {
        for (let i = 0; i < Math.min(enShip.length, enSrc.length); i++) {
          if (enShip[i] !== enSrc[i]) {
            console.log(`   EN @${i}: shipped=${JSON.stringify(enShip.slice(Math.max(0,i-30), i+80))}`);
            console.log(`              source =${JSON.stringify(enSrc.slice(Math.max(0,i-30), i+80))}`);
            break;
          }
        }
      }
      if (!mmOk) {
        for (let i = 0; i < Math.min(mmShip.length, mmSrc.length); i++) {
          if (mmShip[i] !== mmSrc[i]) {
            console.log(`   MM @${i}: shipped=${JSON.stringify(mmShip.slice(Math.max(0,i-30), i+80))}`);
            console.log(`              source =${JSON.stringify(mmSrc.slice(Math.max(0,i-30), i+80))}`);
            break;
          }
        }
      }
    }
  }
  if (fail) {
    console.error('\nverify-legal-content: FAIL');
    process.exit(1);
  } else {
    console.log('\nverify-legal-content: PASS (all 30 sections × 2 languages match .docx source)');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
