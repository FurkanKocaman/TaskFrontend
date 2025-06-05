import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useUserStore } from 'src/store/user-store';
import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------
const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL':
      return { loading: false, user: action.payload.user };
    case 'LOGIN':
      return { ...state, user: action.payload.user };
    case 'REGISTER':
      return { ...state, user: action.payload.user };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

function getToken() {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
}

function getTokenSource() {
  if (localStorage.getItem(STORAGE_KEY)) return 'local';
  if (sessionStorage.getItem(STORAGE_KEY)) return 'session';
  return null;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setUser } = useUserStore();

  const initialize = useCallback(async () => {
    try {
      const accessToken = getToken();
      const tokenSource = getTokenSource();
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken, tokenSource === 'local');
        let user;
        try {
          const response = await axiosInstance.get(endpoints.auth.me);
          user = response.data.data.user;
          console.log('MeResponse', user);
          setUser(user);
        } catch (err) {
          throw new Error('Failed to fetch user');
        }

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, [setUser]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (email, password, remember = false) => {
    const data = { email, password };
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    const responseData = await response.json();
    const { accessToken, user } = responseData.data;

    setSession(accessToken, remember);
    setUser(user);
    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
  }, []);

  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = { email, password, firstName, lastName };
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const responseData = await response.json();
    const { accessToken, user } = responseData;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(() => {
    const value = {
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      register,
      logout,
    };
    console.log('Auth context value:', value);
    return value;
  }, [login, logout, register, state.user, status]);

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
