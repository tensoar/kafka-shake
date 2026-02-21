import '../../assets/topic.css'
import useTopicMessages from '@renderer/hooks/useTopicMessages'
import { actions } from '@renderer/redux/actions'
import kafkaUtil from '@renderer/util/KafkaUtil'
import {
    IKafkaMessage,
    KafkaWokerMessageFetchMessage,
    KafkaWokerPayloadFetchMessage
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
    Card
} from 'antd'
import { SearchOutlined, SendOutlined } from '@ant-design/icons'
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
    const [filteredMessages, setFilteredMessages] = useState<IKafkaMessage[]>([])
    const [payload, setPayload] = useState<KafkaWokerPayloadFetchMessage>({
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
            width: 60
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            sortDirections: ['ascend', 'descend'],
            width: 60
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
                <span>{DateTime.fromMillis(parseInt(value)).toFormat('yyyy-LL-dd mm:hh:ss')}</span>
            )
        }
    ])

    const setPayloadValue = (v: number | string, key: keyof KafkaWokerPayloadFetchMessage) => {
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
        console.log('filterMessages ...')
        let result = [...messages]
        console.log('result: ', result)
        console.log('searchOptions: ', searchOptions)
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
                            icon={<SendOutlined />}
                            onClick={async () => {
                                const payload: KafkaWokerPayloadFetchMessage = {
                                    clusterId: parseInt(clusterId as string),
                                    topic: topicName as string,
                                    count: 10,
                                    direction: 'latest',
                                    action: 'fetch-message'
                                }
                                const data = await window.api.callKafkaAction(payload)
                                console.log('fetch data: ', data)
                                dispath(
                                    actions.kafkaMessage.initMessage({
                                        topicId: kafkaUtil.buildTopicId(
                                            clusterId as string,
                                            topicName as string
                                        ),
                                        message: (data as KafkaWokerMessageFetchMessage)
                                            .messages as IKafkaMessage[]
                                    })
                                )
                            }}
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
                            <Typography.Text strong>Date:</Typography.Text>
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
