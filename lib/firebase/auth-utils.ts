// lib/auth-utils.ts
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

export const forceLogout = () => {
  // Clear semua storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect ke login
  window.location.href = '/login';
};