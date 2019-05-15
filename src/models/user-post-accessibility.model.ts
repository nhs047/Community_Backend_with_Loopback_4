import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class UserPostAccessibility extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  postId: string;

  @property({
    type: 'string',
    required: true,
  })
  groupName: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isDeleted: boolean;

  @property({
    type: 'Date',
    required: true,
    default: new Date(),
  })
  currentDate: Date;
  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<UserPostAccessibility>) {
    super(data);
  }
}
