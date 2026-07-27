import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    { success: true, data },
    { status: statusCode }
  );
}

export function errorResponse(message: string, statusCode = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status: statusCode }
  );
}

export const apiSuccessResponse = successResponse;
export const apiErrorResponse = errorResponse;

export function unauthorizedResponse(message = "Unauthorized access") {
  return errorResponse(message, 401);
}

export function badRequestResponse(message = "Bad request inputs") {
  return errorResponse(message, 400);
}

export function notFoundResponse(message = "Resource not found") {
  return errorResponse(message, 404);
}
