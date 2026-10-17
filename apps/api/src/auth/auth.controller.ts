import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@martronics/kit';
import { CurrentUser, Public, Roles, type Principal } from '../common/auth.js';
import {
  idParamsSchema,
  listUsersQuerySchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  setRoleSchema,
  updateMeSchema,
  type ListUsersQuery,
  type Login,
  type RefreshRequest,
  type Register,
  type SetRole,
  type UpdateMe,
} from './auth.contract.js';
import { AuthService } from './auth.service.js';

@Controller('api/v1')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Public()
  @Post('auth/register')
  register(@Body(new ZodValidationPipe(registerSchema)) body: Register) {
    return this.auth.register(body);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) body: Login) {
    return this.auth.login(body);
  }

  @Public()
  @Post('auth/refresh')
  @HttpCode(200)
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshRequest) {
    return this.auth.refresh(body.refreshToken);
  }

  @Public()
  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshRequest) {
    await this.auth.logout(body.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: Principal) {
    return this.auth.me(user);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: Principal,
    @Body(new ZodValidationPipe(updateMeSchema)) body: UpdateMe,
  ) {
    return this.auth.updateMe(user, body);
  }

  @Roles('admin')
  @Get('users')
  list(@Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQuery) {
    return this.auth.list(query);
  }

  @Roles('admin')
  @Patch('users/:id/role')
  setRole(
    @CurrentUser() actor: Principal,
    @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    @Body(new ZodValidationPipe(setRoleSchema)) body: SetRole,
  ) {
    return this.auth.setRole(actor, params.id, body);
  }
}
