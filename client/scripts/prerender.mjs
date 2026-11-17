// Writes the rendered home page into dist/index.html (PL) and dist/en/index.html (EN), with the EN head.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const SITE = 'https://ks-infra.dev';
const ROOT = '<div id="root"></div>';
const { render } = await import(pathToFileURL(resolve('dist-ssr/prerender.js')).href);

const swap = (html, from, to) => {
    if (html.split(from).length !== 2) throw new Error(`prerender: expected exactly one ${JSON.stringify(from.slice(0, 60))}`);
    return html.replace(from, () => to);
};

const template = readFileSync('dist/index.html', 'utf8');
const pl = swap(template, ROOT, `<div id="root"><div data-prerender>${render('pl')}</div></div>`);

const EN_TITLE = 'Konrad Sędkowski: automation for wholesale and distribution';
const EN_DESC = 'Less manual work in wholesale: orders from emails, documents and devices in sales and the warehouse. I start with one process and the programs the company already has. The first call and the process analysis are free.';
let en = swap(template, ROOT, `<div id="root"><div data-prerender>${render('en')}</div></div>`);
en = swap(en, '<html lang="pl"', '<html lang="en"');
en = en.replace(/<title>[^<]*<\/title>/, `<title>${EN_TITLE}</title>`);
for (const [attr, name, value] of [
    ['name', 'description', EN_DESC],
    ['property', 'og:title', EN_TITLE],
    ['property', 'og:description', EN_DESC],
    ['property', 'og:url', `${SITE}/en/`],
    ['property', 'og:locale', 'en_GB'],
    ['name', 'twitter:title', EN_TITLE],
    ['name', 'twitter:description', EN_DESC]
]) {
    const pattern = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
    if (!pattern.test(en)) throw new Error(`prerender: no meta ${name}`);
    en = en.replace(pattern, (_, a, b) => `${a}${value}${b}`);
}
en = swap(en, `<link rel="canonical" href="${SITE}/" />`, `<link rel="canonical" href="${SITE}/en/" />`);

writeFileSync('dist/index.html', pl);
mkdirSync('dist/en', { recursive: true });
writeFileSync('dist/en/index.html', en);
rmSync('dist-ssr', { recursive: true, force: true });
console.log(`prerender: dist/index.html ${pl.length} B, dist/en/index.html ${en.length} B`);
