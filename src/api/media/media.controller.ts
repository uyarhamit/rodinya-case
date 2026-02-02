import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  Get,
  Param,
  Delete,
  Res,
  StreamableFile,
  Body,
} from '@nestjs/common';
import { MediaService } from './media.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DynamicFileInterceptor } from './decorators/file-upload.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { FileResponseDto } from './dto/response/file-response.dto';
import { createReadStream } from 'node:fs';
import { Response } from 'express';
import { SetPermissionDto } from './dto/set-permission.dto';
import { FilePermissionDto } from './dto/response/file-permission.dto';

@Controller('media')
@ApiTags('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(DynamicFileInterceptor())
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
    type: BaseResponseDto<FileResponseDto>,
    example: {
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: {
        id: '6980a......',
        ownerId: '698069......',
        filename: 'image.jpg',
        filePath: 'filePath',
        mimeType: 'image/jpeg',
        size: 12345,
        allowedUserIds: [],
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponseDto<FileResponseDto>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const uploadedFile = await this.mediaService.uploadFile(file, req.user.sub);
    return new BaseResponseDto(
      HttpStatus.CREATED,
      'File uploaded successfully',
      uploadedFile,
    );
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my files' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Files fetched successfully',
    type: BaseResponseDto<FileResponseDto[]>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'Files fetched successfully',
      data: [
        {
          id: '69809.....',
          ownerId: '69805.....',
          filename: 'image.jpg',
          filePath: 'filepath',
          mimeType: 'image/jpeg',
          size: 12344,
          allowedUserIds: [],
          createdAt: new Date().toISOString(),
        },
      ],
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async myFiles(@Request() req): Promise<BaseResponseDto<FileResponseDto[]>> {
    const files = await this.mediaService.getMyFiles(req.user.sub);
    return new BaseResponseDto(
      HttpStatus.OK,
      'Files fetched successfully',
      files,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get File by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File fetched successfully',
    type: BaseResponseDto<FileResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'File fetched successfully',
      data: {
        id: '69809....',
        ownerId: '69805f...',
        filename: 'image.jpg',
        filePath: 'filePath',
        mimeType: 'image/jpeg',
        size: 1234,
        allowedUserIds: [],
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'File not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to access this file.',
  })
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<BaseResponseDto<FileResponseDto>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }
    const file = await this.mediaService.findOne(req.user.sub, id);
    return new BaseResponseDto(
      HttpStatus.OK,
      'File fetched successfully',
      file,
    );
  }

  @Get(':id/download')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download File by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File downloaded successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'File not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to download this file.',
  })
  async download(
    @Request() req,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }

    const file = await this.mediaService.findOne(req.user.sub, id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    const stream = createReadStream(file.filePath);
    return new StreamableFile(stream);

    // const stream = createReadStream(file.filePath);
    //
    // return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete File by id' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File deleted successfully',
    example: {
      statusCode: HttpStatus.OK,
      message: 'File deleted successfully',
      data: true,
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'File not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to delete this file.',
  })
  async delete(
    @Request() req,
    @Param('id') id: string,
  ): Promise<BaseResponseDto<boolean>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }

    const deletedFile = await this.mediaService.deleteFile(id, req.user.sub);

    return new BaseResponseDto(
      HttpStatus.OK,
      'File deleted successfully',
      deletedFile,
    );
  }

  @Get(':id/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get File permissions by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File permissions fetched successfully',
    type: BaseResponseDto<FileResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'File permissions fetched successfully',
      data: {
        id: '6980a38....',
        ownerId: '69805ff.......',
        owner: {
          _id: '69805ff.......',
          email: 'email@example.com',
          role: 'admin',
        },
        filename: 'new.jpg',
        filePath: 'filePath',
        mimeType: 'image/jpeg',
        size: 1234,
        allowedUserIds: [],
        createdAt: '2026-02-02T13:15:50.920Z',
      },
    },
  })
  async getPermissions(@Request() req, @Param('id') id: string): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }
    return this.mediaService.getFilesWithPermissions(id, req.user.sub);
  }

  @Post(':id/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update File permissions by id' })
  @ApiBody({
    type: SetPermissionDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File permissions updated successfully',
    type: BaseResponseDto<FileResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'File permissions updated successfully',
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to update this file.',
  })
  async setPermissions(
    @Request() req,
    @Param('id') id: string,
    @Body() setPermissionDto: SetPermissionDto,
  ): Promise<BaseResponseDto<FilePermissionDto>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }

    const updatedFile = await this.mediaService.setPermissionToFiles(
      req.user.sub,
      id,
      setPermissionDto,
    );

    return new BaseResponseDto(
      HttpStatus.OK,
      'File permissions updated successfully',
      updatedFile,
    );
  }
}
