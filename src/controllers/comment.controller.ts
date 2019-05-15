import {CountSchema, repository, Where} from '@loopback/repository';
import {
  post,
  param,
  get,
  getWhereSchemaFor,
  put,
  requestBody,
} from '@loopback/rest';
import {Guid} from 'guid-typescript';
import {ObjectID} from 'mongodb';
import {ResponseModel} from '../models/response.models';
import {UserRepository} from '../repositories';
import {HelperMethod} from '../models/helper.models';
import {Comment} from '../models/comment.models';

export class CommentController {
  responseModel: ResponseModel = new ResponseModel();
  helperMethod: HelperMethod = new HelperMethod();
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/comments/{userId}/{postId}', {
    responses: {
      '200': {
        description: 'Post model instance',
        content: {'application/json': {schema: {'x-ts-type': Comment}}},
      },
    },
  })
  // tslint:disable-next-line:no-shadowed-variable
  async create(
    @param.path.string('userId') userId: string,
    @param.path.string('postId') postId: string,
    // tslint:disable-next-line:no-shadowed-variable
    @requestBody() comment: Comment,
  ): Promise<ResponseModel> {
    comment.id = `${Guid.create()}`;
    comment.isDeleted = false;
    return await this.userRepository.pushSecondLayerArray(
      {
        $push: {
          'post.$[p].comment': comment,
        },
      },
      {_id: new ObjectID(userId)},
      {
        arrayFilters: [
          {
            'p.id': postId,
          },
        ],
      },
      'post.$[p].comment',
    );
  }

  @get('/comments/{userId}/{postId}/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.path.string('userId') userId: string,
    @param.path.string('postId') postId: string,
    @param.query.object('where', getWhereSchemaFor(Comment)) where?: Where,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-shadowed-variable
    const param = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.id': postId}},
      {$unwind: '$post.comment'},

      {$group: {_id: 0, count: {$sum: 1}}},
      {$project: {_id: 0, count: '$count'}},
    ];
    let retObj: ResponseModel = await this.userRepository.customCount(
      param,
      false,
    );
    retObj.data = retObj.data ? retObj.data : {count: 0};
    return retObj;
  }

  @get('/comments/{userId}/{postId}', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Comment}},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('userId') userId: string,
    @param.path.string('postId') postId: string,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const paramObj: any = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.id': postId}},
      {$unwind: '$post.comment'},
      {
        $project: {
          _id: 0,
          id: '$post.comment.id',
          comment: '$post.comment.comment',
          isDeleted: '$post.comment.isDeleted',
        },
      },
    ];
    return await this.userRepository.customCount(paramObj, true);
    // return await this.userRepository.find(filter);
  }

  @get('/comments/{userId}/{postId}/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': Comment}}},
      },
    },
  })
  async findById(
    @param.path.string('userId') userId: string,
    @param.path.string('postId') postId: string,
    @param.path.string('id') id: string,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const paramObj: any = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.id': postId}},
      {$unwind: '$post.comment'},
      {$match: {'post.comment.id': id}},
      {
        $project: {
          _id: 0,
          id: '$post.comment.id',
          comment: '$post.comment.comment',
          isDeleted: '$post.comment.isDeleted',
        },
      },
    ];
    return await this.userRepository.customCount(paramObj, false);
    // return await this.userRepository.findById(id);
  }

  @put('/comments/{userId}/{postId}/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('userId') userId: string,
    @param.path.string('postId') postId: string,
    @param.path.string('id') id: string,
    // tslint:disable-next-line:no-any
    @requestBody() comment: any,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const obj = this.helperMethod.objValidation(
      ['comment', 'isDeleted'],
      comment,
    );
    const paramObj = this.helperMethod.oneLayerArrayFilter(
      obj,
      'post.$[p].comment.$[q].',
    );

    // tslint:disable-next-line:no-any
    const filterObj: any = [];
    filterObj.push({'p.id': postId});
    filterObj.push({'q.id': id});

    return this.userRepository.setData(
      {_id: new ObjectID(userId)},
      paramObj,
      filterObj,
      obj,
    );
  }
}
