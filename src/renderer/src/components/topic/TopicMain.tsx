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
    theme
} from 'antd'
import { SearchOutlined, SendOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import _ from 'lodash'
import { ResizeCallbackData } from 'react-resizable'
import ResizableTitle from './ResizableTitle'
import { ColumnsType } from 'antd/es/table'

export default function TopicMain() {
    const { clusterId, topicName } = useParams<{ clusterId: string; topicName: string }>()
    const messages = useTopicMessages(parseInt(clusterId as string), topicName as string)
    const [payload, setPayload] = useState<KafkaWokerPayloadFetchMessage>({
        action: 'fetch-message',
        direction: 'latest',
        count: 500,
        topic: topicName as string,
        clusterId: parseInt(clusterId as string, 10)
    })
    const [searchOptions, setSearchOptions] = useState<{
        value: string
        startTime: number
        endTime: number
    }>({ value: '', startTime: 0, endTime: 0 })

    const dispath = useDispatch()

    const [tableColums, setTableColums] = useState<TableProps<IKafkaMessage>['columns']>([
        {
            title: 'Partition',
            dataIndex: 'partition',
            key: 'partition',
            width: 80
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            sortDirections: ['ascend', 'descend'],
            width: 60
        },
        {
            title: 'Offset',
            dataIndex: 'offset',
            key: 'offset',
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
                    {_.fill(Array(500), value).join(",")}
                </div>
            )
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            sortDirections: ['ascend', 'descend'],
            width: 120
        }
    ])

    const setPayloadValue = (v: number | string, key: keyof KafkaWokerPayloadFetchMessage) => {
        setPayload((pre) => ({
            ...pre,
            [key]: v
        }))
    }

    const setSearchOptionsValue = (v: number[] | string, key: 'value' | 'timeRange') => {
        if (key == 'value') {
            setSearchOptions((pre) => ({
                ...pre,
                value: (v as string) || ''
            }))
        } else {
            if (v && v.length > 1 && _.isNumber(v[0]) && _.isNumber(v[1])) {
                setSearchOptions((pre) => ({
                    value: pre.value,
                    startTime: v[0] as number,
                    endTime: v[1] as number
                }))
            } else {
                setSearchOptions((pre) => ({
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
                                        message: _.fill(Array(10000), (data as KafkaWokerMessageFetchMessage).messages[0]) as IKafkaMessage[]
                                    })
                                )
                            }}
                        >
                            Fetch
                        </Button>
                    </Space>
                </Space>
                <Space>
                    <Space>
                        <Typography.Text strong>Value:</Typography.Text>
                        <Input
                            placeholder="Input To Search By Value"
                            width={160}
                            onChange={(v) => setSearchOptionsValue(v.target.value, 'value')}
                        />
                    </Space>
                    <Space>
                        <Typography.Text strong>Date:</Typography.Text>
                        <DatePicker.RangePicker
                            showTime
                            onChange={(dates) => {
                                console.log(dates![0]?.unix())
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
                    <Button icon={<SearchOutlined />} type="primary">Search</Button>
                </Space>
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
                    size="small"
                    components={components}
                    columns={mergedColumns}
                    dataSource={messages}
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
