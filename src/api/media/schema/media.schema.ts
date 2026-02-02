import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class Media extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({
    required: true,
  })
  fileName: string;

  @Prop({
    required: true,
  })
  filePath: string;

  @Prop({
    required: true,
    enum: ['image/jpeg'],
  })
  mimeType: string;

  @Prop({
    required: true,
    min: 1,
  })
  size: number;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  })
  allowedUserIds: Types.ObjectId[];

  createdAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
