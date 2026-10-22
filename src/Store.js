
import { configureStore } from "@reduxjs/toolkit";
import galleryReducer from "./features/gallery/gallerSlice";

export const store = configureStore({
  reducer: {
    gallery: galleryReducer,
    //key
  },
});
