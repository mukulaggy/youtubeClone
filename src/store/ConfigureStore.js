import { configureStore } from '@reduxjs/toolkit'
import youtubeReducer from "../features/youtube/youtubeSlice.js"

export const store = configureStore({
  reducer: {
    youtubeApp:youtubeReducer,
  },
})