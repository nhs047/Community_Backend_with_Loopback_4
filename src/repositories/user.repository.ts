import {DefaultCrudRepository} from '@loopback/repository';
import {User} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {ResponseModel} from '../models/response.models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  responseModel: ResponseModel = new ResponseModel();
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(User, dataSource);
  }

  async pushData(
    // tslint:disable-next-line:no-any
    param: any,
    match: object,
    fieldName: string,
  ): Promise<ResponseModel> {
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _userCollection = (this.dataSource.connector as any).collection(
      'User',
    );
    const userUpdate = await _userCollection.updateOne(match, param);
    // await this.dataSource.disconnect();
    if (userUpdate.modifiedCount > 0) {
      this.responseModel = {
        data: param['$push'][fieldName],
        isExecuted: true,
        message: 'Record updated sucessfully',
      };
    } else {
      this.responseModel = {
        data: {},
        isExecuted: false,
        message: 'No record updated',
      };
    }
    return this.responseModel;
  }

  async pushSecondLayerArray(
    // tslint:disable-next-line:no-any
    param: any,
    match: object,
    arrayFilter: object,
    fieldName: string,
  ): Promise<ResponseModel> {
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _userCollection = (this.dataSource.connector as any).collection(
      'User',
    );
    const userUpdate = await _userCollection.updateOne(
      match,
      param,
      arrayFilter,
    );
    // await this.dataSource.disconnect();
    if (userUpdate.modifiedCount > 0) {
      this.responseModel = {
        data: param['$push'][fieldName],
        isExecuted: true,
        message: 'Record updated sucessfully',
      };
    } else {
      this.responseModel = {
        data: {},
        isExecuted: false,
        message: 'No record updated',
      };
    }
    return this.responseModel;
  }

  async setData(
    // tslint:disable-next-line:no-any
    match: any,
    // tslint:disable-next-line:no-any
    param: any,
    // tslint:disable-next-line:no-any
    arrayFilter: any,
    // tslint:disable-next-line:no-any
    obj: any,
  ): Promise<ResponseModel> {
    if (Object.keys(param).length > 0) {
      if (!this.dataSource.connected) {
        await this.dataSource.connect();
      }
      // tslint:disable-next-line:no-any
      const _userCollection = (this.dataSource.connector as any).collection(
        'User',
      );
      const userUpdate = arrayFilter
        ? await _userCollection.updateOne(
            match,
            {$set: param},
            {arrayFilters: arrayFilter},
          )
        : await _userCollection.updateOne(match, {$set: param});

      if (userUpdate.modifiedCount > 0) {
        this.responseModel = {
          data: obj,
          isExecuted: true,
          message: 'Record updated sucessfully',
        };
      } else {
        this.responseModel = {
          data: {},
          isExecuted: false,
          message: 'No record updated',
        };
      }
    } else {
      this.responseModel = {
        data: {},
        isExecuted: false,
        message: 'Please place valid object',
      };
    }
    return this.responseModel;
  }

  async customCount(
    // tslint:disable-next-line:no-any
    param: any,
    isAll: boolean,
  ): Promise<ResponseModel> {
    if (!this.dataSource.connected) {
      await this.dataSource.connect();
    }
    // tslint:disable-next-line:no-any
    const _userCollection = (this.dataSource.connector as any).collection(
      'User',
    );
    const aggregate = await _userCollection.aggregate(param).get();
    // await this.dataSource.disconnect();
    this.responseModel.data = isAll ? aggregate : aggregate[0];
    this.responseModel.isExecuted =
      (!isAll && aggregate && aggregate[0]) || isAll ? true : false;
    this.responseModel.message =
      (!isAll && aggregate && aggregate[0]) || isAll ? '' : 'No record found';
    return this.responseModel;
  }
}
