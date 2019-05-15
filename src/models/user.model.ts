import {Entity, model, property} from '@loopback/repository';
import {TitleLink} from './title-link.models';
import {Post} from './post.models';
import {Setting} from './setting.models';
import {Notification} from './notification.models';

@model({settings: {}})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  mail: string;

  @property.array(Post)
  post: Array<Post>;

  @property({
    type: 'string',
  })
  thumb: string;

  @property({
    type: 'string',
    required: true,
  })
  fullName: string;

  @property({
    type: 'string',
    required: true,
  })
  designation: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  @property({
    type: 'string',
  })
  state: string;

  @property({
    type: 'boolean',
  })
  isDeleted: boolean;

  @property.array(TitleLink)
  organization: Array<TitleLink>;

  @property.array(String)
  group: Array<string>;

  @property.array('string')
  followers: Array<string>; //

  @property.array('string')
  followings: Array<string>; //

  @property.array(Notification)
  notifications: Array<Notification>;

  @property.array(Setting)
  setting: Array<Setting>;

  constructor(data?: Partial<User>) {
    super(data);
  }
}
