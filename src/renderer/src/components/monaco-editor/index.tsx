import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useRef } from 'react'

import Editor, { EditorProps, loader } from '@monaco-editor/react'
import { useSettingStore } from '@renderer/store/setting'

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

export type supportLanguage = 'json' | 'javascript' | 'html' | 'css' | 'plaintext'

type MonacoEditorProps = {
  defaultLanguage: supportLanguage
  height: number | string
}

export default function MonacoEditor(props: MonacoEditorProps & EditorProps) {
  const editorTheme = useSettingStore((state) => state.appTheme) === 'dark' ? 'vs-dark' : 'light'

  const editorRef = useRef(null)
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }
  return <Editor theme={editorTheme} onMount={handleEditorDidMount} {...props} />
}
