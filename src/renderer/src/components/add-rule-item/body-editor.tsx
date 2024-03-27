import * as monaco from 'monaco-editor'
import { useRef, useState } from 'react'

import Editor, { loader } from '@monaco-editor/react'
import { AddRuleValueProps } from '@renderer/common/contract'

import RuleOutline from './rule-outline'

loader.config({ monaco })

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({ rule, setValue }: AddRuleValueProps & BodyEditorProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')
  const editorRef = useRef(null)

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }

  function validator(value: string) {
    let valid = true
    if (!value || !value.trim()) {
      valid = false
      setErrorMsg('Body Rule is required')
    } else {
      valid = true
      setErrorMsg('')
    }
    rule.valid = valid
  }

  rule.validator = validator
  return (
    <RuleOutline
      title="Body Rule:"
      WrapComponent={
        <Editor
          theme="vs-dark"
          height={400}
          defaultLanguage="json"
          onMount={handleEditorDidMount}
        />
      }
    />
  )
}

export default BodyEditor
