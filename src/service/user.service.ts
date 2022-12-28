import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { NotFountHttpError } from '../error/custom.error';

export type IUserData = Partial<User>;
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

  async createUser({ email, username, avatar, website }: IUserData) {
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

  async updateUser(
    id: number,
    { email, username, avatar, website }: IUserData
  ) {
    const user = await this.findUser(id);
    return await this.userModel.save({
      ...user,
      email,
      username,
      avatar,
      website,
    });
  }

  async findUserList(page: number, pageSize: number, q: string) {
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

  async loginUser(userData: IUserData) {
    const { email } = userData;
    let user = await this.userModel.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      user = await this.createUser(userData);
    } else {
      user = await this.updateUser(user.id, userData);
    }

    return await this.findUser(user.id);
  }
}
