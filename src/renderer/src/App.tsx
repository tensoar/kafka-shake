import { ConfigProvider, theme } from 'antd'
import Main from './components/Main'

export default function App(): React.JSX.Element {
    return (
        <ConfigProvider
            theme={{ algorithm: theme.defaultAlgorithm }}
        >
            <Main />
        </ConfigProvider>
    )
}
