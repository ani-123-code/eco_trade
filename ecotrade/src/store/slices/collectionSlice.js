import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collectionAPI } from '../../api/collectionAPI';

// Async thunks
export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getCollections(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCollectionsGrouped = createAsyncThunk(
  'collections/fetchCollectionsGrouped',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getCollectionsGrouped();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  'collections/createCollection',
  async (collectionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await collectionAPI.createCollection(collectionData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCollection = createAsyncThunk(
  'collections/updateCollection',
  async ({ id, collectionData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await collectionAPI.updateCollection(id, collectionData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collections/deleteCollection',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await collectionAPI.deleteCollection(id, auth.user.token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  collections: [],
  groupedCollections: {},
  loading: false,
  error: null
};

const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Grouped Collections
      .addCase(fetchCollectionsGrouped.fulfilled, (state, action) => {
        state.groupedCollections = action.payload;
      })
      
      // Create Collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload);
      })
      
      // Update Collection
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.collections[index] = action.payload;
        }
      })
      
      // Delete Collection
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(c => c.id !== action.payload);
      });
  }
});

export const { clearError } = collectionSlice.actions;
export default collectionSlice.reducer;