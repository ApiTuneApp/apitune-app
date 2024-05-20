import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useRef } from 'react'

import Editor, { EditorProps, loader } from '@monaco-editor/react'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

loader.config({ monaco })

type MonacoEditorProps = {
  defaultLanguage: 'json' | 'javascript' | 'html' | 'css'
  height: number | string
}

export default function MonacoEditor(props: MonacoEditorProps & EditorProps) {
  // TODO: support theme switch
  const editorTheme = 'vsdark'

  const editorRef = useRef(null)
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }
  return <Editor theme={editorTheme} onMount={handleEditorDidMount} {...props} />
}
