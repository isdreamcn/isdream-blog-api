import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
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
import { NotFountHttpError } from '../error/custom.error';
import { Role } from '../decorator/role.decorator';
import { uploadFileFolder } from '../config/config.custom';
import { FileService } from '../service/file.service';
import { toBoolean } from '../utils';
import { CommonFindListDTO } from '../dto/common';

@Controller('/file')
export class FileController {
  @Inject()
  fileService: FileService;

  @Inject()
  ctx: Context;

  async saveFile(file: UploadFileInfo<string>, thumb = true) {
    const date = new Date();
    const dateFolder = path.join(
      `${date.getFullYear()}`,
      `${date.getMonth() + 1}`,
      `${date.getDate()}`
    );
    const folder = path.join(uploadFileFolder, dateFolder);

    // 生成文件夹
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const { data, filename, mimeType } = file;
    const ext = path.extname(filename);
    const now = Date.now();

    const _filename = `${now}${ext}`;

    // 复制临时文件
    await fs
      .createReadStream(data)
      .pipe(fs.createWriteStream(path.join(folder, _filename)));

    // 生成缩略图
    let _thumbFilename = undefined;
    if (mimeType.indexOf('image') !== -1 && toBoolean(thumb) !== false) {
      _thumbFilename = `${now}-100${ext}`;

      let _sharp = sharp(data).resize({
        width: 100,
        height: 100,
        fit: 'inside',
      });

      if (mimeType === 'image/png') {
        _sharp = _sharp.png({
          quality: 10,
        });
      } else if (mimeType === 'image/jpeg') {
        _sharp = _sharp.jpeg({
          quality: 10,
        });
      }

      await _sharp.toFile(path.join(folder, _thumbFilename));
    }

    return {
      url: path.join(dateFolder, _filename),
      thumbUrl: _thumbFilename
        ? path.join(dateFolder, _thumbFilename)
        : undefined,
    };
  }

  @Post('/upload')
  async uploadFile(@File() file: UploadFileInfo<string>, @Fields() fields) {
    if (!file) {
      throw new Error('请选择要上传的文件');
    }

    const { url, thumbUrl } = await this.saveFile(file, fields.thumb);
    const { filename, mimeType } = file;

    await this.fileService.createFile({
      filename,
      mimeType,
      url,
      thumbUrl,
    });

    return {
      data: {
        filename,
        mimeType,
        url,
        thumbUrl,
      },
    };
  }

  // 删除文件
  removeFile(url?: string) {
    if (!path) {
      return;
    }
    const filePath = path.join(uploadFileFolder, url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  @Del('/:id')
  async deleteFile(@Param('id') id: number) {
    const file = await this.fileService.findFile(id);
    if (file) {
      this.removeFile(file.url);
      this.removeFile(file.thumbUrl);
    }
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
    const url = path.join(
      this.ctx.path.substring(this.ctx.path.indexOf('file/') + 5)
    );

    const file = await this.fileService.findFileByUrl(url);

    this.ctx.set('Content-Type', file.mimeType);

    const filePath = path.join(uploadFileFolder, url);
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }
    throw new NotFountHttpError(`文件 ${url} 不存在`);
  }
}
