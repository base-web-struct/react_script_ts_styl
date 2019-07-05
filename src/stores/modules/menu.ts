import { action, observable } from 'mobx'
import Cookies from 'js-cookie'

export class MenuStore {
  @observable public menu: any = null

  @observable private menuList: any[] = []

  constructor () {
    if (Cookies.get('menu_cache')) {
      this.menu = JSON.parse(Cookies.get('menu_cache') as string)
    }
  }

  public getMenu () {
    return this.menu
  }

  @action public reCache () {
    this.menu = null
    this.menuList = []
  }

  public getUrl (): string {
    if (this.menu) {
      return this.menu.href
    }
    return ''
  }

  @action public async getMenuList () {
    if (this.menuList && this.menuList.length > 0) {
      return this.menuList
    } else {
      return []
    }
  }

  @action public setMenuList (list: any[]) {
    this.menuList = list
  }

  @action public setMenu (menu: any) {
    if (menu) {
      this.menu = menu
      Cookies.set('menu_cache', JSON.stringify(menu))
    }
  }
}

export default new MenuStore()