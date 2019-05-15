import {Count, CountSchema, Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  put,
  requestBody,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {HelperMethod} from '../models/helper.models';
import {ResponseModel} from '../models/response.models';
import {ObjectID} from 'mongodb';

export class UserController {
  helperMethod: HelperMethod = new HelperMethod();
  responseModel: ResponseModel = new ResponseModel();

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async create(@requestBody() user: User): Promise<ResponseModel> {
    user.thumb = '../../assets/image/transparent-man-professional-4.png';
    user.isDeleted = false;
    user.group = user.group ? user.group : [];
    const retObj = await this.userRepository.create(user);
    this.responseModel = {
      data: retObj,
      isExecuted: true,
      message: 'Save record successfully',
    };
    return this.responseModel;
  }

  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(): // @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
  Promise<ResponseModel> {
    const retObj = await this.userRepository.count({isDeleted: false});
    this.responseModel = {
      data: retObj,
      isExecuted: true,
      message: '',
    };
    return this.responseModel;
  }

  @get('/users', {
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
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter,
  ): Promise<ResponseModel> {
    let customFilter: any;
    customFilter = {
      where: {isDeleted: false},
      fields: {
        id: true,
        mail: true,
        username: true,
        thumb: true,
        fullName: true,
        designation: true,
        country: true,
        group: true,
        state: true,
        isDeleted: true,
      },
    };
    const retObj = await this.userRepository.find(
      filter ? filter : customFilter,
    );
    this.responseModel = retObj
      ? {
          data: retObj,
          isExecuted: true,
          message: '',
        }
      : {
          data: {},
          isExecuted: false,
          message: 'No Record Found',
        };
    return this.responseModel;
  }

  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    // @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter,
  ): Promise<ResponseModel> {
    let customFilter: any = {
      where: {id: id, isDeleted: false},
      fields: {
        id: true,
        mail: true,
        username: true,
        thumb: true,
        fullName: true,
        group: true,
        designation: true,
        country: true,
        state: true,
        isDeleted: true,
      },
    };
    const retObj = await this.userRepository.findOne(customFilter);
    this.responseModel = retObj
      ? {
          data: retObj,
          isExecuted: true,
          message: '',
        }
      : {
          data: {},
          isExecuted: false,
          message: 'No record found',
        };
    return this.responseModel;
  }

  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    // tslint:disable-next-line:no-any
    @requestBody() user: any,
  ): Promise<ResponseModel> {
    let returnObj: ResponseModel = new ResponseModel();
    returnObj = {
      data: {},
      isExecuted: false,
      message: '',
    };
    const obj = this.helperMethod.objValidation(
      [
        'username',
        'mail',
        'fullName',
        'designation',
        'country',
        'state',
        'group',
        'isDeleted',
      ],
      user,
    );
    const pushData = user.followings;
    if (!obj && !pushData) {
      this.responseModel = {
        data: {},
        isExecuted: false,
        message: 'No update found',
      };
      return this.responseModel;
    }
    if (pushData) {
      returnObj = await this.userRepository.pushData(
        {$push: {followings: pushData}},
        {_id: new ObjectID(id)},
        'followings',
      );
      returnObj = await this.userRepository.pushData(
        {$push: {followers: id}},
        {_id: new ObjectID(pushData)},
        'followers',
      );
    }
    const responseObj = await this.userRepository.setData(
      {_id: new ObjectID(id)},
      obj,
      undefined,
      obj,
    );

    if (
      responseObj.data &&
      returnObj.data &&
      Object.keys(returnObj.data).length > 0 &&
      Object.keys(responseObj.data).length > 0
    ) {
      responseObj.data = {...responseObj.data, ...returnObj.data};
      return responseObj;
    }
    // this.responseModel = {
    //   data: {},
    //   isExecuted: true,
    //   message: 'Record updated successfully',
    // };
    return responseObj && Object.keys(responseObj.data).length > 0
      ? responseObj
      : returnObj;
  }
}
