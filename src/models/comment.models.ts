import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class Comment extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  comment: string;

  @property({
    type: 'boolean',
  })
  isDeleted: boolean;

  constructor(data?: Partial<Comment>) {
    super(data);
  }
}
