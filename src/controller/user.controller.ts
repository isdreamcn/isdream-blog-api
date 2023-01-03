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
import { Validate } from '@midwayjs/validate';
import { UserDTO, UserLoginDTO } from '../dto/user';
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

  @Post()
  @Validate()
  async createUser(@Body() user: UserDTO) {
    await this.userService.createUser(user);
  }

  @Del('/:id')
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @Put('/:id')
  @Validate()
  async updateUser(@Param('id') id: number, @Body() user: UserDTO) {
    await this.userService.updateUser(id, user);
  }

  @Get('/:id')
  async findUser(@Param('id') id: number) {
    const data = await this.userService.findUser(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findUserList(@Query() query: CommonFindListDTO) {
    return await this.userService.findUserList(query);
  }

  @Role(['pc'])
  @Post('/login')
  @Validate()
  async loginUser(@Body() user: UserLoginDTO) {
    const data = await this.userService.loginUser(user);

    return {
      data,
      token: this.jwtService.signSync({
        ...data,
      }),
    };
  }
}
