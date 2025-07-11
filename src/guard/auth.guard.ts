import { Guard, IGuard, getPropertyMetadata } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ROLE_META_KEY } from '../decorator/role.decorator';
import { httpError } from '@midwayjs/core';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, supplierClz, methodName: string) {
    // 从类元数据上获取角色信息
    const roleNameList = getPropertyMetadata<string[]>(
      ROLE_META_KEY,
      supplierClz,
      methodName
    ) || ['admin'];

    // jwt.middleware 解析 token
    const user = context.user || {};
    // 需要登录的接口，如评论
    if (roleNameList.includes('login') && !user.id) {
      throw new httpError.UnauthorizedError();
    }

    // 后台接口，如删除、编辑
    if (roleNameList.includes('admin') && !user.isAdmin) {
      throw new httpError.UnauthorizedError();
    }

    return true;
  }
}
