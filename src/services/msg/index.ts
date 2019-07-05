import { Service } from '..'
import { action } from 'mobx'

export class MsgService extends Service {

  constructor (path: string = '/api/msg') {
    super(path)
  }

  @action public async getTaskTree (data: any = {}): Promise<any> {
    return this.get('/task/tree', data)
  }

  @action public async getMsgList (data: any = {}): Promise<any> {
    return this.get('/list', data)
  }

  @action public async updateMsgStatus (data: any = {}): Promise<any> {
    return this.get('/update', data)
  }

  @action public async sendMsg (data: any = {}): Promise<any> {
    return this.post('/send', data)
  }

  @action public async feedback (data: any = {}): Promise<any> {
    return this.post('/feedback', data)
  }

  @action public async getMsgDetail (data: any = {}): Promise<any> {
    return this.get('/detail', data)
  }  

}

export default new MsgService()