export class AppDbContext {

  dbConfig() {
    return {
      name: 'HabitDb',
      version: 1,
      objectStoresMeta: [this._habitTable()]
    };
  }

  private _habitTable() {
    return {
      store: 'habits',
      storeConfig: { keyPath: 'Id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'color', keypath: 'color', options: { unique: false } },
        { name: 'createdAt', keypath: 'createdAt', options: { unique: false } }
      ]
    }
  }

}
