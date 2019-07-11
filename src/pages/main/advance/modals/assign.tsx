import * as React from 'react'
import { Modal, Input, Icon, Checkbox, Tag, Tooltip, message } from 'antd'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'

import { UserService } from 'src/services/user'
import { observable } from 'mobx'
import { MsgService } from 'src/services/msg'

interface AssignProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
  refresh: () => void
}

interface PageData {
  page_size: number
  page_no: number
}

@inject('userService', 'msgService')
@observer
class Assign extends React.Component<AssignProps, {}> {

  public userService: UserService
  public msgService: MsgService
  public pageData: PageData
  public msgId: string = ''

  @observable public seacrhText: string = ''
  @observable public userList: any[] = []
  @observable public chooseUserList: any[] = []
  @observable public demand: string = ''

  constructor (props: any) {
    super(props)
    this.userService = props.userService
    this.msgService = props.msgService
    this.pageData = {
      page_size: 20,
      page_no: 1
    }
  }

  public initUsers = (id: string = '') => {
    this.msgId = id
    this.seacrhText = ''
    this.searchUsers()
  }

  public searchUsers = async () => {
    const res: any = await this.userService.getUseList({
      // ...this.pageData,
      search_content: this.seacrhText
    })
    if (res.status === 0) {
      this.userList = res.data
    }
  }

  public enterSearch = (e: any) => {
    if (e.key === 'Enter') {
      this.searchUsers()
    }
  }

  public ok = async () => {
    if (this.chooseUserList.length === 0) {
      message.error('至少选择一个接收人!')
      return
    }
    const putList: string[] = []
    this.chooseUserList.forEach((item: any) => {
      putList.push(item.id)
    })

    const res: any = await this.msgService.sendMsg({
      msg_id: this.msgId,
      user_id_list: putList,
      demand: this.demand
    })
    if (res.status === 0) {
      message.success('派发成功')
      this.props.refresh()
      this.props.close()
    } else {
      message.error(res.msg || '派发失败')
    }
  }

  public componentDidMount () {
    this.props.onRef(this)
  }

  public cancel = () => {
    this.props.close()
  }

  public chooseUser = (item: any) => {
    const index: number = _.findIndex(this.chooseUserList, (n: any) => n.id === item.id)
    if (index > -1) {
      this.chooseUserList.splice(index, 1)
    } else {
      this.chooseUserList.push(item)
    }
  }

  public deleteUser = (item: any) => {
    const index: number = _.findIndex(this.chooseUserList, (n: any) => n.id === item.id)
    if (index > -1) {
      this.chooseUserList.splice(index, 1)
    }
  }

  public render () {
    const { visible } = this.props

    return (
      <Modal
        title="派发"
        centered
        className="assign-main"
        cancelText={'取消'}
        okText={'确定'}
        visible={visible}
        onOk={this.ok}
        onCancel={this.cancel}>  
        <div className="form-input">
          <label>接收人</label>
          <Icon type="search" />
          <Input
            value={this.seacrhText}
            onChange={(e: any) => this.seacrhText = e.target.value}
            onKeyPress={this.enterSearch}/>
        </div>
        <ul className="res-list">
          {
            this.userList.map((item: any) => {
              return (
                <li key={item.police_id}>
                  <Checkbox
                    checked={_.findIndex(this.chooseUserList, (n: any) => n.id === item.id) > -1}
                    onChange={this.chooseUser.bind(this, item)} >
                    <span>{item.police_id}</span>
                    <span>{item.name}</span>
                  </Checkbox>
                </li>
              )
            })
          }
        </ul>
        <div className="user-res-box">
          <label>已选</label>
          <div className="tag-box">
            {
              this.chooseUserList.map((item: any) => (
                <Tooltip key={item.id} title={`${item.police_id}  ${item.name}`}>
                  <Tag color="#108ee9" closable onClose={this.deleteUser.bind(this, item)}>{item.name}</Tag>
                </Tooltip>
              ))
            }
          </div>
        </div>
        <div className="form-input area">
          <label>任务要求</label>
          <Input.TextArea
            placeholder="请输入任务要求(选填)"
            value={this.demand}
            onChange={(e: any) => this.demand = e.target.value}
          />
        </div>
      </Modal>
    )
  }
}

export default Assign