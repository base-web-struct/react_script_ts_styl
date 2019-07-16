import { Service } from '..'
import { action } from 'mobx'

export class RoleService extends Service {

  constructor (path: string = '/api/role') {
    super(path)
  }

  @action public async getDeptList (data: any = {}) {
    return this.get('/coop_dept_list', data)
  }
  
}

export default new RoleService()