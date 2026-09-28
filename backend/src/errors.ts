export class HttpError extends Error {
  constructor(public status: number, message: string, public code: string) {
    super(message);
  }
}

export const conflict = (message: string, code: string) => new HttpError(409, message, code);
export const forbidden = (message: string) => new HttpError(403, message, "FORBIDDEN");
export const notFound = (message: string) => new HttpError(404, message, "NOT_FOUND");
