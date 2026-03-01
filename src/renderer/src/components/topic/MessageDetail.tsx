import { IKafkaMessage } from '@shared/types'
import { Button, Descriptions, DescriptionsProps, Space } from 'antd'
import { useEffect, useState } from 'react'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/ext-language_tools'
import '../../assets/topic.css'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/redux/store'

interface MessageDetailProps {
    message: IKafkaMessage | null
}

export default function MessageDetail({ message }: MessageDetailProps) {
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)
    const [formatedValue, setFormatedValue] = useState('')
    const [showOrigin, setShowOrigin] = useState(false)
    const [editorTheme, setEditorTheme] = useState('github')

    const descItems: DescriptionsProps['items'] = [
        {
            key: 'detail-key',
            label: 'Key',
            children: message?.key || ''
        }, {
            key: 'detail-offset',
            label: 'Offset',
            children: message?.offset || ''
        }, {
            key: 'detail-partition',
            label: 'Partition',
            children: message?.partition || ''
        }
    ]

    useEffect(() => {
        if (!message || !message.value) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormatedValue('')
            return
        }
        try {
            setFormatedValue(JSON.stringify(JSON.parse(message.value), null, 4))
        } catch (e) {
            setFormatedValue(message?.value || '')
        }
    }, [message])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditorTheme(themeStyle === 'dark' ? 'monokai' : 'github')
    }, [themeStyle])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Descriptions bordered size="small" items={descItems} />
            <AceEditor
                name="message-detail-viewer"
                mode="json"
                value={showOrigin ? message?.value || '' : formatedValue}
                readOnly
                width="100%"
                height="66vh"
                theme={editorTheme}
                className="common-scroll-container"
                style={{
                    marginTop: 14
                }}
                setOptions={{
                    tabSize: 4,
                    enableSnippets: true,
                    fontSize: 12
                }}
            />
        </div>
    )
}
