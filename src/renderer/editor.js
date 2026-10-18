import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Prec, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';

// Réglages d'apparence propres à Cirrus, appliqués par-dessus oneDark
const cirrusTheme = EditorView.theme({
  '&': { fontSize: '14px' },
  '.cm-content, .cm-gutters': {
    fontFamily: "'Cascadia Code', Consolas, monospace",
  },
});

// Position du curseur, numérotée à partir de 1 (comme dans VS Code)
function cursorPosition(state) {
  const pos = state.selection.main.head;   // position en caractères depuis le début
  const line = state.doc.lineAt(pos);      // la ligne qui contient cette position
  return { line: line.number, column: pos - line.from + 1 };
}

function buildExtensions(handlers, language) {
  return [
    basicSetup,
    oneDark,          // thème sombre + couleurs du code
    cirrusTheme,
    language.of([]),  // compartiment « langage », vide au départ = texte brut

    Prec.highest(keymap.of([
      { key: 'Mod-o', run: () => { handlers.open(); return true; } },
      { key: 'Mod-s', run: () => { handlers.save(); return true; } },
      { key: 'Mod-Shift-s', run: () => { handlers.saveAs(); return true; } },
    ])),

    EditorView.updateListener.of((update) => {
      if (update.docChanged) handlers.change();
      if (update.docChanged || update.selectionSet) {
        handlers.cursor(cursorPosition(update.state));
      }
    }),
  ];
}

export function createEditor(parent, handlers) {
  const language = new Compartment();
  const extensions = buildExtensions(handlers, language);
  const view = new EditorView({ doc: '', extensions, parent });

  return {
    view,
    getDoc: () => view.state.doc,
    getCursor: () => cursorPosition(view.state),

    load(text) {
      view.setState(EditorState.create({ doc: text, extensions }));
      view.focus();
    },

    // Choisit le langage d'après le nom du fichier. Renvoie le nom affichable.
    async setLanguage(fileName) {
      const description = LanguageDescription.matchFilename(languages, fileName);
      if (description === null) {
        view.dispatch({ effects: language.reconfigure([]) });
        return 'Texte brut';
      }
      const support = await description.load();   // chargé seulement maintenant
      view.dispatch({ effects: language.reconfigure(support) });
      return description.name;
    },
  };
}
