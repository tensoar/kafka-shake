import { ConfigProvider, theme } from 'antd'
import Main from './components/Main'
import { RootState } from './redux/store'
import { useSelector } from 'react-redux'

export default function App(): React.JSX.Element {
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)

    return (
        <ConfigProvider
            theme={{
                algorithm: themeStyle === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm
            }}
        >
            <Main />
        </ConfigProvider>
    )
}
