
import { createSlice } from "@reduxjs/toolkit";

const gallerySlice = createSlice({
  name: "gallery",

  initialState: {
    images: [],
    hashes: [],
  },

  reducers: {
    addImages: (state, action) => {
      state.images.push(...action.payload);

      action.payload.forEach((image) => {
        state.hashes.push(image.id);
      });
    },

    removeImage: (state, action) => {
      state.images = state.images.filter(
        (image) => image.id !== action.payload
      );

      state.hashes = state.hashes.filter(
        (hash) => hash !== action.payload
      );
    },

    toggleFavorite: (state, action) => {
      const image = state.images.find(
        (image) => image.id === action.payload
      );

      if (image) {
        image.isFavorite = !image.isFavorite;
      }
    },
  },
});

export const {
  addImages,
  removeImage,
  toggleFavorite,
} = gallerySlice.actions;

export default gallerySlice.reducer;
