import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { NotFountHttpError } from '../error/custom.error';
import { UserDTO, UserLoginDTO } from '../dto/user';
import { CommonFindListDTO } from '../dto/common';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

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

  async createUser({ email, username, avatar, website }: UserDTO) {
    return await this.userModel.save({
      email,
      username,
      avatar,
      website,
    });
  }

  async deleteUser(id: number) {
    const user = await this.findUser(id);
    return await this.userModel.softRemove(user);
  }

  async updateUser(id: number, { email, username, avatar, website }: UserDTO) {
    const user = await this.findUser(id);
    return await this.userModel.save({
      ...user,
      email,
      username,
      avatar,
      website,
    });
  }

  async findUserList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.userModel
      .createQueryBuilder('user')
      .where('user.email LIKE :email OR user.username LIKE :username')
      .setParameters({
        email: `%${q}%`,
        username: `%${q}%`,
      });

    const data = await queryBuilder
      .addOrderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
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
      if (!user) {
        user = await this.createUser(userData as UserDTO);
      } else {
        user = await this.updateUser(user.id, userData as UserDTO);
      }
    }

    if (!user) {
      throw new NotFountHttpError('用户不存在');
    }

    return await this.userModel.findOne({
      where: { id: user.id },
      select: ['id', 'email', 'username', 'avatar', 'website'],
    });
  }
}
