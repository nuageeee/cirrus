const BOM = '\uFEFF';

export function readFormat(rawText) {
    const bom = rawText.startsWith(BOM);
    const text = bom ? rawText.slice(1) : rawText;
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    return { text, eol, bom };
}

export function writeText(doc, format) {
    const body = doc.sliceString(0, doc.length, format.eol);
    return format.bom ? BOM + body : body;
}

export function eolLabel(eol) {
  return eol === '\r\n' ? 'CRLF' : 'LF';
}

export function encodingLabel(format) {
  return format.bom ? 'UTF-8 BOM' : 'UTF-8';
}
