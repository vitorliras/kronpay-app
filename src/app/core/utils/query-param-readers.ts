import { ParamMap } from '@angular/router';

export function readIntParam(params: ParamMap, key: string, min: number, max: number): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') return null;

  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

export function readEnumParam<T extends string>(
  params: ParamMap,
  key: string,
  allowed: readonly T[],
): T | null {
  const raw = params.get(key)?.trim();
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

export function readTextParam(params: ParamMap, key: string, maxLength = 60): string | null {
  const raw = params.get(key)?.trim();
  return raw && raw.length <= maxLength ? raw : null;
}

export function readDateParam(params: ParamMap, key: string): Date | null {
  const raw = params.get(key);
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;

  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

export function hasAnyParam(params: ParamMap, keys: readonly string[]): boolean {
  return keys.some((key) => params.has(key));
}
