import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../api/productAPI';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTypes = createAsyncThunk(
  'products/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getTypes();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCollections = createAsyncThunk(
  'products/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getCollections();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  'products/fetchBestSellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getBestSellers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getFeaturedProducts();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getNewArrivals();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await productAPI.createProduct(productData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateExistingProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await productAPI.updateProduct(id, productData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await productAPI.deleteProduct(id, auth.user.token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createNewType = createAsyncThunk(
  'products/createType',
  async (typeData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await productAPI.createType(typeData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateExistingType = createAsyncThunk(
  'products/updateType',
  async ({ id, typeData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await productAPI.updateType(id, typeData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteType = createAsyncThunk(
  'products/deleteType',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await productAPI.deleteType(id, auth.user.token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const rateProduct = createAsyncThunk(
  'products/rateProduct',
  async ({ productId, ratingData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // If we have an authenticated user with token, use authenticated endpoint (sends token)
      if (auth && auth.user && auth.user.token) {
        const response = await productAPI.rateProductAuthenticated(productId, ratingData, auth.user.token);
        return response;
      }

      // Public review
      const response = await productAPI.rateProduct(productId, ratingData, false);
      return response;
    } catch (error) {
      // If API provided structured error, forward it
      const err = error.response?.data || error;
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  products: [],
  product: null,
  types: [],
  collections: [],
  bestSellers: [],
  featuredProducts: [],
  newArrivals: [],
  loading: false,
  bestSellersLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalProducts: 0
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.totalProducts = action.payload.totalProducts || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Types
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })
      
      // Fetch Collections
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      
      // Fetch Best Sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.bestSellersLoading = true;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellersLoading = false;
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state) => {
        state.bestSellersLoading = false;
      })
      
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      })
      
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      
      // Update Product
      .addCase(updateExistingProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      
      // Create Type
      .addCase(createNewType.fulfilled, (state, action) => {
        state.types.push(action.payload);
      })
      
      // Update Type
      .addCase(updateExistingType.fulfilled, (state, action) => {
        const index = state.types.findIndex(t => t.id === action.payload._id);
        if (index !== -1) {
          state.types[index] = { ...action.payload, id: action.payload._id };
        }
      })
      
      // Delete Type
      .addCase(deleteType.fulfilled, (state, action) => {
        state.types = state.types.filter(t => t.id !== action.payload);
      })
      
      // Rate Product
      .addCase(rateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current product if it matches
        if (state.product && state.product._id === action.payload._id) {
          state.product = action.payload;
        }
        // Update product in products array if it exists
        const productIndex = state.products.findIndex(p => p._id === action.payload._id);
        if (productIndex !== -1) {
          state.products[productIndex] = action.payload;
        }
      })
      .addCase(rateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearProduct } = productSlice.actions;
export default productSlice.reducer;