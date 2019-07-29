import { Service } from '..'
import { action } from 'mobx'

export class GlobalService extends Service {

  constructor (path: string = '/api') {
    super(path)
  }

  @action public async getTitle (data: any = {}) {
    return this.get('/title', data)
  }
  
}

export default new GlobalService()