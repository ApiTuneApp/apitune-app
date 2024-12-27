import { Button, Tooltip } from 'antd'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useEffect, useRef, useState } from 'react'

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
  autoFormat?: boolean
}

export default function MonacoEditor(props: MonacoEditorProps & EditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editorTheme = useSettingStore((state) => state.appTheme) === 'dark' ? 'vs-dark' : 'light'
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (props.autoFormat) {
      try {
        setTimeout(() => {
          editorRef?.current?.getAction('editor.action.formatDocument')?.run()
        }, 0)
      } catch (error) {
        console.error(error)
      }
    }
  }, [props.autoFormat, props.value])

  function handleEditorDidMount(editor, monacoInstance) {
    editorRef.current = editor

    if (props.defaultLanguage === 'javascript') {
      monacoInstance.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
          const linePrefix = model.getLineContent(position.lineNumber).substring(0, position.column)
          const wordUntilPosition = model.getWordUntilPosition(position)
          const word = wordUntilPosition.word

          // Handle request.* completions
          if (linePrefix.endsWith('request.')) {
            return {
              suggestions: [
                {
                  label: 'protocol',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'protocol',
                  documentation: 'Request protocol (e.g., "http" or "https")'
                },
                {
                  label: 'url',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'url',
                  documentation: 'Full request URL'
                },
                {
                  label: 'host',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'host',
                  documentation: 'Request host'
                },
                {
                  label: 'method',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'method',
                  documentation: 'HTTP method (e.g., "GET", "POST")'
                },
                {
                  label: 'ip',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'ip',
                  documentation: 'Client IP address'
                },
                {
                  label: 'clientPort',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'clientPort',
                  documentation: 'Client port number'
                },
                {
                  label: 'headers',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'headers',
                  documentation: 'Request headers object'
                },
                {
                  label: 'startTime',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'startTime',
                  documentation: 'Request start timestamp'
                },
                {
                  label: 'requestBodyLength',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'requestBodyLength',
                  documentation: 'Length of request body in bytes'
                },
                {
                  label: 'requestBody',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'requestBody',
                  documentation: 'Request body content'
                }
              ]
            }
          }

          // Handle response.* completions
          if (linePrefix.endsWith('response.')) {
            return {
              suggestions: [
                {
                  label: 'status',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'status',
                  documentation: 'HTTP status code'
                },
                {
                  label: 'message',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'message',
                  documentation: 'Response status message'
                },
                {
                  label: 'headers',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'headers',
                  documentation: 'Response headers object'
                },
                {
                  label: 'remoteIp',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'remoteIp',
                  documentation: 'Remote server IP'
                },
                {
                  label: 'remotePort',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'remotePort',
                  documentation: 'Remote server port'
                },
                {
                  label: 'responseType',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'responseType',
                  documentation: 'Response content type'
                },
                {
                  label: 'finishTime',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'finishTime',
                  documentation: 'Response finish timestamp'
                },
                {
                  label: 'responseBodyLength',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'responseBodyLength',
                  documentation: 'Length of response body in bytes'
                },
                {
                  label: 'responseBody',
                  kind: monacoInstance.languages.CompletionItemKind.Property,
                  insertText: 'responseBody',
                  documentation: 'Response body content'
                }
              ]
            }
          }

          // Handle at.* completions
          if (linePrefix.endsWith('at.')) {
            return {
              suggestions: [
                {
                  label: 'test',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: "test('${1:title}', function() {\n\t${2}\n})",
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Add a test case with title and test function'
                },
                {
                  label: 'print',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'print(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a message'
                },
                {
                  label: 'log',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'log(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a log message'
                },
                {
                  label: 'info',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'info(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print an info message'
                },
                {
                  label: 'error',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'error(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print an error message'
                },
                {
                  label: 'debug',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'debug(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a debug message'
                },
                {
                  label: 'warn',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'warn(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a warning message'
                },
                {
                  label: 'list',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'list(${1:array})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print an array of messages with types'
                }
              ]
            }
          }

          // Handle at.print.* completions
          if (linePrefix.endsWith('at.print.')) {
            return {
              suggestions: [
                {
                  label: 'log',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'log(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a log message'
                },
                {
                  label: 'info',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'info(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print an info message'
                },
                {
                  label: 'error',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'error(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print an error message'
                },
                {
                  label: 'debug',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'debug(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a debug message'
                },
                {
                  label: 'warn',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'warn(${1:message})',
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'Print a warning message'
                }
              ]
            }
          }

          // Default completions (no dot)
          if (
            !word ||
            (word !== 'request' && word !== 'response' && word !== 'at' && word !== 'expect')
          ) {
            return {
              suggestions: [
                {
                  label: 'at',
                  kind: monacoInstance.languages.CompletionItemKind.Variable,
                  insertText: 'at',
                  documentation: 'APITune test utilities'
                },
                {
                  label: 'request',
                  kind: monacoInstance.languages.CompletionItemKind.Variable,
                  insertText: 'request',
                  documentation: 'Request object containing HTTP request details'
                },
                {
                  label: 'response',
                  kind: monacoInstance.languages.CompletionItemKind.Variable,
                  insertText: 'response',
                  documentation: 'Response object containing HTTP response details'
                },
                {
                  label: 'expect',
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: 'expect',
                  documentation: 'Chai expect assertion function'
                }
              ]
            }
          }

          // If we're typing one of the known words, don't show any suggestions
          return { suggestions: [] }
        }
      })
    }
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
