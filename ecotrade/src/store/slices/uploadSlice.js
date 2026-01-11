import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadAPI } from '../../api/uploadAPI';

// Async thunks
export const uploadSingleImage = createAsyncThunk(
  'upload/uploadSingleImage',
  async ({ file, folder = 'images', key }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await uploadAPI.uploadSingleImage(file, folder, auth.user.token);
      return { ...response, key };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadMultipleImages = createAsyncThunk(
  'upload/uploadMultipleImages',
  async ({ files, folder = 'images' }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await uploadAPI.uploadMultipleImages(files, folder, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  uploading: {},
  uploadProgress: {},
  multipleUploadProgress: {},
  uploadingMultiple: false,
  error: null
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.uploading = {};
      state.uploadProgress = {};
      state.multipleUploadProgress = {};
      state.uploadingMultiple = false;
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      const { key, progress } = action.payload;
      state.uploadProgress[key] = progress;
    },
    setMultipleUploadProgress: (state, action) => {
      const { fileIndex, progress } = action.payload;
      state.multipleUploadProgress[fileIndex] = progress;
    }
  },
  extraReducers: (builder) => {
    builder
      // Single Image Upload
      .addCase(uploadSingleImage.pending, (state, action) => {
        const key = action.meta.arg.key || 'default';
        state.uploading[key] = true;
        state.uploadProgress[key] = 0;
        state.error = null;
      })
      .addCase(uploadSingleImage.fulfilled, (state, action) => {
        const key = action.payload.key || 'default';
        state.uploading[key] = false;
        state.uploadProgress[key] = 100;
      })
      .addCase(uploadSingleImage.rejected, (state, action) => {
        const key = action.meta.arg.key || 'default';
        state.uploading[key] = false;
        state.uploadProgress[key] = 0;
        state.error = action.payload;
      })
      
      // Multiple Images Upload
      .addCase(uploadMultipleImages.pending, (state) => {
        state.uploadingMultiple = true;
        state.multipleUploadProgress = {};
        state.error = null;
      })
      .addCase(uploadMultipleImages.fulfilled, (state) => {
        state.uploadingMultiple = false;
        state.multipleUploadProgress = {};
      })
      .addCase(uploadMultipleImages.rejected, (state, action) => {
        state.uploadingMultiple = false;
        state.multipleUploadProgress = {};
        state.error = action.payload;
      });
  }
});

export const { resetUploadState, setUploadProgress, setMultipleUploadProgress } = uploadSlice.actions;
export default uploadSlice.reducer;