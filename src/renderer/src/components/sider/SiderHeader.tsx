import { Button, Col, Row, Space, theme, Tooltip, Typography } from 'antd'
import {
    DeleteOutlined,
    GithubOutlined,
    MoonOutlined,
    PlusOutlined,
    SunOutlined
} from '@ant-design/icons'
import KafkaFullLogo from '../svg/KafkaFullLogo'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { actions } from '@renderer/redux/actions'
import _ from 'lodash'

export default function SiderHeader(): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)
    const dispatch = useDispatch()
    const reversedThemeStyle = themeStyle === 'light' ? 'dark' : 'light'

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
                <Tooltip title="Add New Broker">
                    <Button
                        icon={<PlusOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                    />
                </Tooltip>
                <Tooltip title="Delete Selected Brokers">
                    <Button
                        icon={<DeleteOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                    />
                </Tooltip>
                <Tooltip title={`Change To ${_.upperFirst(reversedThemeStyle)} Mode`}>
                    <Button
                        icon={themeStyle === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                        onClick={() => dispatch(actions.theme.setThemeStyle(reversedThemeStyle))}
                    />
                </Tooltip>
                <Tooltip title="Open Github">
                    <Button
                        icon={<GithubOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                        onClick={() => window.open('https://github.com/tensoar')}
                    />
                </Tooltip>
            </Space>
        </div>
    )
}
