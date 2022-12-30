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
import { UserService, IUserData } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';

@Controller('/user')
export class UserController {
  @Inject()
  jwtService: JwtService;

  @Inject()
  userService: UserService;

  @Post()
  async createUser(@Body() user: IUserData) {
    await this.userService.createUser(user);
  }

  @Del('/:id')
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @Put('/:id')
  async updateUser(@Param('id') id: number, @Body() user: IUserData) {
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
  async findUserList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = ''
  ) {
    return await this.userService.findUserList(page, pageSize, q);
  }

  @Post('/login')
  async loginUser(@Body() user: IUserData) {
    const data = await this.userService.loginUser(user);

    return {
      data,
      token: this.jwtService.signSync({
        ...data,
      }),
    };
  }
}
