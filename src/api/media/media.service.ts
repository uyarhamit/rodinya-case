import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaEntity } from './entities/media.entity';
import { FileResponseDto } from './dto/response/file-response.dto';
import { plainToInstance } from 'class-transformer';
import { FilePermissionDto } from './dto/response/file-permission.dto';
import { SetPermissionDto } from './dto/set-permission.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaEntity: MediaEntity,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves a file by its ID if the user has the required permissions.
   *
   * @param {string} userId - The ID of the user attempting to access the file.
   * @param {string} id - The ID of the file to be retrieved.
   * @return {Promise<FileResponseDto>} A promise that resolves to a FileResponseDto object with file details.
   * @throws {NotFoundException} If the file with the specified ID is not found.
   * @throws {ForbiddenException} If the user does not have permission to access the file.
   */
  async findOne(userId: string, id: string): Promise<FileResponseDto> {
    const file = await this.mediaEntity.findById(id);
    if (!file) {
      throw new NotFoundException('File not found.');
    }

    if (file.ownerId.toString() !== userId) {
      const checkPermission = file.allowedUserIds.find(
        (allowedUserId) => allowedUserId.toString() === userId,
      );
      if (!checkPermission) {
        throw new ForbiddenException(
          'You do not have permission to access this file.',
        );
      }
    }

    return plainToInstance(FileResponseDto, {
      id: file._id.toString(),
      ownerId: file.ownerId.toString(),
      fileName: file.fileName,
      filePath: file.filePath,
      mimeType: file.mimeType,
      size: file.size,
      allowedUserIds: file.allowedUserIds,
      createdAt: file.createdAt,
    });
  }

  /**
   * Fetches a list of files belonging to the specified owner.
   *
   * @param {string} ownerId - The unique identifier of the owner whose files are to be retrieved.
   * @return {Promise<FileResponseDto[]>} - A promise that resolves to an array of file response DTOs.
   */
  async getMyFiles(ownerId: string): Promise<FileResponseDto[]> {
    const files = await this.mediaEntity.myFiles(ownerId);
    return files.map((file) =>
      plainToInstance(FileResponseDto, {
        id: file._id.toString(),
        ownerId: file.ownerId.toString(),
        filename: file.fileName,
        filePath: file.filePath,
        mimeType: file.mimeType,
        size: file.size,
        allowedUserIds: file.allowedUserIds,
        createdAt: file.createdAt,
      }),
    );
  }

  /**
   * Retrieves a file along with its permissions if the requesting user has access.
   *
   * @param {string} id - The unique identifier of the file to retrieve.
   * @param {string} ownerId - The unique identifier of the requesting user (owner).
   * @return {Promise<FilePermissionDto>} A promise resolving to the file permissions details.
   * @throws {ForbiddenException} Throws an exception if the user does not have the required permissions to access the file.
   */
  async getFilesWithPermissions(
    id: string,
    ownerId: string,
  ): Promise<FilePermissionDto> {
    const file = await this.mediaEntity.filesWithPermissions(id);

    if (file.ownerId._id.toString() !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to access this file.',
      );
    }

    return plainToInstance(FilePermissionDto, {
      id: file._id.toString(),
      ownerId: file.ownerId._id.toString(),
      owner: file.owner,
      filename: file.fileName,
      filePath: file.filePath,
      mimeType: file.mimeType,
      size: file.size,
      allowedUserIds: file.allowedUserIds,
      createdAt: file.createdAt,
    });
  }

  /**
   * Updates the permission settings of a specific file by assigning a list of allowed user IDs.
   *
   * @param {string} ownerId - The ID of the user requesting the change. Must match the file owner's ID.
   * @param {string} id - The unique identifier of the file whose permissions are to be modified.
   * @param {SetPermissionDto} setPermissionDto - Contains the list of allowed user IDs to grant access to the file.
   * @returns {Promise<FilePermissionDto>} A promise that resolves to an object representing the updated file permissions.
   * @throws {NotFoundException} If the specified file is not found.
   * @throws {ForbiddenException} If the user does not have permission to modify the file.
   */
  async setPermissionToFiles(
    ownerId: string,
    id: string,
    setPermissionDto: SetPermissionDto,
  ): Promise<FilePermissionDto> {
    const file = await this.mediaEntity.findById(id);
    if (!file) {
      throw new NotFoundException('File not found.');
    }

    if (file.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to access this file.',
      );
    }

    await this.mediaEntity.setPermissions(id, setPermissionDto.allowedUserIds);

    const fileWithPermissions = await this.mediaEntity.filesWithPermissions(id);

    return plainToInstance(FilePermissionDto, {
      id: fileWithPermissions._id.toString(),
      ownerId: fileWithPermissions.ownerId._id.toString(),
      owner: fileWithPermissions.owner,
      filename: fileWithPermissions.fileName,
      filePath: fileWithPermissions.filePath,
      mimeType: fileWithPermissions.mimeType,
      size: fileWithPermissions.size,
      allowedUserIds: fileWithPermissions.allowedUserIds,
      createdAt: fileWithPermissions.createdAt,
    });
  }

  /**
   * Uploads a file to the server, organizes it into a directory based on its type,
   * and stores metadata in the database.
   *
   * @param {Express.Multer.File} file - The file being uploaded, provided by Multer middleware.
   * @param {string} ownerId - The ID of the user who owns this file.
   * @return {Promise<FileResponseDto>} A promise that resolves to a DTO containing details of the uploaded file.
   */
  async uploadFile(
    file: Express.Multer.File,
    ownerId: string,
  ): Promise<FileResponseDto> {
    // Local storage logic (keeping existing functionality)
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Create a subdirectory based on the file type
    const fileType = file.mimetype.split('/')[0];
    const typePath = path.join(uploadPath, fileType);
    if (!fs.existsSync(typePath)) {
      fs.mkdirSync(typePath, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${uniqueId}${extension}`;
    const filePath = path.join(typePath, filename);

    const createFileDto: CreateMediaDto = {
      fileName: file.originalname,
      filePath: file.path || filePath.replace(/\\/g, '/'),
      mimeType: file.mimetype,
      size: file.size,
    };

    const uploadedFile = await this.mediaEntity.create(ownerId, createFileDto);

    return plainToInstance(FileResponseDto, {
      id: uploadedFile._id.toString(),
      ownerId: uploadedFile.ownerId.toString(),
      filename: uploadedFile.fileName,
      filePath: uploadedFile.filePath,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      allowedUserIds: uploadedFile.allowedUserIds,
      createdAt: uploadedFile.createdAt,
    });
  }

  /**
   * Deletes a file identified by its ID if the owner has the necessary permission.
   *
   * @param {string} id - The unique identifier of the file to be deleted.
   * @param {string} ownerId - The unique identifier of the owner attempting to delete the file.
   * @return {Promise<boolean>} A promise that resolves to true if the file was successfully deleted, otherwise an error is thrown.
   * @throws {NotFoundException} If the file with the given ID does not exist.
   * @throws {ForbiddenException} If the owner ID does not match the file's owner.
   */
  async deleteFile(id: string, ownerId: string): Promise<boolean> {
    const file = await this.mediaEntity.findById(id);
    if (!file) {
      throw new NotFoundException('File not found.');
    }
    if (file.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to delete this file.',
      );
    }

    const deletedFile = await this.mediaEntity.delete(id);
    if (deletedFile) {
      fs.unlinkSync(file.filePath);
    }

    return deletedFile;
  }
}
