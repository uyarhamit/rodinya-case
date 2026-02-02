import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';

export class UserEntity {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Finds a user by their unique identifier.
   *
   * @param {string} id - The unique identifier of the user to be retrieved.
   * @return {Promise<User | null>} A promise that resolves to the user object if found, or null if no user is found.
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Authenticates a user based on the provided email.
   *
   * @param {string} email - The email address of the user attempting to log in.
   * @return {Promise<User | null>} A promise that resolves to the user object if authentication is successful, or null if the user is not found.
   */
  async login(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email })
      .select(['email', 'passwordHash', 'role'])
      .lean()
      .exec();
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<User | null>} A promise that resolves to the user object if found, or null if no user is found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  /**
   * Creates a new user based on the provided data transfer object.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing the details for the new user.
   * @return {Promise<User>} A promise that resolves to the newly created user.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  /**
   * Updates an existing user in the database with the provided data.
   *
   * @param {string} id - The unique identifier of the user to be updated.
   * @param {CreateUserDto} updateUserDto - The data transfer object containing the updated user information.
   * @return {Promise<User>} A promise that resolves to the updated user.
   */
  async update(id: string, updateUserDto: CreateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto);
  }
}
