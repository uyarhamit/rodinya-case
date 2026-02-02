import { fileValidationConfig } from '../config/file-validation.config';

export function validateFileType(mimeType: string): boolean {
  return fileValidationConfig.allowedMimeTypes.images.includes(mimeType);
}
