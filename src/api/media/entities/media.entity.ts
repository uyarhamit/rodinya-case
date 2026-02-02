import { InjectModel } from '@nestjs/mongoose';
import { Media } from '../schema/media.schema';
import { Model } from 'mongoose';
import { CreateMediaDto } from '../dto/create-media.dto';

export class MediaEntity {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
  ) {}

  /**
   * Retrieves a media document by its unique identifier.
   *
   * @param {string} id - The unique identifier of the media document to retrieve.
   * @return {Promise<Media | null>} A promise that resolves to the media document if found, or null if no document matches the provided identifier.
   */
  async findById(id: string): Promise<Media | null> {
    return this.mediaModel.findOne({ _id: id }).lean().exec();
  }

  /**
   * Retrieves a list of media files owned by the specified user.
   *
   * @param {string} ownerId - The unique identifier of the owner whose media files are to be retrieved.
   * @return {Promise<Media[]>} A promise that resolves to an array of media objects owned by the specified user.
   */
  async myFiles(ownerId: string): Promise<Media[]> {
    return this.mediaModel
      .find({
        $or: [{ ownerId: ownerId }, { allowedUserIds: ownerId }],
      })
      .lean()
      .exec();
  }

  /**
   * Retrieves a file along with its associated permissions, including the owner and allowed user details.
   *
   * @param {string} id - The unique identifier of the file to be retrieved.
   * @return {Promise<Object>} A promise that resolves to the file document with populated owner and allowed user information.
   */
  async filesWithPermissions(id: string) {
    const file = await this.mediaModel
      .findOne({
        _id: id,
      })
      .populate('ownerId', 'email role')
      .populate('allowedUserIds', 'email role')
      .lean()
      .exec();

    return {
      ...file,
      owner: { ...file.ownerId, _id: file.ownerId._id.toString() },
      allowedUserIds: file.allowedUserIds.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
    };
  }

  /**
   * Updates the permissions for a media item by setting the list of allowed users.
   *
   * @param {string} id - The unique identifier of the media item.
   * @param {string[]} allowedUsers - An array of user IDs that are granted access to the media item.
   * @return {Promise<Media>} A promise that resolves with the updated media object.
   */
  async setPermissions(id: string, allowedUsers: string[]): Promise<Media> {
    return this.mediaModel.findOneAndUpdate(
      { _id: id },
      { allowedUserIds: allowedUsers },
    );
  }

  /**
   * Creates a new media entry in the database.
   *
   * @param {string} ownerId - The identifier of the owner creating the media.
   * @param {CreateMediaDto} createMediaDto - The data transfer object containing the details of the media to create.
   * @return {Promise<Media>} A promise that resolves to the created media object.
   */
  async create(
    ownerId: string,
    createMediaDto: CreateMediaDto,
  ): Promise<Media> {
    return this.mediaModel.create({
      ownerId: ownerId,
      ...createMediaDto,
    });
  }

  /**
   * Deletes a media record by its unique identifier.
   *
   * @param {string} id - The unique identifier of the media record to delete.
   * @return {Promise<boolean>} A promise that resolves to `true` if the deletion was successful, `false` otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const deletedFile = await this.mediaModel
      .deleteOne({ _id: id })
      .lean()
      .exec();

    return deletedFile.deletedCount > 0;
  }
}
