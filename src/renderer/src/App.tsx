import { ConfigProvider, theme } from 'antd'
import Main from './components/Main'
import { RootState } from './redux/store'
import { useSelector } from 'react-redux'
import { RouterProvider } from 'react-router'
import router from './router'

export default function App(): React.JSX.Element {
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)

    return (
        <ConfigProvider
            theme={{
                algorithm: themeStyle === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm
            }}
        >
            <RouterProvider router={router} />
        </ConfigProvider>
    )
}
