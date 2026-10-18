import { basicSetup, EditorView } from "codemirror";

export function createEditor(parent) {
    return new EditorView({
        doc: '// bienvenue dans cirrus\n',
        extensions: [basicSetup],
        parent,
    });
}
