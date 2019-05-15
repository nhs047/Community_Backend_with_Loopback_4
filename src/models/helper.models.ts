import {ObjectID} from 'mongodb';

export class HelperMethod {
  constructor() {}
  //validation
  // tslint:disable-next-line:no-any
  //mapper
  // tslint:disable-next-line:no-any
  objValidation(definedModel: Array<string>, obj: any) {
    // tslint:disable-next-line:no-any
    let retObj: any = {};
    for (let prop in obj) {
      if (definedModel.indexOf(prop) !== -1) {
        retObj[prop] = obj[prop];
      }
    }
    return retObj;
  }
  // tslint:disable-next-line:no-any
  oneLayerArrayFilter(obj: any, commonString: string) {
    // tslint:disable-next-line:no-any
    const key: any = Object.keys(obj);
    // tslint:disable-next-line:no-any
    let data: any = {};
    // tslint:disable-next-line:no-any
    key.forEach((element: any) => {
      data[`${commonString}${element}`] = obj[element];
    });

    return data;
  }
  // tslint:disable-next-line:no-any
  idToObjectID(arr: any) {
    let retArr: Array<ObjectID> = [];
    for (let value of arr) {
      retArr.push(new ObjectID(value));
    }
    return retArr;
  }
}
