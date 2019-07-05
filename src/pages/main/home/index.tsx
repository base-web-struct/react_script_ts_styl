import * as React from 'react'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react';
import { MenuStore } from 'src/stores/modules/menu'
import { UserStore } from 'src/stores/modules/user'
import Util from 'src/utils'
import Bean from 'src/beans'
import { RouteComponentProps } from 'react-router';

interface HomePorps extends RouteComponentProps {
  userStore: UserStore
  menuStore: MenuStore
  menu: any
}

@inject('menuStore', 'userStore')
@observer
export default class Home extends React.Component<HomePorps, {}> {  

  public menuStore: MenuStore
  public userStore: UserStore

  @observable public url: string

  constructor (props: any) {
    super(props)
    this.menuStore = props.menuStore
    this.userStore = props.userStore
  }

  public componentWillReceiveProps () {
    const map: any = Util.getHrefMap(location.search)
    if (map && map.href) {
      this.url = decodeURIComponent(map.href)
    }
       
  }
  public componentDidMount () {
    window.addEventListener('message', async (event: any) => {
      let BDPOrigin = Bean.BDP_ORIGIN
      if (this.url) {
        const originArray = this.url.split(':')
        BDPOrigin = originArray[0] + ':' + originArray[1]
      }

      if (event.origin !== BDPOrigin) {
        return
      }
      if (event.data.type === 'getToken') {
        const account: any = this.userStore.getAccount()
        event.source.postMessage({'access_token': account.access_token}, event.origin)
        return
      }
      const menuList: any = await this.menuStore.getMenuList()
      let targetMenuObj: any
      if (event.data.type === 'toDigitalInfoCoop') {
        targetMenuObj =  Util.findMenuByName('情报协作', menuList)
        this.props.history.push(`/main/cooperate?id=${targetMenuObj.id}&parent_id=${targetMenuObj.parent_id}`)
      }

      if (event.data.type === 'toDigitalTask') {
        targetMenuObj =  Util.findMenuByName('任务预警中心', menuList)
        this.props.history.push(`/main/advance?id=${targetMenuObj.id}&parent_id=${targetMenuObj.parent_id}`)
      }

      if (event.data.type === 'toPersonManage') {
        targetMenuObj =  Util.findMenuByName('人口管理', menuList)
        this.props.history.push(`/main/advance?id=${targetMenuObj.id}&parent_id=${targetMenuObj.parent_id}&href=${encodeURIComponent(targetMenuObj.href)}`)
      }
      this.menuStore.setMenu(targetMenuObj)

    }, false);
  }

  public render () {
    return (
      <div className="home-main">
        {
          (this.url) ? (
            <iframe
              className="home-frame"
              src={(this.url.indexOf('http://') > -1) ? (this.url) : (`http://${this.url}`)} >
            </iframe>
          ) : ('')
        }
      </div>
    )
  }
}