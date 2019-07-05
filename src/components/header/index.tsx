import * as React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

export interface HeaderProps {
  toggle: () => void
}

@observer
export default class HeaderNav extends React.Component<HeaderProps, {}> {

  public timeStamp: React.RefObject<any>

  constructor (props: any) {
    super(props)
    this.timeStamp = React.createRef()
  }

  public toggleMenu = () => {
    this.props.toggle()
  }

  public componentDidMount () {
    const update = () => {
      this.timeStamp.current.innerHTML = moment().format('YYYY-MM-DD HH:mm:ss')
    }
    update()
    setInterval(update, 1000)
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
          <span className="place">武昌分局-梅苑派出所</span>
          <span className="time" ref={this.timeStamp}>
          </span>
        </div>
      </div>
    )
  }
}
