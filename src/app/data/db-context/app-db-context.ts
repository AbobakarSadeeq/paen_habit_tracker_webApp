export class AppDbContext {

  dbConfig() {
    return {
      name: 'HabitDb',
      version: 2,
      objectStoresMeta: [this._habitTable(), this._habitCompletion()]
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

  private _habitCompletion() {
    return {
      store: 'habit_completions',
      storeConfig: { keyPath: 'Id', autoIncrement: true },
      storeSchema: [
        { name: 'doneDate', keypath: 'doneDate', options: { unique: false } },
        { name: 'habitId', keypath: 'habitId', options: { unique: false } }
      ]
    };
  }

}
