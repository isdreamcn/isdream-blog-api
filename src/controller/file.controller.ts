import {
  Controller,
  Post,
  File,
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
import { QueryFileDTO } from '../dto/file';

@Controller('/file')
export class FileController {
  @Inject()
  fileService: FileService;

  @Inject()
  ctx: Context;

  // 旧上传路径：封面/表情/文件管理页依赖响应 id 与 File 外键，仍写 File 表。
  // 正文配图与远程转存已切 media-api（见 upload-media 与 transferFile），收口随阶段 2 统一处理。
  @Post('/upload')
  async uploadFile(@File() file: UploadFileInfo<string>) {
    const data = await this.fileService.createFile(file);

    return {
      data: {
        ...data,
      },
    };
  }

  // 编辑器配图上传：转存 media-api（绝对 URL 直插正文，不写 File 表）
  @Post('/upload-media')
  async uploadMediaFile(@File() file: UploadFileInfo<string>) {
    const ownerId = this.ctx.user?.id ?? this.ctx.user?.username;
    const data = await this.fileService.createMediaFile(file, ownerId);

    return {
      data,
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
  @Validate()
  async findFile(@Query() query: QueryFileDTO) {
    const url = this.ctx.path.substring(this.ctx.path.indexOf('file/') + 5);
    const file = await this.fileService.findFileByUrl(url);

    // 缓存30天
    this.ctx.set('Cache-Control', 'public, max-age=2592000, immutable');
    this.ctx.set('Expires', new Date(Date.now() + 2592000000).toUTCString());

    this.ctx.set('Content-Type', query.f ? `image/${query.f}` : file.mimeType);

    return await this.fileService.findFileStreamByUrl(
      url,
      file.mimeType,
      query
    );
  }
}
