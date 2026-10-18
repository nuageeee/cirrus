import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

// Les extensions sont construites UNE fois et réutilisées à chaque fichier ouvert :
// un nouvel état doit avoir les mêmes raccourcis, le même écouteur, etc.
function buildExtensions(handlers) {
  return [
    basicSetup,

    // Prec.highest : nos raccourcis passent avant ceux de basicSetup
    Prec.highest(keymap.of([
      { key: 'Mod-o', run: () => { handlers.open(); return true; } },
      { key: 'Mod-s', run: () => { handlers.save(); return true; } },
      { key: 'Mod-Shift-s', run: () => { handlers.saveAs(); return true; } },
    ])),

    // Prévenir à chaque modification du texte (pour le ●)
    EditorView.updateListener.of((update) => {
      if (update.docChanged) handlers.change();
    }),
  ];
}

// Crée l'éditeur et renvoie un petit objet avec ce dont la page a besoin
export function createEditor(parent, handlers) {
  const extensions = buildExtensions(handlers);
  const view = new EditorView({ doc: '', extensions, parent });

  return {
    view,

    // Le document actuel (objet CodeMirror, comparable avec .eq())
    getDoc: () => view.state.doc,

    // Charger un fichier : NOUVEL état → historique d'annulation remis à zéro
    load(text) {
      view.setState(EditorState.create({ doc: text, extensions }));
      view.focus();
    },
  };
}
