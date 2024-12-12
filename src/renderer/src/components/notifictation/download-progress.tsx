import { notification, Progress } from 'antd'
import { useEffect } from 'react'

import { strings } from '@renderer/services/localization'
import { MainEvent } from '@shared/contract'

let shouldShow = true

export default function DownloadProgress() {
  const [api, contextHolder] = notification.useNotification()
  useEffect(() => {
    window.api.onUpdateProgress((progress) => {
      if (!shouldShow) return
      api.info({
        key: 'update-progress',
        message: strings.downloadingUpdate,
        duration: 0,
        description: <Progress percent={progress} />,
        onClose: () => {
          shouldShow = false
        }
      })
      if (progress === 100) {
        api.destroy('update-progress')
      }
    })
    return () => {
      window.api.clearupEvent(MainEvent.UpdateProgress)
    }
  }, [])

  return <>{contextHolder}</>
}
