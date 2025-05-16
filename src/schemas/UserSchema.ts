import { ObjectSchema } from 'realm';

export interface IUser {
  _id: Realm.BSON.ObjectId;
  name: string;
  email: string;
  lastUpdated: Date;
}

export const UserSchema: ObjectSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    email: 'string',
    lastUpdated: 'date',
  },
};

export type User = IUser & Realm.Object;