import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { DBService } from 'src/db/db.service';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  constructor(private db: DBService) {}

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: any = {};
    if (updateUserDto.address) data.address = updateUserDto.address;
    if (updateUserDto.firstname) data.firstname = updateUserDto.firstname;
    if (updateUserDto.lastname) data.lastname = updateUserDto.lastname;
    if (updateUserDto.password)
      data.password = await argon.hash(updateUserDto.password);
    const user = await this.db.user.update({
      where: { id },
      data: data,
    });
    delete user.password;
    return user;
  }
}
