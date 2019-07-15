import { action, observable } from 'mobx'

export class HomeStore {
  @observable private id: string

  constructor () {
    this.setId('2')
  }

  public setId (id: string) {
    this.id = id
  }

  public getId () {
    return this.id
  }

  @action public async addId (id: string) {
    try {
      this.id += id
    } catch (error) {
      return error
    }
  }
}

export default new HomeStore()