import { observer, inject } from 'mobx-react'
import * as React from 'react'
import { Menu, message } from 'antd'
import { Route, Switch, Redirect, RouteComponentProps } from 'react-router'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { observable } from 'mobx'
import Util from 'src/utils'
import Cookies from 'js-cookie'

import Home from './home'
import Cooperate from './cooperate'
import Advance from './advance'
import HeaderNav from 'src/components/header'

import { UserService } from 'src/services/user'
import { HomeStore } from 'src/stores/modules/home'
import { MenuService } from 'src/services/menu'
import { MenuStore } from 'src/stores/modules/menu'
import { UserStore } from 'src/stores/modules/user'
import Cookie from 'js-cookie';

@inject('userService', 'menuService', 'homeStore', 'menuStore', 'userStore')
@observer
class Main extends React.Component<RouteComponentProps<{}>, {}> {

  public userService: UserService
  public homeStore: HomeStore
  public menuService: MenuService
  public menuStore: MenuStore
  public userStore: UserStore
  public fullScreenBtn: React.RefObject<any>

  @observable public collapsed: boolean = false
  @observable public menuList: any[] = []
  @observable public selectItem: string[]
  @observable public selectExpand: string[] = []
  @observable public userProfile: any

  constructor (props: any) {
    super(props)
    this.initConfig(props)
    this.getMenuList()
    this.getUserProfile()
    this.fullScreenBtn = React.createRef()
  }

  public initConfig (props: any): void {
    this.userService = props.userService
    this.homeStore = props.homeStore
    this.menuService = props.menuService
    this.menuStore = props.menuStore
    this.userStore = props.userStore
  }

  public async getUserProfile () {
    const res: any = await this.userService.getProfile()
    if (res.status === 0) {
      this.userProfile = res.data
    }
  }

  public getMenuList = async () => {
    const item: any = this.menuStore.getMenu()
    if (item) {
      this.selectItem = [item.id]
      this.selectExpand = [item.parent_id]
    }
    const list: any = await this.menuStore.getMenuList()
    if (list && list.length > 0) {
      this.menuList = list
      return
    }
    const res = await this.menuService.getMenuList()
    if (res.status === 0) {
      // Util.setMenu(res.data)
      this.menuList = res.data
      this.menuStore.setMenuList(this.menuList)
      if (!item) {
        const select: any = this.menuList.slice()[0]
        this.selectItem = [select.id]
        this.selectExpand = [select.parent_id]
        Cookies.set('first_menu_cache', JSON.stringify(select))
        const href: string = await this.menuCache(select)

        if (!location.search && href) {
          this.props.history.push(href)
        }
      }
      console.log(this.selectItem)
    } else {
      message.error(res.msg || '获取菜单失败')
    }
    
  }

  public menuCache = async (item: any): Promise<string> => {
    const res: any = await this.menuService.getHref({menu_name: item.name})
    let href: string = ''
    if (res.status === 0) {
      href = res.data
    } else {
      message.error(res.msg || '获取链接失败')
      return ''
    }
    this.menuStore.setMenu({
      ...item,
      href
    })
    switch (item.type) {
      case 'dynamic':
        return `/main/home?id=${item.id}&&href=${encodeURIComponent(item.href)}`
        break
      case 'static':
      default:
        return `${href}?id=${item.id}`
        break
    }
  }

  public chooseMenu = async (item: any) => {
    const href: string = await this.menuCache(item)
    if (href) {
      this.props.history.push(href)
    }
    this.selectItem = [item.id]
    this.collapsed = false
  }

  public expandItem = async (data: any) => {
    const index = this.selectExpand.indexOf(data.id)
    if (index > -1) {
      this.selectExpand.splice(index, 1)
    } else {
      this.selectExpand.push(data.id)
    }
  }

  public toggleMenu = () => {
    this.collapsed = !this.collapsed
  }
  
  public hideMenu = () => {
    this.collapsed = false
  }

  public showMenu = () => {
    this.collapsed = true
  }

  public goHome = async () => {
    const firstMenu = Cookie.getJSON('first_menu_cache')
    const href: string = await this.menuCache(firstMenu)
    if (href) {
      this.props.history.push(href)
    }
  }

  public sigout = async (): Promise<any> => {
    const res = await this.userService.sigout()
    if (res.status === 0) {
      this.userStore.sigout()
    } else {
      message.error(res.msg || '操作失败')
    }
  }

  public MenuItem = (list: any[]): React.ReactNode => {
    if (list && list.length > 0) {
      return list.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <Menu.SubMenu
              key={item.id}
              title={
                <span className="menu-name">{item.name}</span>
              }
              onTitleClick={this.expandItem.bind(this, item)}>
                {this.MenuItem(item.children)}
                
            </Menu.SubMenu>
          )
        } else {
          return (
            <Menu.Item
              onClick={this.chooseMenu.bind(this, item)}
              key={item.id}
              title={item.name}
              >
              <span className="menu-name">{item.name}</span>
            </Menu.Item>
          )
        }
      })
    }
    return
  }

  public requestFullscreen = () => {
    const el: any = document.documentElement
    const rfs = el.requestFullScreen || el.webkitRequestFullScreen ||
        el.mozRequestFullScreen || el.msRequestFullScreen
    rfs.call(el)
  }

  public componentWillReceiveProps (nextPrpos: any) {
    if (nextPrpos.location.search !== this.props.location.search) {
      const search = nextPrpos.location.search
      const map: any = Util.getHrefMap(search)
      this.selectItem = [map.id]
      if (map.parent_id) {
        this.selectExpand = [map.parent_id]
      }
    }
   
  }

  public componentDidMount () {
    // his.fullScreenBtn.current.click()
  }

  get getDepartment (): string {
    if (this.userProfile && this.userProfile.department) {
      return this.userProfile.department
    }
    return ''
  }

  public render () {
    const location = this.props.location
    const { pathname } = location
    let isHideGoHome = false
    if (this.menuList.length) {
      isHideGoHome = this.menuList.length === 1 || this.menuList[0].type === 'static'
    }
    
    return (
      <div className="main">
        <HeaderNav userProfile={this.userProfile} goHome={this.goHome} toggle={this.toggleMenu} sigout={this.sigout} isHideGoHome={isHideGoHome}/>
        {/* <button className="full-screen-btn" ref={this.fullScreenBtn} onClick={this.requestFullscreen}>全屏</button> */}
        <div className="main-body">
          <div className="menu-slide" onMouseEnter={this.showMenu}></div>
          <div onMouseLeave={this.hideMenu} className={`left-menu ${this.collapsed ? '' : 'unexpand' }`}>
            <Menu
              selectedKeys={this.selectItem}
              openKeys={this.selectExpand}
              mode="inline"
              theme="dark">
                {
                  this.MenuItem(this.menuList)
                }
            </Menu>
          </div>
          <div className="right-body">
            <TransitionGroup className="main-route">
              <CSSTransition
                key={pathname.split('/')[2]}
                timeout={{ enter: 1000, exit: 0 }}
                classNames={'fade'}>
                  <Switch location={location}>
                    <Route
                      path="/main/home"
                      component={Home}
                    />
                    <Route
                      path="/main/cooperate"
                      component={Cooperate}
                    />
                    <Route
                      path="/main/advance"
                      component={Advance}
                    />
                    <Redirect to="/main/home" />
                  </Switch>
              </CSSTransition>
            </TransitionGroup>
          </div>
        </div>
      </div>
    )
  }
}

export default Main