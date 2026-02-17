import SiderHeader from './SiderHeader'
import { theme } from 'antd'
import ClusterTree from './ClusterTree'
import { useState } from 'react'

export default function SiderMain(): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()

    const [checkedClusterKeys, setCheckedClusterKeys] = useState<number[]>([])

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
            <div style={{ flexShrink: 0 }}>
                <SiderHeader checkedClusterKeys={checkedClusterKeys} />
            </div>
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    padding: '8px 8px 8px 8px',
                    marginTop: 6,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG
                }}
            >
                <ClusterTree
                    onClusterChecked={(checkedKeys) => {
                        setCheckedClusterKeys(checkedKeys as number[])
                    }}
                />
            </div>
        </div>
    )
}
