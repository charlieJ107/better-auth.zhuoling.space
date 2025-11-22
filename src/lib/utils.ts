import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateId(prefix?: string): string {
  return prefix ? `${prefix}_${crypto.randomUUID()}` : crypto.randomUUID();
}

export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch data from the API
 * @param args - The arguments to pass to the fetch function
 * @returns The data from the API
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetcher(...args: Parameters<typeof fetch>): Promise<any> {
  return fetch(...args).then(res => res.json());
}