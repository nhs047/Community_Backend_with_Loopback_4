import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {param, get} from '@loopback/rest';
import {UserPostAccessibility} from '../models';
import {UserPostAccessibilityRepository, UserRepository} from '../repositories';
import {ResponseModel} from '../models/response.models';
import {ObjectID} from 'mongodb';

export class UserPostAccessablityController {
  responseModel: ResponseModel = new ResponseModel();
  constructor(
    @repository(UserPostAccessibilityRepository)
    public userPostAccessibilityRepository: UserPostAccessibilityRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/user-post-accessibilities/{id}', {
    responses: {
      '200': {
        description: 'UserPostAccessibility model instance',
        content: {
          'application/json': {schema: {'x-ts-type': UserPostAccessibility}},
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<ResponseModel> {
    let followingsResponse = await this.userRepository.customCount(
      [
        {$match: {_id: new ObjectID(id)}},
        {$project: {followings: '$followings', group: '$group'}},
      ],
      false,
    );
    if (!followingsResponse.data) {
      followingsResponse.data.followings = [];
      followingsResponse.data.group = [];
    }
    const group = followingsResponse.data.group;
    const arr: Array<string> = followingsResponse.data.followings
      ? [...followingsResponse.data.followings, id]
      : [id];
    const retObj = await this.userPostAccessibilityRepository.getData(
      arr,
      group,
      id,
    );
    // const otherObj = await
    return {
      data: retObj,
      isExecuted: true,
      message: '',
    };
  }

  @get('/user-post-accessibilities/group/{groupName}', {
    responses: {
      '200': {
        description: 'UserPostAccessibility model instance',
        content: {
          'application/json': {schema: {'x-ts-type': UserPostAccessibility}},
        },
      },
    },
  })
  async findByGroup(
    @param.path.string('groupName') groupName: string,
  ): Promise<ResponseModel> {
    const retObj = await this.userPostAccessibilityRepository.getGroupData(
      groupName,
    );
    // const otherObj = await
    return {
      data: retObj,
      isExecuted: true,
      message: '',
    };
  }

  // @patch('/user-post-accessibilities/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'UserPostAccessibility PATCH success',
  //     },
  //   },
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody() userPostAccessibility: UserPostAccessibility,
  // ): Promise<void> {
  //   await this.userPostAccessibilityRepository.updateById(id, userPostAccessibility);
  // }

  // @put('/user-post-accessibilities/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'UserPostAccessibility PUT success',
  //     },
  //   },
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() userPostAccessibility: UserPostAccessibility,
  // ): Promise<void> {
  //   await this.userPostAccessibilityRepository.replaceById(id, userPostAccessibility);
  // }

  // @del('/user-post-accessibilities/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'UserPostAccessibility DELETE success',
  //     },
  //   },
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.userPostAccessibilityRepository.deleteById(id);
  // }
}
