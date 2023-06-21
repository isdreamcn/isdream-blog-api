import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as uuid from 'uuid';
import { Provide } from '@midwayjs/decorator';
import { UploadFileInfo } from '@midwayjs/upload';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entity/file';
import { NotFountHttpError, ParameterError } from '../error/custom.error';
import { CommonFindListDTO } from '../dto/common';
import { uploadFileFolder } from '../config/config.custom';
import { toBoolean } from '../utils';

interface FileData {
  url: string;
  thumbUrl?: string;
  filename: string;
  mimeType: string;
}

@Provide()
export class FileService {
  @InjectEntityModel(File)
  fileModel: Repository<File>;

  // 保存文件
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
    const _uuid = uuid.v4();

    const _filename = `${_uuid}${ext}`;

    // 复制临时文件
    await fs
      .createReadStream(data)
      .pipe(fs.createWriteStream(path.join(folder, _filename)));

    // 生成缩略图
    let _thumbFilename = undefined;
    if (mimeType.indexOf('image') !== -1 && toBoolean(thumb) !== false) {
      _thumbFilename = `${_uuid}_100${ext}`;

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
      .where('file.url = :url OR file.thumbUrl = :url')
      .setParameters({
        // 设置目录分隔符
        url: path.join(url),
      })
      .getOne();

    if (!file) {
      throw new NotFountHttpError(`url为${url}的文件不存在`);
    }

    return file;
  }

  // 获取文件流
  async findFileStreamByUrl(url: string) {
    const filePath = path.join(uploadFileFolder, url);
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }
    throw new NotFountHttpError(`文件 ${url} 不存在`);
  }

  async createFile(
    file?: UploadFileInfo<string>,
    fields?: Record<string, any>
  ) {
    if (!file) {
      throw new ParameterError('请选择要上传的文件');
    }

    const { url, thumbUrl } = await this.saveFile(file, fields?.thumb);
    const { filename, mimeType } = file;

    const fileData: FileData = {
      filename,
      mimeType,
      url,
      thumbUrl,
    };

    return await this.fileModel.save(fileData);
  }

  async deleteFile(id: number) {
    const file = await this.findFile(id);
    this.removeFile(file.url);
    this.removeFile(file.thumbUrl);
    return await this.fileModel.remove(file);
  }

  async findFileList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.fileModel
      .createQueryBuilder('file')
      .where('file.url LIKE :q OR file.thumbUrl LIKE :q OR file.url LIKE :q')
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
