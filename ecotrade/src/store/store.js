import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import adminSlice from './slices/adminSlice';
import collectionSlice from './slices/collectionSlice';
import uploadSlice from './slices/uploadSlice';
import newsletterContactSlice from './slices/newsletterContactSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    orders: orderSlice,
    admin: adminSlice,
    collections: collectionSlice,
    upload: uploadSlice,
    newsletterContact: newsletterContactSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export default store;