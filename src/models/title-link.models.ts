import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class TitleLink extends Entity {
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
  })
  link: string;

  constructor(data?: Partial<TitleLink>) {
    super(data);
  }
}
