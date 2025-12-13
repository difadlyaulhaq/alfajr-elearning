// lib/api/helpers.ts
import { NextResponse } from 'next/server';

/**
 * Helper untuk membuat response sukses
 */
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    message,
    data
  });
}

/**
 * Helper untuk membuat response error
 */
export function errorResponse(
  error: string, 
  status: number = 500, 
  details?: any
) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return NextResponse.json(
    {
      success: false,
      error,
      ...(isDev && details ? { details } : {})
    },
    { status }
  );
}

/**
 * Helper untuk await params (Next.js 15 compatibility)
 */
export async function getParams<T>(params: Promise<T> | T): Promise<T> {
  if (params instanceof Promise) {
    return await params;
  }
  return params;
}

/**
 * Helper untuk log API request
 */
export function logApiRequest(
  method: string, 
  endpoint: string, 
  data?: any
) {
  const timestamp = new Date().toISOString();
  console.log(`[API ${method}] ${endpoint}`, {
    timestamp,
    ...(data ? { data } : {})
  });
}

/**
 * Helper untuk handle API errors
 */
export function handleApiError(error: any, context: string) {
  console.error(`[API ERROR - ${context}]:`, {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  // Specific error handling
  if (error.code === 'permission-denied') {
    return errorResponse('Akses ditolak', 403);
  }
  
  if (error.code === 'not-found') {
    return errorResponse('Data tidak ditemukan', 404);
  }
  
  return errorResponse(
    error.message || 'Internal server error',
    500,
    error.stack
  );
}