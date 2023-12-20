import { Injectable } from '@nestjs/common';
import { logInfo } from 'src/lib/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserById(userId: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findOneBy({ userId });
      if (user) {
        logInfo(`found user: ${JSON.stringify(user)}`);
        return user;
      } else {
        logInfo(`userId: ${userId} not found`);
        return null;
      }
    } catch (error) {
      throw new Error(`find one by userId error: ${error.message}`);
    }
  }
}
