import { Button, Tooltip } from 'antd'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useRef, useState } from 'react'

import { FullscreenOutlined } from '@ant-design/icons'
import Editor, { EditorProps, loader } from '@monaco-editor/react'
import { strings } from '@renderer/services/localization'
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
  showFullscreenButton?: boolean
  fullscreenTargetSelector?: string
}

export default function MonacoEditor(props: MonacoEditorProps & EditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editorTheme = useSettingStore((state) => state.appTheme) === 'dark' ? 'vs-dark' : 'light'
  const editorRef = useRef(null)

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }

  const getFullscreenStyle = () => {
    if (!isFullscreen) return {}

    const defaultStyle = {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      height: '100vh',
      width: '100vw'
    }

    if (!props.fullscreenTargetSelector) return defaultStyle

    const target = document.querySelector(props.fullscreenTargetSelector)
    if (!target) {
      return defaultStyle
    }

    const rect = target.getBoundingClientRect()

    return {
      position: 'fixed' as const,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 1000
    }
  }

  return (
    <div style={{ position: 'relative', ...getFullscreenStyle() }}>
      {props.showFullscreenButton && (
        <Tooltip title={isFullscreen ? strings.exitFullscreen : strings.fullscreen}>
          <Button
            icon={<FullscreenOutlined />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              position: 'absolute',
              top: 8,
              right: 20,
              zIndex: 99
            }}
          />
        </Tooltip>
      )}
      <Editor
        theme={editorTheme}
        onMount={handleEditorDidMount}
        {...props}
        height={isFullscreen ? '100vh' : props.height}
      />
    </div>
  )
}
