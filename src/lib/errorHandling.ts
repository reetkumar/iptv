// API error handling utilities
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface ResponseError {
  response?: {
    status: number;
    data?: {
      code?: string;
      message?: string;
    };
  };
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  const responseError = error as ResponseError;
  if (responseError.response) {
    const status = responseError.response.status;
    const code = responseError.response.data?.code || 'UNKNOWN_ERROR';
    const message = responseError.response.data?.message || getErrorMessage(status);

    return new APIError(status, code, message);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return new APIError(500, 'NETWORK_ERROR', String((error as { message: unknown }).message));
  }

  return new APIError(500, 'UNKNOWN_ERROR', 'An unexpected error occurred');
};

const getErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authenticated. Please sign in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  };

  return messages[status] || 'An error occurred. Please try again.';
};

// Retry logic for failed requests
export const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors
      if (error instanceof APIError && error.status < 500) {
        throw error;
      }

      // Calculate exponential backoff
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError as Error;
};

// Graceful degradation for offline support
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const onOnlineStatusChange = (callback: (isOnline: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
