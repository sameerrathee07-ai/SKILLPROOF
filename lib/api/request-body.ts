import { ValidationError } from "./errors";

/**
 * Parse a JSON request body, turning malformed input into a 400 instead of a 500.
 */
export async function readJsonBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
}
