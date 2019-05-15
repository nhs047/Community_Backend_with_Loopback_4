import {CountSchema, repository, Where} from '@loopback/repository';
import {
  post,
  param,
  get,
  getWhereSchemaFor,
  put,
  requestBody,
  del,
  stringTypeToWrapper,
} from '@loopback/rest';
import {Guid} from 'guid-typescript';
import {Post} from '../models/post.models';
import {ObjectID} from 'mongodb';
import {User, UserPostAccessibility} from '../models';
import {ResponseModel} from '../models/response.models';
import {UserRepository, UserPostAccessibilityRepository} from '../repositories';
import {HelperMethod} from '../models/helper.models';
import {Description} from '../models/description.model';

export class PostController {
  responseModel: ResponseModel = new ResponseModel();
  helperMethod: HelperMethod = new HelperMethod();
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserPostAccessibilityRepository)
    public userPostAccessability: UserPostAccessibilityRepository,
  ) {}

  @post('/posts/{userId}', {
    responses: {
      '200': {
        description: 'Post model instance',
        content: {'application/json': {schema: {'x-ts-type': Post}}},
      },
    },
  })
  // tslint:disable-next-line:no-shadowed-variable
  async create(
    @param.path.string('userId') userId: string,
    // tslint:disable-next-line:no-shadowed-variable
    @requestBody() post: Post,
  ): Promise<ResponseModel> {
    const obj = this.helperMethod.objValidation(
      ['title', 'isPrivate', 'contributor', 'groupName'],
      post,
    );

    obj.description = [
      {
        id: `${Guid.create()}`,
        description: post.description[0],
        isActive: true,
        isDeleted: false,
      },
    ];
    obj.contributor = obj.contributor
      ? obj.contributor.includes(userId)
        ? obj.contributor
        : obj.contributor.concat([userId])
      : [userId];
    if (obj.groupName) {
      obj.isPrivate = false;
    } else {
      obj.groupName = 'none';
    }
    obj.id = `${Guid.create()}`;
    obj.isDeleted = false;
    const mapperObj: any = {
      postId: obj.id,
      userId: userId,
      groupName: obj.groupName,
      isDeleted: obj.isDeleted,
    };
    await this.userPostAccessability.create(mapperObj);
    return await this.userRepository.pushData(
      {
        $push: {
          post: obj,
        },
      },
      {_id: new ObjectID(userId)},
      'post',
    );
  }

  @get('/posts/{userId}/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.path.string('userId') userId: string,
    @param.query.object('where', getWhereSchemaFor(Post)) where?: Where,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-shadowed-variable
    const param = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.isDeleted': false}},
      {$group: {_id: 0, count: {$sum: 1}}},
      {$project: {_id: 0, count: '$count'}},
    ];
    let retObj = await this.userRepository.customCount(param, false);
    retObj.data = retObj.data ? retObj.data : {count: 0};
    return retObj;
  }

  @get('/posts/{userId}', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': User}},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('userId') userId: string,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const paramObj: any = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.isDeleted': false}},
      {
        $project: {
          _id: 0,
          id: '$post.id',
          title: '$post.title',
          description: '$post.description',
          isDeleted: '$post.isDeleted',
          isPrivate: '$post.isPrivate',
        },
      },
      {
        $unwind: '$description',
      },
      {
        $match: {'description.isDeleted': false},
      },
      {
        $group: {
          _id: '$id',
          id: {$first: '$id'},
          title: {$first: '$title'},
          description: {$push: '$description'},
          isDeleted: {$first: '$isDeleted'},
          isPrivate: {$first: '$isDeleted'},
          count: {$sum: 1},
        },
      },
      {
        $project: {
          _id: 0,
          id: '$id',
          title: '$title',
          description: '$description',
          isDeleted: '$isDeleted',
          isPrivate: '$isPrivate',
          descriptionCount: '$count',
        },
      },
      {$unwind: '$description'},
      {$match: {'description.isActive': true}},
    ];
    return await this.userRepository.customCount(paramObj, true);
    // return await this.userRepository.find(filter);
  }

  @get('/posts/{userId}/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': Post}}},
      },
    },
  })
  async findById(
    @param.path.string('userId') userId: string,
    @param.path.string('id') id: string,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const paramObj: any = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.id': id, 'post.isDeleted': false}},
      {$project: {post: '$post'}},
      {$unwind: '$post.description'},
      {
        $match: {'post.description.isDeleted': false},
      },

      {
        $group: {
          _id: '$post.id',
          id: {$first: '$post.id'},
          title: {$first: '$post.title'},
          description: {$push: '$post.description'},
          isDeleted: {$first: '$post.isDeleted'},
          isPrivate: {$first: '$post.isDeleted'},
          count: {$sum: 1},
        },
      },
      {
        $project: {
          _id: 0,
          id: '$id',
          title: '$title',
          description: '$description',
          isDeleted: '$isDeleted',
          isPrivate: '$isPrivate',
          descriptionCount: '$count',
        },
      },
      {$unwind: '$description'},
      {$match: {'description.isActive': true}},
    ];
    const retObj = await this.userRepository.customCount(paramObj, false);
    retObj.data = retObj.data ? retObj.data : {};
    return retObj;
  }

  @put('/posts/{userId}/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('userId') userId: string,
    @param.path.string('id') id: string,
    // tslint:disable-next-line:no-any
    @requestBody() postData: any,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const obj = this.helperMethod.objValidation(
      ['title', 'isDeleted', 'isPrivate', 'contributor'],
      postData,
    );
    //groupName
    // isDeleted
    if (obj.isDeleted) {
      await this.userPostAccessability.setMapperData(
        {postId: id, userId: userId},
        {isDeleted: obj.isDeleted},
      );
    }
    // if(obj.contributor){
    //   obj.contributor = obj.contributor.includes(userId) ? obj.contributor : obj.contributor.concat([userId]);
    // }
    const paramObj = this.helperMethod.oneLayerArrayFilter(obj, 'post.$[p].');
    // tslint:disable-next-line:no-any
    const filterObj: any = {};
    filterObj['p.id'] = id;
    return await this.userRepository.setData(
      {_id: new ObjectID(userId)},
      paramObj,
      [filterObj],
      obj,
    );
  }

  @put('/posts/descripton/{userId}/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceDescriptionById(
    @param.path.string('userId') userId: string,
    @param.path.string('id') id: string,
    @requestBody() postData: Description,
  ): Promise<ResponseModel> {
    await this.userRepository.setData(
      {
        _id: new ObjectID(userId),
      },
      {
        'post.$[p].description.$[].isActive': false,
      },
      [{'p.id': id}],
      {},
    );
    return this.userRepository.pushSecondLayerArray(
      // tslint:disable-next-line:no-any
      {
        $push: {
          'post.$[p].description': {
            id: `${Guid.create()}`,
            description: postData.description,
            isActive: true,
            isDeleted: false,
          },
        },
      },

      {_id: new ObjectID(userId)},
      {arrayFilters: [{'p.id': id}]},
      'post.$[p].description',
    );
  }

  @get('/posts/descripton/{userId}/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async getDescriptionById(
    @param.path.string('userId') userId: string,
    @param.path.string('id') id: string,
  ): Promise<ResponseModel> {
    // tslint:disable-next-line:no-any
    const paramObj: any = [
      {
        $match: {_id: new ObjectID(userId)},
      },
      {$unwind: '$post'},
      {$match: {'post.id': id, 'post.isDeleted': false}},
      {$project: {post: '$post'}},
      {$unwind: '$post.description'},
      {
        $match: {'post.description.isDeleted': false},
      },
      {
        $group: {
          _id: '$post.id',
          id: {$first: '$post.id'},
          title: {$first: '$post.title'},
          description: {$push: '$post.description'},
          isDeleted: {$first: '$post.isDeleted'},
          isPrivate: {$first: '$post.isDeleted'},
        },
      },
      {
        $project: {
          _id: 0,
          id: '$id',
          title: '$title',
          description: '$description',
          isDeleted: '$isDeleted',
          isPrivate: '$isPrivate',
        },
      },
    ];
    const retObj = await this.userRepository.customCount(paramObj, false);
    retObj.data = retObj.data ? retObj.data : {};
    return retObj;
  }

  @del('/posts/descripton/{userId}/{postId}/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async deleteDescriptionById(
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
      {$match: {'post.id': postId, 'post.isDeleted': false}},
      {$project: {post: '$post'}},
      {$unwind: '$post.description'},
      {
        $match: {'post.description.isDeleted': false},
      },
      {
        $group: {
          _id: '$post.id',
          id: {$first: '$post.id'},
          title: {$first: '$post.title'},
          description: {$push: '$post.description'},
          isDeleted: {$first: '$post.isDeleted'},
          isPrivate: {$first: '$post.isDeleted'},
        },
      },
      {
        $project: {
          _id: 0,
          id: '$id',
          title: '$title',
          description: '$description',
          isDeleted: '$isDeleted',
          isPrivate: '$isPrivate',
        },
      },
    ];
    const retObj = await this.userRepository.customCount(paramObj, false);
    retObj.data = retObj.data ? retObj.data : {};
    return retObj;
  }
}
