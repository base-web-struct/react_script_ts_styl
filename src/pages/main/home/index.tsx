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
  @observable public isFullScreen: boolean = false

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
  public async componentDidMount () {
    window.addEventListener('message', async (event: any) => {
      const menuList: any = await this.menuStore.getMenuList()
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
      let targetMenuObj: any
      
      if (event.data.type === 'fullScreenMap') {
        this.isFullScreen = true
        return
      } else if (event.data.type === 'toDigitalInfoCoop' ||    event.data.type === '情报协作') {
        targetMenuObj =  Util.findMenuByName('数据协作', menuList)
        this.props.history.push(`/main/cooperate?id=${targetMenuObj.id}`)
      } else if (event.data.type === 'toDigitalTask' || event.data.type === '任务预警中心') {
        targetMenuObj =  Util.findMenuByName('任务预警中心', menuList)
        this.props.history.push(`/main/advance?id=${targetMenuObj.id}`)
      } else if (event.data.type) {
        targetMenuObj =  Util.findMenuByName(event.data.type, menuList)
        const parentIdStr = JSON.stringify(targetMenuObj.parent_id)
        this.props.history.push(`/main/home?id=${targetMenuObj.id}&parent_id=${parentIdStr}&href=${encodeURIComponent(targetMenuObj.href)}`)
      }
      this.menuStore.setMenu(targetMenuObj)

    }, false);
  }

  public backPlatform = () => {
    this.isFullScreen = false
  }

  public computedIframeSrc () {
    if (this.isFullScreen) {
      return Bean.FH_MAP_URL
    } else {
      return (this.url.indexOf('http://') > -1) ? (this.url) : (`http://${this.url}`)
      // return 'http://localhost:9300'
    }
    
  }

  public render () {
    return (
      <div className="home-main">
        {
          (this.url) ? (
            <iframe
              className={this.isFullScreen ? 'home-frame full-screen' : 'home-frame'}
              src={this.computedIframeSrc()} >
            </iframe>
          ) : ('')
        }
        {
          this.isFullScreen ? <div className="full-screen-btn" onClick={this.backPlatform}>返回工作台</div> : ''
        }
        
      </div>
    )
  }
}