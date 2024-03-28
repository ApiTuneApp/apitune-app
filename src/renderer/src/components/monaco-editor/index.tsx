import * as monaco from 'monaco-editor'

import Editor, { loader } from '@monaco-editor/react'
import { useRef } from 'react'
import { useTheme } from '@mui/material/styles'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

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

export default function MonacoEditor(props: MonacoEditorProps) {
  const theme = useTheme()
  const editorTheme = theme.palette.mode === 'dark' ? 'vs-dark' : ''

  const editorRef = useRef(null)
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }
  return <Editor theme={editorTheme} onMount={handleEditorDidMount} {...props} />
}
