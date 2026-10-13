export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * A wrapper for fetch that automatically attaches the Django JWT
 * to the Authorization header for protected requests.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers || {});
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // We could try to refresh token here, but for simplicity we'll just throw 401
    // and let the app handle logout if needed.
    throw new ApiError('Unauthorized. Please log in again.', 401);
  }

  return response;
};
