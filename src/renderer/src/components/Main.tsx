import { Layout, theme } from 'antd'
import { Content } from 'antd/es/layout/layout'
import SiderMain from './sider/SiderMain'
import Sider from 'antd/es/layout/Sider'

export default function Main(): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG, colorBgLayout }
    } = theme.useToken()

    return (
        <Layout
            style={{
                height: '100vh',
                width: '100vw',
                padding: '5px 5px 5px 5px',
                background: colorBgLayout
            }}
        >
            <Sider
                width={300}
                style={{
                    height: '100%',
                    borderRadius: borderRadiusLG,
                    overflow: 'hidden',
                    background: colorBgLayout
                }}
            >
                <SiderMain />
            </Sider>
            <Content
                style={{
                    marginLeft: '10px',
                    height: '100%',
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    overflow: 'auto',
                    padding: '10px'
                }}
            >
                Hello World
            </Content>
        </Layout>
    )
}
