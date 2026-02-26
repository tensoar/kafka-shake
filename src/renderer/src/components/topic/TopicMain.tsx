import '../../assets/topic.css'
import useTopicMessages from '@renderer/hooks/useTopicMessages'
import { actions } from '@renderer/redux/actions'
import kafkaUtil from '@renderer/util/KafkaUtil'
import {
    IKafkaMessage,
    KafkaActionResultFetchMessage,
    KafkaActionPayloadFetchMessage
} from '@shared/types'
import {
    Button,
    Input,
    InputNumber,
    Select,
    Space,
    Typography,
    Table,
    TableProps,
    DatePicker,
    Card,
    App as AntApp
} from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { ResizeCallbackData } from 'react-resizable'
import ResizableTitle from './ResizableTitle'
import { ColumnsType } from 'antd/es/table'

export default function TopicMain() {
    const { clusterId, topicName } = useParams<{ clusterId: string; topicName: string }>()
    const messages = useTopicMessages(parseInt(clusterId as string), topicName as string)
    const { message } = AntApp.useApp()
    const [filteredMessages, setFilteredMessages] = useState<IKafkaMessage[]>([])
    const [fetchLoading, setFetchLoading] = useState(false)
    const [payload, setPayload] = useState<KafkaActionPayloadFetchMessage>({
        action: 'fetch-message',
        direction: 'latest',
        count: 500,
        topic: topicName as string,
        clusterId: parseInt(clusterId as string, 10)
    })
    const [searchOptions, setSearchOptions] = useState<{
        key: string
        value: string
        startTime: number
        endTime: number
    }>({ key: '', value: '', startTime: 0, endTime: 0 })

    const dispath = useDispatch()

    const [tableColums, setTableColums] = useState<TableProps<IKafkaMessage>['columns']>([
        {
            title: 'Partition',
            dataIndex: 'partition',
            key: 'partition',
            width: 80
        },
        {
            title: 'Offset',
            dataIndex: 'offset',
            key: 'offset',
            sortDirections: ['ascend', 'descend'],
            width: 90
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            sortDirections: ['ascend', 'descend'],
            width: 60,
            render: (key: string) => (
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        scrollbarWidth: 'thin'
                    }}
                >
                    {key}
                </div>
            )
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (value: string) => (
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        scrollbarWidth: 'thin'
                    }}
                >
                    {value}
                </div>
            )
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            sortDirections: ['ascend', 'descend'],
            width: 160,
            render: (value: string) => (
                <span>{DateTime.fromMillis(parseInt(value)).toFormat('yyyy-LL-dd HH:mm:ss')}</span>
            )
        }
    ])

    const fetchMessages = useCallback(async () => {
        try {
            setFetchLoading(true)
            const data = await window.api.callKafkaAction(payload)
            if (!data.sucess) {
                message.error(data.errMsg)
            }
            dispath(
                actions.kafkaMessage.initMessage({
                    topicId: kafkaUtil.buildTopicId(clusterId as string, topicName as string),
                    message: (data as KafkaActionResultFetchMessage).messages as IKafkaMessage[]
                })
            )
        } catch (e) {
            message.error(`Fetch errred: ${(e as Error).message}`)
        }
        setFetchLoading(false)
    }, [payload, clusterId, topicName, dispath, message])

    const setPayloadValue = (v: number | string, key: keyof KafkaActionPayloadFetchMessage) => {
        setPayload((pre) => ({
            ...pre,
            [key]: v
        }))
    }

    const setSearchOptionsValue = (v: number[] | string, key: 'key' | 'value' | 'timeRange') => {
        if (key == 'value') {
            setSearchOptions((pre) => ({
                ...pre,
                value: (v as string) || ''
            }))
        } else if (key == 'key') {
            setSearchOptions((pre) => ({
                ...pre,
                key: (v as string) || ''
            }))
        } else {
            if (v && v.length > 1 && _.isNumber(v[0]) && _.isNumber(v[1])) {
                setSearchOptions((pre) => ({
                    key: pre.key,
                    value: pre.value,
                    startTime: v[0] as number,
                    endTime: v[1] as number
                }))
            } else {
                setSearchOptions((pre) => ({
                    key: pre.key,
                    value: pre.value,
                    startTime: 0,
                    endTime: 0
                }))
            }
        }
    }

    const handleResize =
        (index: number) =>
        (__: React.SyntheticEvent, { size }: ResizeCallbackData) => {
            setTableColums((prevColumns) => {
                const newColumns = [...prevColumns!]
                newColumns[index] = {
                    ...newColumns[index],
                    width: size.width
                }
                return newColumns
            })
        }
    const mergedColumns = tableColums!.map((col, index) => ({
        ...col,
        onHeaderCell: (column: ColumnsType<IKafkaMessage>[number]) => ({
            width: column!.width,
            onResize: handleResize(index),
        })
    }))

    const components: TableProps<IKafkaMessage>['components'] = {
        header: {
            cell: ResizableTitle
        }
    }

    const filterMessages = useCallback(() => {
        let result = [...messages]
        // 按 Key 过滤
        if (searchOptions.key) {
            result = result.filter((msg) =>
                msg.key?.toLowerCase().includes(searchOptions.key.toLowerCase())
            )
        }

        // 按 Value 过滤
        if (searchOptions.value) {
            result = result.filter((msg) =>
                msg.value?.toLowerCase().includes(searchOptions.value.toLowerCase())
            )
        }

        // 按时间范围过滤
        if (searchOptions.startTime && searchOptions.endTime) {
            result = result.filter((msg) => {
                const msgTime = parseInt(msg.timestamp); // 假设 timestamp 是毫秒时间戳
                return msgTime >= searchOptions.startTime && msgTime <= searchOptions.endTime;
            })
        }
        setFilteredMessages(result)
    }, [messages, searchOptions])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        filterMessages()
    }, [messages, filterMessages])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPayload((pre) => ({
            ...pre,
            clusterId: parseInt(clusterId as string),
            topic: topicName!
        }))
    }, [clusterId, topicName])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden'
            }}
        >
            <Space orientation="vertical" size="large">
                <Space size="large" align="center">
                    <Space size="small" align="center">
                        <Typography.Text strong>Fetch Count Per Paritition:</Typography.Text>
                        <InputNumber
                            size="small"
                            value={payload.count}
                            min={1}
                            max={10000}
                            precision={0}
                            onChange={(v) => setPayloadValue(v as number, 'count')}
                        />
                    </Space>
                    <Space size="small" align="center">
                        <Typography.Text strong>Direction:</Typography.Text>
                        <Select
                            size="small"
                            value={payload.direction}
                            onChange={(v) => setPayloadValue(v as string, 'direction')}
                            style={{ width: 80 }}
                            options={[
                                { value: 'latest', label: 'latest' },
                                { value: 'oldest', label: 'oldest' }
                            ]}
                        />
                    </Space>
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            loading={fetchLoading}
                            icon={<SendOutlined />}
                            onClick={fetchMessages}
                        >
                            Fetch
                        </Button>
                    </Space>
                </Space>
                <Card title="Filter Messages" size="small">
                    <Space>
                        <Space>
                            <Typography.Text strong>Key:</Typography.Text>
                            <Input
                                placeholder="Search Key"
                                size="small"
                                style={{ width: 90 }}
                                onChange={(v) => setSearchOptionsValue(v.target.value, 'key')}
                            />
                        </Space>
                        <Space>
                            <Typography.Text strong>Value:</Typography.Text>
                            <Input
                                placeholder="Search Value"
                                size="small"
                                style={{ width: 180 }}
                                onChange={(v) => setSearchOptionsValue(v.target.value, 'value')}
                            />
                        </Space>
                        <Space>
                            <Typography.Text strong>Timestamp:</Typography.Text>
                            <DatePicker.RangePicker
                                style={{ width: 320 }}
                                showTime
                                size="small"
                                onChange={(dates) => {
                                    if (dates) {
                                        setSearchOptionsValue(
                                            [
                                                (dates[0]?.unix() || 0) * 1000,
                                                (dates[1]?.unix() || 0) * 1000
                                            ],
                                            'timeRange'
                                        )
                                    } else {
                                        setSearchOptionsValue([0, 0], 'timeRange')
                                    }
                                }}
                            />
                        </Space>
                    </Space>
                </Card>
            </Space>
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    padding: '8px 8px 8px 8px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 15
                }}
                className="common-scroll-container"
            >
                <Table
                    bordered
                    rowKey={(record) => `${record.partition}-${record.offset}`}
                    size="small"
                    components={components}
                    columns={mergedColumns}
                    dataSource={filteredMessages}
                    tableLayout="fixed"
                    // scroll={{ y: '100%' }}
                    pagination={{
                        placement: ['topEnd', 'bottomEnd']
                    }}
                    sticky={{ offsetHeader: -10 }}
                    style={{ height: '100%', width: '100%' }}
                />
            </div>
        </div>
    )
}
