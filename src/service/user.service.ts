import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { NotFountHttpError, ParameterError } from '../error/custom.error';
import { UserDTO, UserLoginDTO } from '../dto/user';
import { CommonFindListDTO } from '../dto/common';
import { FileService } from './file.service';

type EditUserData = Partial<UserDTO> & { tempAvatar?: string };

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Inject()
  fileService: FileService;

  async checkUsernameUnique(username: string, id?: number) {
    const user = await this.userModel.findOne({
      where: {
        username,
      },
    });
    if (user && user.id !== id) {
      throw new ParameterError(`昵称 ${username} 不可用`);
    }
  }

  async findUser(id: number) {
    const user = await this.userModel.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFountHttpError(`id为${id}的用户不存在`);
    }

    return user;
  }

  async findUserHasEmail(id: number) {
    const user = await this.userModel.findOne({
      where: {
        id,
      },
      select: ['id', 'email', 'username', 'avatar', 'tempAvatar', 'website'],
    });

    if (!user) {
      throw new NotFountHttpError(`id为${id}的用户不存在`);
    }

    return user;
  }

  async createUser({
    email,
    username,
    avatar,
    tempAvatar,
    website,
  }: EditUserData) {
    await this.checkUsernameUnique(username);

    return await this.userModel.save({
      email,
      username,
      avatar,
      tempAvatar,
      website,
    });
  }

  async deleteUser(id: number) {
    const user = await this.findUser(id);
    return await this.userModel.softRemove(user);
  }

  async updateUser(
    id: number,
    { email, username, avatar, tempAvatar, website }: EditUserData
  ) {
    await this.checkUsernameUnique(username, id);

    const user = await this.findUser(id);
    return await this.userModel.save({
      ...user,
      email,
      username,
      avatar,
      tempAvatar,
      website,
    });
  }

  async findUserList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.userModel
      .createQueryBuilder('user')
      .select([
        'id',
        'email',
        'username',
        'avatar',
        'tempAvatar',
        'website',
        'createdAt',
        'updatedAt',
      ])
      .where('user.email LIKE :email OR user.username LIKE :username')
      .setParameters({
        email: `%${q}%`,
        username: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .orderBy('user.tempAvatar', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async loginUser(userData: UserLoginDTO) {
    const { email } = userData;
    let user = await this.userModel.findOne({
      where: {
        email,
      },
    });

    if (userData.username) {
      const editUserData = {
        ...userData,
        tempAvatar: userData.avatar,
        avatar: undefined,
      };

      if (!user) {
        user = await this.createUser(editUserData);
      } else {
        user = await this.updateUser(user.id, editUserData);
      }
    }

    if (!user) {
      throw new NotFountHttpError('用户不存在');
    }

    return await this.userModel.findOne({
      where: { id: user.id },
      select: ['id', 'email', 'username', 'avatar', 'tempAvatar', 'website'],
    });
  }

  // 设置用户头像
  // avatar => tempAvatar(本地保存)
  async setAvatar(id: number) {
    const user = await this.findUser(id);
    if (!user.tempAvatar) {
      return;
    }
    const { url } = await this.fileService.transferFile(user.tempAvatar);
    return await this.updateUser(id, {
      ...user,
      avatar: url,
      tempAvatar: null,
    });
  }
}
