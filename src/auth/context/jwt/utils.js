import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp) => {
  let expiredTimer;
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;
  clearTimeout(expiredTimer);
  expiredTimer = setTimeout(() => {
    alert('Token expired');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    window.location.href = paths.auth.jwt.login;
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken, remember = false) => {
  if (accessToken) {
    if (remember) {
      localStorage.setItem('accessToken', accessToken);
      sessionStorage.removeItem('accessToken');
    } else {
      sessionStorage.setItem('accessToken', accessToken);
      localStorage.removeItem('accessToken');
    }
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const { exp } = jwtDecode(accessToken);
    tokenExpired(exp);
  } else {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
};
