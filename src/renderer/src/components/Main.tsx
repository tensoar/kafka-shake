import { Button, Layout, Menu, MenuProps, Select, Space, Switch, theme, TreeProps } from 'antd'
import { Content } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useState } from 'react';
// import KafkaLogo from './assets/kafka_white.svg'
import KafkaIconLogo from './svg/KafkaIconLogo'
import KafkaFullLogo from './svg/KafkaFullLogo'

type MenuItem = Required<MenuProps>['items'][number];

export default function Main(): React.JSX.Element {
    // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
    const [collapsed, setCollapsed] = useState(false)
    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()

    function getItem(
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
    ): MenuItem {
        return {
            key,
            icon,
            children,
            label,
        } as MenuItem;
    }

    const thenmeOptions = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
    ];

    const items: MenuItem[] = [
        getItem('测试环境的kafka集群实例', '1', <PieChartOutlined />),
        getItem('Topics', 'sub1', <UserOutlined />, [
            getItem('tj_tn_real_data_ppd_point_bn_326y', '3'),
            getItem('Bill', '4'),
            getItem('Alex', '5'),
        ]),
        getItem('Consumers', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    ]

    return (
        <Layout style={{ height: '100vh', width: '100vw' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        padding: '16px 0',
                    }}
                >
                    <div
                        style={{
                            height: '48px',
                            maxWidth: collapsed ? '48px' : '144px',
                            margin: '15px auto'
                        }}
                    >
                        {collapsed ? (
                            <KafkaIconLogo height="100%" width="100%" />
                        ) : (
                            <KafkaFullLogo height="100%" width="100%" />
                        )}
                    </div>
                </div>
                <Space
                    size="small"
                    orientation={collapsed ? 'vertical' : 'horizontal'}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 16,
                        marginLeft: collapsed ? 5 : 0
                    }}
                >
                    <Button color="primary" size="small" variant="filled" style={{ width: '70px' }}>
                        Add
                    </Button>
                    <Select
                        variant="filled"
                        options={thenmeOptions}
                        defaultValue="light"
                        size="small"
                        style={{
                            width: '70px',
                            color: theme.useToken().token.colorPrimaryText,
                            background: theme.useToken().token.colorPrimaryBg
                        }}
                    />
                </Space>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Sider>
            <Layout>
                {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
                <Content style={{ margin: '0px 10px 10px 10px', height: '100%' }}>
                    <Layout
                        style={{
                            height: '100%',
                            borderRadius: borderRadiusLG
                        }}
                    >
                        <Sider
                            width={300}
                            style={{
                                height: '100%',
                                borderRadius: borderRadiusLG,
                                background: colorBgContainer
                            }}
                        >
                            <Menu
                                defaultSelectedKeys={['1']}
                                mode="inline"
                                items={items}
                                style={{ borderRadius: borderRadiusLG }}
                            />
                        </Sider>
                        <Content
                            style={{
                                marginLeft: '10px',
                                height: '100%',
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                overflow: 'auto'
                            }}
                        >

                        </Content>
                    </Layout>
                </Content>
            </Layout>
        </Layout>
    )
}
