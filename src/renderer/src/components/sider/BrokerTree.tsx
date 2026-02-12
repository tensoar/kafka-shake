import { Tree, TreeDataNode, TreeProps } from 'antd'
import { CarryOutOutlined, FormOutlined } from '@ant-design/icons'

export default function BrokerTree(): React.JSX.Element {

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const treeData: TreeDataNode[] = [
        {
            title: 'Kafka Broker',
            key: '0-0',
            icon: <CarryOutOutlined />,
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',
                    checkable: false,
                    icon: <CarryOutOutlined />,
                    children: [
                        { title: 'leaf', key: '0-0-0-0', checkable: false, icon: <CarryOutOutlined /> },
                        { title: 'leaf', key: '0-0-0-2', checkable: false, icon: <CarryOutOutlined /> },
                    ],
                },
                {
                    title: 'parent 1-1',
                    checkable: false,
                    key: '0-0-1',
                    icon: <CarryOutOutlined />,
                    children: [{ title: 'leaf', key: '0-0-1-0', icon: <CarryOutOutlined /> }],
                },
                {
                    title: 'parent 1-2',
                    key: '0-0-2',
                    icon: <CarryOutOutlined />,
                    checkable: false,
                    children: [
                        { title: 'leaf', key: '0-0-2-0', icon: <CarryOutOutlined /> },
                        {
                            title: 'leaf',
                            key: '0-0-2-1',
                            icon: <CarryOutOutlined />,
                            switcherIcon: <FormOutlined />,
                        },
                    ],
                },
            ],
        },
        {
            title: 'parent 2',
            key: '0-1',
            icon: <CarryOutOutlined />,
            children: [
                {
                    title: 'parent 2-0',
                    key: '0-1-0',
                    icon: <CarryOutOutlined />,
                    children: [
                        { title: 'leaf', key: '0-1-0-0', icon: <CarryOutOutlined /> },
                        { title: 'leaf', key: '0-1-0-1', icon: <CarryOutOutlined /> },
                    ]
                }
            ]
        },

    ]

    return (
        <Tree
            checkable
            showLine={true}
            showIcon={true}
            defaultExpandedKeys={['0-0-0']}
            onSelect={onSelect}
            treeData={treeData}
        />
    )
}
