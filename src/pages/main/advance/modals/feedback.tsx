import * as React from 'react'
import { Modal, Input, message } from 'antd'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { UserService } from 'src/services/user'
import { GroupService } from 'src/services/group'
import { MsgService } from 'src/services/msg'

interface AddCoopProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
  refresh: () => void
}

interface UserData {
  sponsor_name: string,
  sponsor_police_id: string,
  sponsor_dep: string,
  sponsor_dep_code: string
}

@inject('userService', 'groupService', 'msgService')
@observer
class FeedBack extends React.Component<AddCoopProps, {}> {

  public msgId: string = ''
  public msgName: string = ''
  public userService: UserService
  public groupService: GroupService
  public msgService: MsgService

  @observable public feedText: string
  @observable public userData: UserData

  constructor (props: any) {
    super(props)
    this.userService = props.userService
    this.groupService = props.groupService
    this.msgService = props.msgService
    this.userData = {
      sponsor_name: '',
      sponsor_police_id: '',
      sponsor_dep: '',
      sponsor_dep_code: ''
    }
  }

  public componentDidMount () {
    this.props.onRef(this)
  }

  public init (msg: any) {
    this.msgId = msg.id
    this.msgName = msg.title
    this.initUserProfile()
  }

  public async initUserProfile () {
    const res: any = await this.userService.getProfile()
    if (res.status === 0) {
      this.userData = {
        ...this.userData,
        sponsor_name: res.data.name,
        sponsor_police_id: res.data.police_id
      }
    }
    const resp: any = await this.groupService.getGroup()
    if (resp.status === 0) {
      this.userData = {
        ...this.userData,
        sponsor_dep: resp.data.name,
        sponsor_dep_code: resp.data.id
      }
    }
  }

  public ok = async () => {
    if (!this.feedText) {
      message.error('反馈内容不能为空')
      return
    }
    const res: any = await this.msgService.feedback({
      msg_id: this.msgId,
      content: this.feedText
    })
    if (res.status === 0) {
      message.success('反馈成功')
      this.props.refresh()
      this.props.close()
    } else {
      message.error(res.msg || '反馈失败')
    }
  }

  public cancel = () => {
    this.props.close()
  }

  public render () {
    const { visible } = this.props

    return (
      <Modal
        className="add-coop-modal"
        title="反馈"
        centered
        maskClosable={false}
        cancelText={'取消'}
        okText={'确定'}
        visible={visible}
        onOk={this.ok}
        onCancel={this.cancel}>
          <div className="form-input">
            <label>消息名称</label>
            <Input
              value={this.msgName}
              placeholder="请填写名称（必填）"
              disabled />
          </div>
          <div className="form-input">
            <div className="item">
              <label>发起人姓名</label>
              <Input disabled value={this.userData.sponsor_name} />
            </div>
            <div className="item">
              <label>发起人警号</label>
              <Input disabled value={this.userData.sponsor_police_id} />
            </div>
          </div>
          <div className="form-input">
            <div className="item">
              <label>发起人单位</label>
              <Input disabled value={this.userData.sponsor_dep} />
            </div>
            <div className="item">
              <label>单位编码</label>
              <Input disabled value={this.userData.sponsor_dep_code} />
            </div>
          </div>
          <div className="form-input area">
            <label>反馈</label>
            <Input.TextArea
              placeholder="请填写反馈…"
              value={this.feedText}
              onChange={e => { this.feedText = e.target.value }} />
          </div>
      </Modal>
    )
  }
}

export default FeedBack