import {Entity, model, property} from '@loopback/repository';
import {Comment} from './comment.models';
import {Description} from './description.model';

@model({settings: {}})
export class Post extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property.array(Description, {
    required: true,
  })
  description: Array<Description>;

  @property({
    type: 'boolean',
    required: true,
  })
  isPrivate: boolean;

  @property.array(Comment)
  comments: Array<Comment>;

  @property.array(String, {
    default: [],
  })
  contributor: Array<string>;

  @property({
    type: 'boolean',
  })
  isDeleted: boolean;

  @property({
    type: 'string',
  })
  groupName: string;

  constructor(data?: Partial<Post>) {
    super(data);
  }
}
