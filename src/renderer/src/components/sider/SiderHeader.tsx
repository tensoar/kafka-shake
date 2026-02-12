import { Button, Col, Row, Space, theme, Typography } from 'antd'
import { DeleteOutlined, MoonOutlined, PlusOutlined, SunOutlined } from '@ant-design/icons'
import KafkaFullLogo from '../svg/KafkaFullLogo'

export default function SiderHeader(): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()

    return (
        <div
            style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                paddingBottom: 15
            }}
        >
            <Row style={{ width: '100%' }} justify="center" align="middle">
                <Col>
                    <KafkaFullLogo height="100px" width="100px" color="#0c4b29" />
                </Col>
                <Col>
                    <Typography.Title
                        italic={true}
                        level={4}
                        style={{ marginTop: 5, color: '#0c4b29', fontWeight: 660 }}
                    >
                        Shake
                    </Typography.Title>
                </Col>
            </Row>
            <Space
                size="small"
                style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    marginTop: -25
                }}
            >
                <Button
                    icon={<PlusOutlined />}
                    shape="square"
                    size="small"
                    style={{ borderRadius: '20%' }}
                />
                <Button
                    icon={<DeleteOutlined />}
                    shape="square"
                    size="small"
                    style={{ borderRadius: '20%' }}
                />
                <Button
                    icon={<MoonOutlined />}
                    shape="square"
                    size="small"
                    style={{ borderRadius: '20%' }}
                />
            </Space>
        </div>
    )
}
