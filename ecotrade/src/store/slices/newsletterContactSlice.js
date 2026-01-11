import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsletterContactAPI } from '../../api/newsletterContactAPI';

// Async thunks
export const subscribeNewsletter = createAsyncThunk(
  'newsletterContact/subscribeNewsletter',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await newsletterContactAPI.subscribeNewsletter(emailData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const submitContactForm = createAsyncThunk(
  'newsletterContact/submitContactForm',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await newsletterContactAPI.submitContactForm(contactData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getSubscribers = createAsyncThunk(
  'newsletterContact/getSubscribers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await newsletterContactAPI.getSubscribers(auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getContactSubmissions = createAsyncThunk(
  'newsletterContact/getContactSubmissions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await newsletterContactAPI.getContactSubmissions(auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateContactSubmission = createAsyncThunk(
  'newsletterContact/updateContactSubmission',
  async ({ id, updateData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await newsletterContactAPI.updateContactSubmission(id, updateData, auth.user.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteContactSubmission = createAsyncThunk(
  'newsletterContact/deleteContactSubmission',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await newsletterContactAPI.deleteContactSubmission(id, auth.user.token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  // Newsletter state
  newsletterSubscribing: false,
  newsletterSubscribed: false,
  newsletterError: null,
  subscribers: [],
  loadingSubscribers: false,
  
  // Contact form state
  contactSubmitting: false,
  contactSubmitted: false,
  contactError: null,
  contactSubmissions: [],
  loadingSubmissions: false
};

const newsletterContactSlice = createSlice({
  name: 'newsletterContact',
  initialState,
  reducers: {
    resetNewsletterState: (state) => {
      state.newsletterSubscribing = false;
      state.newsletterSubscribed = false;
      state.newsletterError = null;
    },
    resetContactState: (state) => {
      state.contactSubmitting = false;
      state.contactSubmitted = false;
      state.contactError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Newsletter subscription
      .addCase(subscribeNewsletter.pending, (state) => {
        state.newsletterSubscribing = true;
        state.newsletterError = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state) => {
        state.newsletterSubscribing = false;
        state.newsletterSubscribed = true;
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.newsletterSubscribing = false;
        state.newsletterError = action.payload;
      })
      
      // Contact form submission
      .addCase(submitContactForm.pending, (state) => {
        state.contactSubmitting = true;
        state.contactError = null;
      })
      .addCase(submitContactForm.fulfilled, (state) => {
        state.contactSubmitting = false;
        state.contactSubmitted = true;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.contactSubmitting = false;
        state.contactError = action.payload;
      })
      
      // Get subscribers
      .addCase(getSubscribers.pending, (state) => {
        state.loadingSubscribers = true;
      })
      .addCase(getSubscribers.fulfilled, (state, action) => {
        state.loadingSubscribers = false;
        state.subscribers = action.payload.subscribers || action.payload;
      })
      .addCase(getSubscribers.rejected, (state, action) => {
        state.loadingSubscribers = false;
        state.newsletterError = action.payload;
      })
      
      // Get contact submissions
      .addCase(getContactSubmissions.pending, (state) => {
        state.loadingSubmissions = true;
      })
      .addCase(getContactSubmissions.fulfilled, (state, action) => {
        state.loadingSubmissions = false;
        state.contactSubmissions = action.payload.submissions || action.payload;
      })
      .addCase(getContactSubmissions.rejected, (state, action) => {
        state.loadingSubmissions = false;
        state.contactError = action.payload;
      })
      
      // Update contact submission
      .addCase(updateContactSubmission.fulfilled, (state, action) => {
        const index = state.contactSubmissions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.contactSubmissions[index] = action.payload;
        }
      })
      
      // Delete contact submission
      .addCase(deleteContactSubmission.fulfilled, (state, action) => {
        state.contactSubmissions = state.contactSubmissions.filter(sub => sub._id !== action.payload);
      });
  }
});

export const { resetNewsletterState, resetContactState } = newsletterContactSlice.actions;
export default newsletterContactSlice.reducer;