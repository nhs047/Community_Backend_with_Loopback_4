import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class Setting extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'boolean',
  })
  isDeleted: boolean;

  constructor(data?: Partial<Setting>) {
    super(data);
  }
}
