import { createEditor } from './editor.js';
import { readFormat, writeText, eolLabel, encodingLabel } from './fileFormat.js';

let fileName = 'Sans titre';
let savedDoc = null;
let format = { eol: '\n', bom: false };   // nouveau document : LF, sans BOM

const status = {
  cursor: document.querySelector('#status-cursor'),
  language: document.querySelector('#status-language'),
  eol: document.querySelector('#status-eol'),
  encoding: document.querySelector('#status-encoding'),
};

const editor = createEditor(document.querySelector('#editor'), {
  open: openFile,
  save: () => saveFile(false),
  saveAs: () => saveFile(true),
  change: updateTitle,
  cursor: showCursor,
});

savedDoc = editor.getDoc();
updateTitle();
showFormat();
showLanguage('Texte brut');
showCursor(editor.getCursor());

// --- Affichage ---

function isModified() {
  return !editor.getDoc().eq(savedDoc);
}

function updateTitle() {
  const modified = isModified();
  document.title = `${modified ? '● ' : ''}${fileName} — Cirrus`;
  window.files.setModified(modified);
}

function showCursor({ line, column }) {   // on « déballe » l'objet reçu
  status.cursor.textContent = `Ln ${line}, Col ${column}`;
}

function showLanguage(name) {
  status.language.textContent = name;
}

function showFormat() {
  status.eol.textContent = eolLabel(format.eol);
  status.encoding.textContent = encodingLabel(format);
}

// --- Fichiers ---

async function openFile() {
  if (isModified() && !confirm('Modifications non enregistrées. Ouvrir un autre fichier quand même ?')) {
    return;
  }
  try {
    const result = await window.files.open();
    if (result === null) return;

    if (result.notUtf8) {
      alert("Attention : ce fichier ne semble pas être en UTF-8.\nCertains caractères sont mal affichés, et l'enregistrer pourrait les abîmer.");
    }

    const opened = readFormat(result.text);
    format = { eol: opened.eol, bom: opened.bom };

    editor.load(opened.text);
    savedDoc = editor.getDoc();
    fileName = result.name;

    updateTitle();
    showFormat();
    showCursor(editor.getCursor());
    showLanguage(await editor.setLanguage(result.name));
  } catch (error) {
    alert(`Impossible d'ouvrir le fichier :\n${error.message}`);
  }
}

async function saveFile(asNew) {
  try {
    const doc = editor.getDoc();
    const text = writeText(doc, format);   // fins de ligne et BOM d'origine

    const result = asNew
      ? await window.files.saveAs(text)
      : await window.files.save(text);
    if (result === null) return false;

    savedDoc = doc;
    const nameChanged = result.name !== fileName;
    fileName = result.name;
    updateTitle();

    // « Enregistrer sous » notes.txt → notes.md : le langage change
    if (nameChanged) showLanguage(await editor.setLanguage(result.name));
    return true;
  } catch (error) {
    alert(`Impossible d'enregistrer :\n${error.message}`);
    return false;
  }
}

window.appWindow.onSaveAndClose(async () => {
  const saved = await saveFile(false);
  if (saved) window.appWindow.confirmClose();
});
