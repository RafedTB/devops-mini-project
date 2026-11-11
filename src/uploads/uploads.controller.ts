import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response, Express } from 'express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileUploadDto } from './dto/files-upload.dto';

@Controller('api/uploads')
export class UploadsController {
  //Post api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    console.log('Uploaded file:', file);
    return { message: 'File uploaded successfully', filename: file.filename };
  }

  //Post api/uploads/multiple
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto, description: 'Multiple files upload' })
  public uploadMultipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('Files are required');
    console.log('Uploaded files:', files);
    return {
      message: 'Files uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  //Get api/uploads
  @Get(':image')
  public getUploadedFiles(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: './images' });
  }
}
