import {
  Controller,
  Inject,
  Body,
  Del,
  Param,
  Post,
  Put,
  Get,
  Query,
} from '@midwayjs/decorator';
import { HttpStatus, MidwayHttpError } from '@midwayjs/core';
import axios from 'axios';
import { Validate } from '@midwayjs/validate';
import { ILogger } from '@midwayjs/logger';
import {
  UserLoginDTO,
  AdminUserDTO,
  AdminUserLoginDTO,
  OAuthLoginDTO,
} from '../dto/user';
import { CommonFindListDTO } from '../dto/common';
import { UserService } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';
import { Role } from '../decorator/role.decorator';

@Controller('/user')
export class UserController {
  @Inject()
  jwtService: JwtService;

  @Inject()
  userService: UserService;

  @Inject()
  logger: ILogger;

  @Post()
  @Validate()
  async createUser(@Body() user: AdminUserDTO) {
    await this.userService.createUser(user);
  }

  @Del('/:id')
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @Put('/:id')
  @Validate()
  async updateUser(@Param('id') id: number, @Body() user: AdminUserDTO) {
    await this.userService.updateUser(id, user);
  }

  @Get('/:id')
  async findUser(@Param('id') id: number) {
    const data = await this.userService.findUserHasEmail(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findUserList(@Query() query: CommonFindListDTO) {
    return await this.userService.findUserList(query);
  }

  @Post('/setAvatar/:id')
  async setUserAvatar(@Param('id') id: number) {
    await this.userService.setAvatar(id);
  }

  @Role(['pc'])
  @Post('/login')
  @Validate()
  async userLogin(@Body() user: UserLoginDTO) {
    const result = await this.userService.loginUser(user);

    return {
      data: {
        user: result,
        token: this.jwtService.signSync({
          ...result,
          email: undefined,
        }),
      },
    };
  }

  @Role(['pc'])
  @Post('/admin/login')
  @Validate()
  async adminUserLogin(@Body() { username, password }: AdminUserLoginDTO) {
    if (
      username === process.env.ADMIN &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return {
        data: {
          user: {
            username,
          },
          token: this.jwtService.signSync({
            username,
            isAdmin: true,
          }),
        },
      };
    } else {
      throw new MidwayHttpError('用户名或密码错误', HttpStatus.UNAUTHORIZED);
    }
  }

  @Role(['pc'])
  @Post('/admin/oauth_login')
  @Validate()
  async oauthLogin(@Body() { code, code_verifier }: OAuthLoginDTO) {
    try {
      const res = await axios.request({
        url: 'https://api.account.isdream.cn/oidc/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: {
          client_id: process.env.OAUTH_CLIENT_ID,
          redirect_uri: process.env.OAUTH_REDIRECT_URL,
          client_secret: process.env.OAUTH_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          code_verifier,
        },
      });

      const userRes = await await axios.request({
        url: 'https://api.account.isdream.cn/oidc/me',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: {
          access_token: res.data.access_token,
        },
      });

      if (userRes.data.sub === process.env.OAUTH_ADMIN_SUB) {
        return {
          data: {
            user: {
              username: userRes.data.name,
            },
            token: this.jwtService.signSync({
              username: userRes.data.name,
              isAdmin: true,
            }),
          },
        };
      } else {
        throw new MidwayHttpError('[oauth] 权限不足', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error('[oauth] 登录失败');
      this.logger.error(error);
      throw new MidwayHttpError('登录失败', HttpStatus.UNAUTHORIZED);
    }
  }
}
