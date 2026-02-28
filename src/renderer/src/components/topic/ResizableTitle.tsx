import React from 'react'
import { Resizable, ResizeCallbackData } from 'react-resizable'

export interface ResizableTitleProps extends React.HTMLAttributes<HTMLTableCellElement> {
    width: number
    onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void
}

export default function ResizableTitle(props: ResizableTitleProps) {
    const { onResize, width, ...restProps } = props

    if (!width) {
        return <th {...restProps} />
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={
                <span
                    className="react-resizable-handle"
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} style={{ ...restProps.style, width }} />
        </Resizable>
    )
}
