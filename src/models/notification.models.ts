import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class Notification extends Entity {
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

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  navigationalLink: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isDeleted: boolean;

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}
