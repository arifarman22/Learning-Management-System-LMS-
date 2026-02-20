import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../dto/user.dto';

const userRepo = new UserRepository();

export class UserService {
  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      userRepo.findAll(skip, limit, search),
      userRepo.count(search),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing && !existing.deletedAt) {
      throw new Error('Email already exists');
    }

    const passwordHash = await hashPassword(data.password);

    return userRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'STUDENT',
    });
  }

  async updateUser(id: string, data: UpdateUserDto) {
    await this.getUserById(id);
    return userRepo.update(id, data);
  }

  async changePassword(id: string, data: ChangePasswordDto) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const fullUser = await userRepo.findByEmail(user.email);
    if (!fullUser) {
      throw new Error('User not found');
    }

    const isValid = await comparePassword(data.currentPassword, fullUser.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(data.newPassword);
    await userRepo.updatePassword(id, newPasswordHash);

    return { message: 'Password changed successfully' };
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    await userRepo.softDelete(id);
    return { message: 'User deleted successfully' };
  }

  async activateUser(id: string) {
    await this.getUserById(id);
    return userRepo.activate(id);
  }

  async deactivateUser(id: string) {
    await this.getUserById(id);
    return userRepo.deactivate(id);
  }
}
