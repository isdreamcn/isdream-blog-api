import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entity/file';
import { NotFountHttpError } from '../error/custom.error';
import { CommonFindListDTO } from '../dto/common';

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
        url,
      })
      .getOne();

    if (!file) {
      throw new NotFountHttpError(`url为${url}的文件不存在`);
    }

    return file;
  }

  async createFile(file: FileData) {
    return await this.fileModel.save(file);
  }

  async deleteFile(id: number) {
    const file = await this.findFile(id);
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
      .addOrderBy('createdAt', 'DESC')
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
