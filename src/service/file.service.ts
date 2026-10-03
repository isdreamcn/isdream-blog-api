import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as uuid from 'uuid';
import * as mime from 'mime';
import axios from 'axios';
import { Provide, Inject } from '@midwayjs/decorator';
import { UploadFileInfo } from '@midwayjs/upload';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ILogger } from '@midwayjs/logger';
import { Repository } from 'typeorm';
import { File } from '../entity/file';
import { NotFountHttpError, ParameterError } from '../error/custom.error';
import { CommonFindListDTO } from '../dto/common';
import { QueryFileDTO } from '../dto/file';
import {
  uploadFileFolder,
  uploadNeedSaveFileTags,
} from '../config/config.custom';
import { MediaService } from './media.service';

interface FileData {
  url: string;
  filename: string;
  mimeType: string;
}

@Provide()
export class FileService {
  @Inject()
  logger: ILogger;

  @Inject()
  mediaService: MediaService;

  @InjectEntityModel(File)
  fileModel: Repository<File>;

  // 转存远程文件到 media-api（友链图标、OAuth 头像；不再写 File 表）
  async transferFile(url?: string, ownerId?: string | number) {
    if (!url || !/^https?:\/\//.test(url)) {
      return Promise.resolve({
        url,
      });
    }
    const response = await axios.request({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    // 获取 MIME 类型
    const contentType =
      response.headers['content-type'] || 'application/octet-stream';

    // 解析 Content-Disposition 响应头中的文件名
    const contentDisposition = response.headers['content-disposition'];
    let filename = '';
    if (contentDisposition) {
      const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
        contentDisposition
      );
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    // 如果无法从 Content-Disposition 中解析出文件名，则根据contentType生成filename
    if (!filename) {
      filename = `${uuid.v4()}.${mime.getExtension(contentType)}`;
    }

    const result = await this.mediaService.upload(
      Buffer.from(response.data),
      filename,
      contentType,
      ownerId
    );

    return {
      url: result.url,
      filename,
      mimeType: result.mime,
    };
  }

  // 编辑器配图直传 media-api（不写 File 表；封面/表情仍走 uploadFile 旧路径）
  async createMediaFile(
    file?: UploadFileInfo<string>,
    ownerId?: string | number
  ) {
    if (!file) {
      throw new ParameterError('请选择要上传的文件');
    }

    const buffer = fs.readFileSync(file.data);
    const result = await this.mediaService.upload(
      buffer,
      file.filename,
      file.mimeType,
      ownerId
    );

    return {
      url: result.url,
      filename: file.filename,
      mimeType: result.mime,
    };
  }

  // 保存文件
  async saveFile(file: UploadFileInfo<string>) {
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

    const { data, filename } = file;

    const ext = path.extname(filename);
    const _filename = `${uuid.v4()}${ext}`;

    // 复制临时文件
    await fs
      .createReadStream(data)
      .pipe(fs.createWriteStream(path.join(folder, _filename)));

    return {
      url: path.join(dateFolder, _filename),
    };
  }

  // 删除文件
  removeFile(url?: string) {
    const filePath = path.join(uploadFileFolder, url);
    fs.access(filePath, fs.constants.F_OK, err => {
      // 文件不存在
      if (err) {
        return;
      }

      fs.unlink(filePath, err => {
        if (err) {
          this.logger.warn(`文件删除失败：${err.message}`);
          this.logger.warn(`文件删除失败：${filePath}`);
        }
      });
    });
  }

  async findFile(id: number) {
    const file = await this.fileModel.findOne({
      where: {
        id,
      },
    });

    if (!file) {
      throw new NotFountHttpError(`id为${id}的文件不存在`);
    }

    return file;
  }

  async findFileByUrl(url: string) {
    const file = await this.fileModel
      .createQueryBuilder('file')
      .where('file.url = :url')
      .setParameters({
        // 设置目录分隔符
        url: path.join(url),
      })
      .getOne();

    if (!file) {
      throw new NotFountHttpError(`文件 ${url} 不存在`);
    }

    return file;
  }

  // 获取文件流
  async findFileStreamByUrl(
    url: string,
    mimeType: string,
    { w, h, q, f }: QueryFileDTO
  ) {
    const originFilePath = path.join(uploadFileFolder, url);
    if (!fs.existsSync(originFilePath)) {
      throw new NotFountHttpError(`文件 ${originFilePath} 不存在`);
    }

    const pathInfo = path.parse(url);
    const fileTag =
      (w ? `w${w}` : '') +
      (h ? `h${h}` : '') +
      (q ? `q${q}` : '') +
      (f ? `.${f}` : pathInfo.ext);

    // 原文件不是图片，或无需处理
    if (mimeType.indexOf('image') === -1 || fileTag === pathInfo.ext) {
      return fs.createReadStream(originFilePath);
    }

    const filePath = path.join(
      uploadFileFolder,
      pathInfo.dir,
      `${pathInfo.name}_${fileTag}`
    );
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }

    try {
      const _sharp = sharp(originFilePath)
        [f]({
          quality: q,
        })
        .resize({
          width: w,
          height: h,
        });
      if (uploadNeedSaveFileTags.includes(fileTag)) {
        _sharp.toFile(filePath);
      }
      return await _sharp.toBuffer();
    } catch (err) {
      this.logger.warn(`sharp处理文件失败：${filePath}`);
      this.logger.warn(`sharp处理文件失败：${err.message}`);
      throw err;
    }
  }

  async createFile(file?: UploadFileInfo<string>) {
    if (!file) {
      throw new ParameterError('请选择要上传的文件');
    }

    const { url } = await this.saveFile(file);
    const { filename, mimeType } = file;

    const fileData: FileData = {
      filename,
      mimeType,
      url,
    };

    return await this.fileModel.save(fileData);
  }

  async deleteFile(id: number) {
    const file = await this.findFile(id);
    const res = await this.fileModel.remove(file);

    const pathInfo = path.parse(file.url);

    this.removeFile(file.url);
    uploadNeedSaveFileTags.forEach(fileTag =>
      this.removeFile(path.join(pathInfo.dir, `${pathInfo.name}_${fileTag}`))
    );

    return res;
  }

  async findFileList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.fileModel
      .createQueryBuilder('file')
      .where('file.url LIKE :q OR file.filename LIKE :q')
      .setParameters({
        q: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }
}
