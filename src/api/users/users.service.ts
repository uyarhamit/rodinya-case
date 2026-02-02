import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { User } from './schema/user.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly userEntity: UserEntity) {}

  /**
   * Creates a new user based on the provided data transfer object (DTO).
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing user creation details.
   * @return {Promise<UserResponseDto>} A promise that resolves to a response DTO containing the new user's information.
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userEntity.create(createUserDto);
    return plainToInstance(UserResponseDto, {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param {string} email - The email address of the user to find.
   * @return {Promise<User | null>} A promise that resolves to the user object if found, or null if no user exists with the provided email.
   */
  async login(email: string): Promise<User | null> {
    return await this.userEntity.login(email);
  }

  /**
   * Retrieves user data by email address and returns it as a UserResponseDto.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<UserResponseDto>} A promise that resolves to a UserResponseDto containing the user's details.
   * @throws {NotFoundException} Throws an exception if the user is not found.
   */
  async getMe(email: string): Promise<UserResponseDto> {
    const user = await this.userEntity.findByEmail(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return plainToInstance(UserResponseDto, {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<User | null>} A promise that resolves to the user object if found, or null if no user exists with the specified email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userEntity.findByEmail(email);
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param {string} id - The unique identifier of the user to retrieve.
   * @return {Promise<User | null>} A promise that resolves to the user object if found, or null if no user exists with the given id.
   */
  async findById(id: string): Promise<User | null> {
    return await this.userEntity.findById(id);
  }
}
