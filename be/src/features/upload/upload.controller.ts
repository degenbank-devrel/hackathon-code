import { Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/ipfs')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFileIPFS(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<ObjectResponse<string>> {
    const uploadedFile = await this.uploadService.uploadFileIPFS(file);
    return new ObjectResponse(
      uploadedFile,
      'File uploaded to IPFS successfully',
      200,
    );
  }
}
