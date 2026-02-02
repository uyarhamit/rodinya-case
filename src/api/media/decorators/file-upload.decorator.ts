import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import { fileValidationConfig } from '../config/file-validation.config';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { validateFileType } from '../utils/file.utils';
import { FileInterceptor } from '@nestjs/platform-express';

export function DynamicFileInterceptor(): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<Observable<any>> {
      const uploadPath = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const multerOptions = {
        limits: {
          fileSize: fileValidationConfig.maxFileSize,
        },
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = path.join(process.cwd(), 'uploads');
            const fileType = file.mimetype.split('/')[0];
            const fullPath = path.join(uploadPath, fileType);

            // Ensure the directory exists
            if (!fs.existsSync(fullPath)) {
              fs.mkdirSync(fullPath, { recursive: true });
            }

            cb(null, fullPath);
          },
          filename: (req, file, cb) => {
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const uniqueId = uuidv4();
            const extension = path.extname(file.originalname);
            const filename = `${timestamp}-${uniqueId}${extension}`;
            cb(null, filename);
          },
        }),
        fileFilter: (req, file, cb) => {
          const isValid = validateFileType(file.mimetype);
          if (!isValid) {
            return cb(new BadRequestException('File type not allowed'), false);
          }
          cb(null, true);
        },
      };

      const fileInterceptor = FileInterceptor('file', multerOptions);
      const interceptorInstance = new fileInterceptor();
      return interceptorInstance.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}
