import { Controller, UseGuards, Get, Delete, Patch, Post, Param, Query, Body } from '@nestjs/common';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/prisma/generated/enums';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search?: string) {
    return this.usersService.getUsers(Number(page), Number(limit), search);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id/sessions')
  async forceLogout(@Param('id') id: string) {
    await this.usersService.forceLogout(id);
    return { message: 'User sessions cleared successfully' };
  }

  @Post(':id/recovery-link')
  async sendRecoveryLink(@Param('id') id: string) {
    await this.usersService.sendRecoveryLink(id);
    return { message: 'Recovery link sent successfully' };
  }
}
