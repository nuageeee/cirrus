import { createEditor } from './editor.js';

let fileName = 'Sans titre';
let savedDoc = null;   // le document tel qu'il est sur le disque

const editor = createEditor(document.querySelector('#editor'), {
  open: openFile,
  save: () => saveFile(false),
  saveAs: () => saveFile(true),
  change: updateTitle,
});

savedDoc = editor.getDoc();
updateTitle();

// Modifié = le texte actuel est différent de celui enregistré
// (taper « a » puis Ctrl+Z → redevient « non modifié »)
function isModified() {
  return !editor.getDoc().eq(savedDoc);
}

function updateTitle() {
  const mark = isModified() ? '● ' : '';
  document.title = `${mark}${fileName} — Cirrus`;
}

async function openFile() {
  if (isModified() && !confirm('Modifications non enregistrées. Ouvrir un autre fichier quand même ?')) {
    return;
  }
  try {
    const result = await window.files.open();
    if (result === null) return;   // Annuler

    editor.load(result.text);
    savedDoc = editor.getDoc();
    fileName = result.name;
    updateTitle();
  } catch (error) {
    alert(`Impossible d'ouvrir le fichier :\n${error.message}`);
  }
}

async function saveFile(asNew) {
  // On capture le document AVANT l'envoi : si tu tapes pendant que le main écrit,
  // ce qui est sur le disque est bien CE document-là, pas le texte d'après.
  const doc = editor.getDoc();
  const text = doc.toString();

  try {
    const result = asNew
      ? await window.files.saveAs(text)
      : await window.files.save(text);
    if (result === null) return;   // Annuler

    savedDoc = doc;
    fileName = result.name;
    updateTitle();
  } catch (error) {
    alert(`Impossible d'enregistrer :\n${error.message}`);
  }
}
