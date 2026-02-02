export const fileValidationConfig = {
  maxFileSize: getMaxFileSizeInBytes(),

  allowedMimeTypes: {
    images: ['image/jpeg'],
  },
};

function getMaxFileSizeInBytes(): number {
  const DEFAULT_MB = 5;
  const raw = process.env.MAX_FILE_UPLOAD_LIMIT;
  const parsedMb = raw ? Number.parseFloat(raw) : NaN;

  const mb = Number.isFinite(parsedMb) && parsedMb > 0 ? parsedMb : DEFAULT_MB;
  return Math.floor(mb * 1024 * 1024);
}
