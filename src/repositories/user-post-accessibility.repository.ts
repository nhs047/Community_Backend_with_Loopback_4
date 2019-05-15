import {DefaultCrudRepository} from '@loopback/repository';
import {UserPostAccessibility} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {ResponseModel} from '../models/response.models';

export class UserPostAccessibilityRepository extends DefaultCrudRepository<
  UserPostAccessibility,
  typeof UserPostAccessibility.prototype.id
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(UserPostAccessibility, dataSource);
  }

  async getData(idArray: Array<string>, group: Array<string>, id: string) {
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _accessabilityCollection = (this.dataSource // tslint:disable-next-line:no-any
      .connector as any).collection('UserPostAccessibility');
    return await _accessabilityCollection
      .aggregate([
        {
          $match: {userId: {$in: idArray}, isDeleted: false},
        },
        {
          $lookup: {
            from: 'User',
            let: {
              userId: {$convert: {input: '$userId', to: 'objectId'}},
              postId: '$postId',
            },
            pipeline: [
              {$match: {$expr: {$and: [{$eq: ['$_id', '$$userId']}]}}},
              {$unwind: '$post'},
              {$match: {$expr: {$and: [{$eq: ['$post.id', '$$postId']}]}}},
              {
                $project: {
                  _id: 1,
                  post: 1,
                  username: 1,
                  fullName: 1,
                  thumb: 1,
                },
              },
            ],
            as: 'users',
          },
        },
        {
          $project: {
            user: {$arrayElemAt: ['$users', 0]},
            currentDate: '$currentDate',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$user._id',
            username: '$user.username',
            fullName: '$user.fullName',
            thumb: '$user.thumb',
            isContributor: {
              $cond: [{$in: [id, '$user.post.contributor']}, true, false],
            },
            isGroupMember: {
              $cond: [{$in: ['$user.post.groupName', group]}, true, false],
            },
            post: {
              id: '$user.post.id',
              title: '$user.post.title',
              isPrivate: '$user.post.isPrivate',
              description: '$user.post.description',
              groupName: '$user.post.groupName',
              currentDate: '$currentDate',
              isDeleted: '$user.post.isDeleted',
            },
          },
        },
        {
          $match: {
            $and: [
              {$or: [{isContributor: true}, {'post.isPrivate': false}]},
              {$or: [{isGroupMember: true}, {'post.groupName': 'none'}]},
            ],
            'post.isDeleted': false,
          },
        },
        {
          $unwind: '$post.description',
        },
        {
          $match: {'post.description.isDeleted': false},
        },
        {
          $group: {
            _id: '$post.id',
            id: {$first: '$id'},
            username: {$first: '$username'},
            fullName: {$first: '$fullName'},
            thumb: {$first: '$thumb'},
            isContributor: {$first: '$isContributor'},
            groupName: {$first: '$post.groupName'},
            currentDate: {$first: '$post.currentDate'},
            title: {$first: '$post.title'},
            description: {$push: '$post.description'},
            isDeleted: {$first: '$post.isDeleted'},
            isPrivate: {$first: '$post.isPrivate'},
            count: {$sum: 1},
          },
        },
        {
          $project: {
            id: '$id',
            username: '$username',
            fullName: '$fullName',
            thumb: '$thumb',
            isContributor: '$isContributor',
            post: {
              id: '$_id',
              groupName: '$groupName',
              currentDate: '$currentDate',
              title: '$title',
              description: '$description',
              isDeleted: '$isDeleted',
              isPrivate: '$isDeleted',
              descriptionCount: '$count',
            },
            _id: 0,
          },
        },
        {$unwind: '$post.description'},
        {$match: {'post.description.isActive': true}},
      ])
      .get();
  }



  async getGroupData(groupName: string) {
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _accessabilityCollection = (this.dataSource // tslint:disable-next-line:no-any
      .connector as any).collection('UserPostAccessibility');
    return await _accessabilityCollection
      .aggregate([
        {
          $match: {groupName: groupName, isDeleted: false},
        },
        {
          $lookup: {
            from: 'User',
            let: {
              userId: {$convert: {input: '$userId', to: 'objectId'}},
              postId: '$postId',
            },
            pipeline: [
              {$match: {$expr: {$and: [{$eq: ['$_id', '$$userId']}]}}},
              {$unwind: '$post'},
              {$match: {$expr: {$and: [{$eq: ['$post.id', '$$postId']}]}}},
              {
                $project: {
                  _id: 1,
                  post: 1,
                  username: 1,
                  fullName: 1,
                  thumb: 1,
                },
              },
            ],
            as: 'users',
          },
        },
        {
          $project: {
            user: {$arrayElemAt: ['$users', 0]},
            currentDate: '$currentDate',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$user._id',
            username: '$user.username',
            fullName: '$user.fullName',
            thumb: '$user.thumb',
            post: {
              id: '$user.post.id',
              title: '$user.post.title',
              isPrivate: '$user.post.isPrivate',
              description: '$user.post.description',
              groupName: '$user.post.groupName',
              currentDate: '$currentDate',
              isDeleted: '$user.post.isDeleted',
            },
          },
        },
        {
          $unwind: '$post.description',
        },
        {
          $match: {'post.description.isDeleted': false},
        },
        {
          $group: {
            _id: '$post.id',
            id: {$first: '$id'},
            username: {$first: '$username'},
            fullName: {$first: '$fullName'},
            thumb: {$first: '$thumb'},
            isContributor: {$first: '$isContributor'},
            groupName: {$first: '$post.groupName'},
            currentDate: {$first: '$post.currentDate'},
            title: {$first: '$post.title'},
            description: {$push: '$post.description'},
            isDeleted: {$first: '$post.isDeleted'},
            isPrivate: {$first: '$post.isPrivate'},
            count: {$sum: 1},
          },
        },
        {
          $project: {
            id: '$id',
            username: '$username',
            fullName: '$fullName',
            thumb: '$thumb',
            isContributor: '$isContributor',
            post: {
              id: '$_id',
              groupName: '$groupName',
              currentDate: '$currentDate',
              title: '$title',
              description: '$description',
              isDeleted: '$isDeleted',
              isPrivate: '$isDeleted',
              descriptionCount: '$count',
            },
            _id: 0,
          },
        },
        {$unwind: '$post.description'},
        {$match: {'post.description.isActive': true}},
      ])
      .get();
  }

  async setMapperData(
    // tslint:disable-next-line:no-any
    match: any,
    // tslint:disable-next-line:no-any
    param: any,
  ): Promise<boolean> {
    if (!param) {
      return false;
    }
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _userCollection = (this.dataSource.connector as any).collection(
      'UserPostAccessibility',
    );
    const userUpdate = await _userCollection.updateOne(match, {$set: param});
    if (userUpdate.modifiedCount > 0) {
      return true;
    } else {
      return false;
    }
  }
}
