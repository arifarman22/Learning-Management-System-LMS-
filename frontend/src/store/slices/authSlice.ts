import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginDto, RegisterDto } from '@/lib/api/auth.api';
import { User, AuthTokens } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      console.log('[AuthSlice] Calling authApi.login with:', credentials.email);
      const response = await authApi.login(credentials);
      console.log('[AuthSlice] API response:', response);
      
      // Store tokens in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      // Store in cookies for middleware
      document.cookie = `accessToken=${response.accessToken}; path=/; max-age=900`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(response.user))}; path=/; max-age=604800`;
      
      console.log('[AuthSlice] Saved to localStorage and cookies');
      
      return response;
    } catch (error: any) {
      console.error('[AuthSlice] Login error:', error);
      console.error('[AuthSlice] Error response:', error.response);
      console.error('[AuthSlice] Error data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterDto, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      
      // Store tokens in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      // Store in cookies for middleware
      document.cookie = `accessToken=${response.accessToken}; path=/; max-age=900`;
      document.cookie = `user=${JSON.stringify(response.user)}; path=/; max-age=604800`;
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Logout locally even if API call fails
  } finally {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Clear cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
  }
});

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (userStr && accessToken && refreshToken) {
    return {
      user: JSON.parse(userStr) as User,
      accessToken,
      refreshToken,
    };
  }

  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });

    // Initialize
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.tokens = {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        };
        state.isAuthenticated = true;
      }
    });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
