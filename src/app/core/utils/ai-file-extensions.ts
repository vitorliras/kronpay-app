import { AiStatusResponse } from '../models/ai/ai-status-response.model';

const BASE_EXTENSIONS = ['csv', 'ofx'];
const AI_TABLE_EXTENSIONS = ['xlsx', 'xls'];
const AI_FILE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

export function allowedImportExtensions(status: AiStatusResponse | null): string[] {
  if (!status?.enabled) return BASE_EXTENSIONS;

  return [
    ...BASE_EXTENSIONS,
    ...AI_TABLE_EXTENSIONS,
    ...(status.supportsFiles ? AI_FILE_EXTENSIONS : []),
  ];
}

export function importAcceptAttribute(status: AiStatusResponse | null): string {
  return allowedImportExtensions(status)
    .map((extension) => `.${extension}`)
    .join(',');
}

export function isAiOnlyFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  return [...AI_TABLE_EXTENSIONS, ...AI_FILE_EXTENSIONS].includes(extension);
}
