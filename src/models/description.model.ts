import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class Description extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'boolean',
  })
  isActive: boolean;

  @property({
    type: 'boolean',
  })
  isDeleted: boolean;

  constructor(data?: Partial<Description>) {
    super(data);
  }
}
