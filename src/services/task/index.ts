import { Service } from '..'
import { action } from 'mobx'

export class TaskService extends Service {

  constructor (path: string = '/api/task') {
    super(path)
  }

  @action public async addSelfTask (data: any = {}) {
    return this.post('/self_task', data)
  }
  
}

export default new TaskService()