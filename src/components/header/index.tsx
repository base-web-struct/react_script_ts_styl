import * as React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

export interface HeaderProps {
  department: string
  toggle: () => void
  sigout: () => Promise<any>
}

@observer
export default class HeaderNav extends React.Component<HeaderProps, {}> {

  public timeStamp: React.RefObject<any>
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
        </div>
        <div className="mid-box">
          <div className="title"></div>
        </div>
        <div className="right-box">
          <span className="place">{this.props.department}</span>
          <span className="time" ref={this.timeStamp}>
          </span>
          <span className="logout" onClick={this.sigout}>退出</span>
        </div>
      </div>
    )
  }
}
