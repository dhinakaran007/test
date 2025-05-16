import { Realm } from 'realm';
import { UserSchema } from '../schemas/UserSchema';

class RealmSingleton {
  private static instance: Realm | null = null;

  private static config: Realm.Configuration = {
    schema: [UserSchema],
    schemaVersion: 1,
  };

  static async getInstance(): Promise<Realm> {
    if (!RealmSingleton.instance) {
      RealmSingleton.instance = await Realm.open(RealmSingleton.config);
    }
    return RealmSingleton.instance;
  }

  static async create<T extends object>(schemaName: string, data: Partial<T>): Promise<void> {
    const realm = await RealmSingleton.getInstance();
    realm.write(() => {
      realm.create<T & Realm.Object>(schemaName, data as T);
    });
  }

  static async update<T extends object>(schemaName: string, id: string, updates: Partial<T>): Promise<void> {
    const realm = await RealmSingleton.getInstance();
    realm.write(() => {
      realm.create<T & Realm.Object>(
        schemaName, 
        { ...updates, _id: id } as T & { _id: string }, 
        Realm.UpdateMode.Modified
      );
    });
  }

  static async delete(schemaName: string, id: string): Promise<void> {
    const realm = await RealmSingleton.getInstance();
    realm.write(() => {
      const obj = realm.objectForPrimaryKey(schemaName, id);
      if (obj) realm.delete(obj);
    });
  }

  static async findAll<T extends object>(schemaName: string): Promise<Realm.Results<T>> {
    const realm = await RealmSingleton.getInstance();
    return realm.objects(schemaName) as Realm.Results<T>;
  }

  static async findById<T extends Realm.Object>(schemaName: string, id: string): Promise<T | null> {
    const realm = await RealmSingleton.getInstance();
    return realm.objectForPrimaryKey(schemaName, id) as T | null;
  }

  static close(): void {
    if (RealmSingleton.instance) {
      RealmSingleton.instance.close();
      RealmSingleton.instance = null;
    }
  }
}

export default RealmSingleton;