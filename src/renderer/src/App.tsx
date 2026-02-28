import { ConfigProvider, theme, App as AntApp } from 'antd'
import { RootState } from './redux/store'
import { useSelector } from 'react-redux'
import { RouterProvider } from 'react-router'
import router from './router'
import { useEffect } from 'react'

export default function App(): React.JSX.Element {
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)

    useEffect(() => {
        let bgColor: string
        let frontColor: string
        if (themeStyle == 'dark') {
            bgColor = '#363434'
            frontColor = '#242222'
        } else {
            bgColor = '#d6c9c9'
            frontColor = '#e0bc6d'
        }
        document.documentElement.style.setProperty('--color-scoll-bg-container', frontColor)
        document.documentElement.style.setProperty('--color-scoll-bg-layout', bgColor)
    }, [themeStyle])

    return (
        <ConfigProvider
            theme={{
                algorithm: themeStyle === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                token: {
                    fontSize: 13
                }
            }}
        >
            <AntApp>
                <RouterProvider router={router} />
            </AntApp>
        </ConfigProvider>
    )
}
