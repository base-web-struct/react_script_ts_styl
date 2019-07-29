import { Service } from '..'
import { action } from 'mobx'

export class MapService extends Service {

  constructor (path: string = '/api/map') {
    super(path)
  }

  @action public async getMapUrl (data: any = {}): Promise<any> {
    return this.get('/', data)
  } 
}

export default new MapService()
