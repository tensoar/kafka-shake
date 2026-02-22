import { ClusterFormProps } from './types'
import { Button, Form, Input, Select, Switch } from 'antd'

const saslOptions = [
    { label: 'None', value: 'none' },
    { label: 'PLAIN', value: 'plain' },
    { label: 'SCRAM-SHA-256', value: 'scram-sha-256' },
    { label: 'SCRAM-SHA-512', value: 'scram-sha-512' }
]

export default function ClusterForm({ form, onfinish, type, loading = false }: ClusterFormProps) {
    const saslMechanism = Form.useWatch('saslMechanism', form)
    const showSaslCreds = saslMechanism && saslMechanism !== 'none'

    return (
        <Form form={form} layout="horizontal" onFinish={onfinish}>
            <Form.Item
                name="clusterName"
                label="ClusterName"
                rules={[{ required: true, message: "ClusterName can't be empty" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="brokers"
                label="Brokers"
                rules={[{ required: true, message: "Brokers can't be empty" }]}
                tooltip="Kafka broker hosts, like: <ip>:<port>,<ip>:<port>,<ip>:<port>"
            >
                <Input />
                {/* <Select
                    mode="tags"
                    placeholder="输入broker地址后按回车"
                    open={false} // 禁止下拉，仅作为标签输入
                    style={{ width: '100%' }}
                /> */}
            </Form.Item>

            <Form.Item
                name="clientId"
                label="Client ID"
                tooltip="If left blank, a random client id will be generated at runtime."
            >
                <Input placeholder="<Random>" />
            </Form.Item>

            <Form.Item
                name="useSSL"
                label="Use SSL"
                valuePropName="checked"
                tooltip="This feature has not yet been implemented."
            >
                <Switch disabled />
            </Form.Item>

            <Form.Item
                name="saslMechanism"
                label="SASL Mechanism"
                rules={[{ required: true, message: 'SASL Mechanism must be selected' }]}
                initialValue="none"
            >
                <Select options={saslOptions} />
            </Form.Item>

            {showSaslCreds && (
                <>
                    <Form.Item
                        name="saslUsername"
                        label="Username"
                        rules={[{ required: true, message: "Username can't be empty" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="saslPassword"
                        label="Password"
                        rules={[{ required: type === 'add', message: "Password can't be empty" }]}
                    >
                        <Input.Password placeholder={type === 'update' ? '<keep secret>' : ''} />
                    </Form.Item>
                </>
            )}

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {type == 'add' ? 'Add' : 'Update'}
                </Button>
            </Form.Item>
        </Form>
    )
}
