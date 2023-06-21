import {
  Controller,
  Post,
  File,
  Fields,
  Get,
  Inject,
  Param,
  Del,
  Query,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';
import { UploadFileInfo } from '@midwayjs/upload';
import { Role } from '../decorator/role.decorator';
import { FileService } from '../service/file.service';
import { CommonFindListDTO } from '../dto/common';

@Controller('/file')
export class FileController {
  @Inject()
  fileService: FileService;

  @Inject()
  ctx: Context;

  @Post('/upload')
  async uploadFile(@File() file: UploadFileInfo<string>, @Fields() fields) {
    const data = await this.fileService.createFile(file, fields);

    return {
      data: {
        ...data,
      },
    };
  }

  @Del('/:id')
  async deleteFile(@Param('id') id: number) {
    await this.fileService.deleteFile(id);
  }

  @Get()
  @Validate()
  async findFileList(@Query() query: CommonFindListDTO) {
    return await this.fileService.findFileList(query);
  }

  @Role(['pc'])
  @Get('/*')
  async findFile() {
    const url = this.ctx.path.substring(this.ctx.path.indexOf('file/') + 5);
    const file = await this.fileService.findFileByUrl(url);
    this.ctx.set('Content-Type', file.mimeType);

    return await this.fileService.findFileStreamByUrl(url);
  }
}
