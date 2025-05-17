// lib/realmDB.ts
import Realm from 'realm';
import { UserSchema } from '../schemas/UserSchema';

class RealmSingleton {
  private static instance: Realm | null = null;

  private static config: Realm.Configuration = {
    schema: [UserSchema],
    schemaVersion: 1,
  };

  /**
   * Always returns the same Realm instance.
   * If closed, reopens it.
   */
  static async getInstance(): Promise<Realm> {
    if (RealmSingleton.instance && !RealmSingleton.instance.isClosed) {
      return RealmSingleton.instance;
    }

    RealmSingleton.instance = await Realm.open(RealmSingleton.config);
    return RealmSingleton.instance;
  }

  /** Utility for explicitly keeping realm open (noop since Realm stays open) */
  static async persistRealmInstance(): Promise<void> {
  const realm = await this.getInstance();
  // Optionally resume sync if needed (currently placeholder)
  const realmWithSync = realm as unknown as { syncSession?: { resume?: () => void } };
  realmWithSync.syncSession?.resume?.();
}

  /** Clean close only when app explicitly exits */
  static async close(): Promise<void> {
    if (RealmSingleton.instance && !RealmSingleton.instance.isClosed) {
      RealmSingleton.instance.close();
      RealmSingleton.instance = null;
    }
  }

  // Generalized CRUD

  static async create<T extends object>(schemaName: string, data: Partial<T>): Promise<void> {
    const realm = await this.getInstance();
    realm.write(() => {
      realm.create<T & Realm.Object>(schemaName, data as T);
    });
  }

  static async update<T extends object>(schemaName: string, id: Realm.BSON.ObjectId | string, updates: Partial<T>): Promise<void> {
    const realm = await this.getInstance();
    realm.write(() => {
      realm.create<T & Realm.Object>(
        schemaName,
        { ...updates, _id: id } as T & { _id: typeof id },
        Realm.UpdateMode.Modified
      );
    });
  }

  static async delete(schemaName: string, id: Realm.BSON.ObjectId | string): Promise<void> {
    const realm = await this.getInstance();
    realm.write(() => {
      const obj = realm.objectForPrimaryKey(schemaName, id);
      if (obj) realm.delete(obj);
    });
  }

  static async findAll<T extends object>(schemaName: string): Promise<Realm.Results<T>> {
    const realm = await this.getInstance();
    return realm.objects(schemaName) as Realm.Results<T>;
  }

  static async findById<T extends Realm.Object>(schemaName: string, id: Realm.BSON.ObjectId | string): Promise<T | null> {
    const realm = await this.getInstance();
    return realm.objectForPrimaryKey<T>(schemaName, id as never) || null;
  }

  static async getExistingObject<T extends Realm.Object>(
    schemaName: string | { name: string },
    primaryKey: Realm.BSON.ObjectId | string
  ): Promise<T | null> {
    const realm = await this.getInstance();
    const name = typeof schemaName === 'string' ? schemaName : schemaName.name;
    return realm.objectForPrimaryKey<T>(name, primaryKey as never);
  }
}

export default RealmSingleton;
