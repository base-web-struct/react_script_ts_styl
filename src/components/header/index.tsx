import * as React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import { Icon } from 'antd'
import { MenuStore } from 'src/stores/modules/menu'

export interface HeaderProps {
  userProfile: any,
  toggle: () => void
  sigout: () => Promise<any>
  goHome: () => void,
  isHideGoHome: boolean
}

@observer
export default class HeaderNav extends React.Component<HeaderProps, {}> {

  public timeStamp: React.RefObject<any>
  public menuStore: MenuStore
  public timer: any
  constructor (props: any) {
    super(props)
    this.timeStamp = React.createRef()
  }

  public toggleMenu = () => {
    this.props.toggle()
  }

  public sigout = () => {
     this.props.sigout()
  }

  public goHome = () => {
    this.props.goHome()
  }

  public componentDidMount () {
    const update = () => {
      this.timeStamp.current.innerHTML = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    update()
    this.timer = setInterval(update, 1000)
  }

  public componentWillUnmount () {
    clearInterval(this.timer)
  }
 
  public render () {
    return (
      <div className="header-main">
        <div className="left-box">
          <div className="op-box" onClick={this.toggleMenu}>
            <i className="menu"></i>
            <span>菜单</span>
          </div>
          {
            !this.props.isHideGoHome ? 
            <div className="go-home" onClick={this.goHome}>
              <Icon type="arrow-left" />
              <span>首页</span>
          </div> : ''
          }
        </div>
        <div className="mid-box">
          <div className="title"></div>
        </div>
        <div className="right-box">
          {this.props.userProfile ? 
          <span>
            <span className="place">{this.props.userProfile.name}</span>
            <span className="place">{this.props.userProfile.police_id}</span>
            <span className="place">{this.props.userProfile.department}</span>
          </span>
           : 
            ''}
         
          <span className="time" ref={this.timeStamp}>
          </span>
          <span className="logout" onClick={this.sigout}>退出</span>
        </div>
      </div>
    )
  }
}
