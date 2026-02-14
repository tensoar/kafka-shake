import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeStyle = 'dark' | 'light'

export interface ThemeState {
    themeStyle: ThemeStyle
}

export const initialThemeState: ThemeState = {
    themeStyle: 'light'
}

const themeSlice = createSlice({
    name: 'theme',
    initialState: initialThemeState,
    reducers: {
        setThemeStyle: (state, action: PayloadAction<ThemeStyle>) => {
            state.themeStyle = action.payload
        }
    }
})

export const { setThemeStyle } = themeSlice.actions
export const themeReducer = themeSlice.reducer
