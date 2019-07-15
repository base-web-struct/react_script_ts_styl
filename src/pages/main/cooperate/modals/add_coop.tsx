import * as React from 'react'
import { Modal, Input, message, Select } from 'antd'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { UserService } from 'src/services/user'
import { GroupService } from 'src/services/group'
import { CoopService } from 'src/services/coop'
import Bean from 'src/beans'

export interface AddCoopProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
  refersh: () => void
}

interface CoopDataProp {
  name: string,
  sponsor_name: string,
  sponsor_police_id: string,
  sponsor_dep: string,
  sponsor_dep_code: string,
  remarks: string,
  coop_dep: string,
  id: string
}

@inject('userService', 'groupService', 'coopService')
@observer
class AddCoop extends React.Component<AddCoopProps, {}> {

  @observable public coopData: CoopDataProp
  @observable public feedText: string

  public userService: UserService
  public groupService: GroupService
  public coopService: CoopService

  constructor (props: any) {
    super(props)
    this.userService = props.userService
    this.groupService = props.groupService
    this.coopService = props.coopService
    this.refresh()
  }

  public init = () => {
    this.refresh()
    this.initUserProfile()
  }

  public refresh = () => {
    this.feedText = ''
    this.coopData = {
      id: '',
      name: '',
      sponsor_name: '',
      sponsor_police_id: '',
      sponsor_dep: '',
      sponsor_dep_code: '',
      remarks: '',
      coop_dep: ''
    }
  }

  public feed = async (id: string) => {
    const res: any = await this.coopService.detail({
      id
    })
    if (res.status === 0) {
      this.coopData = {
        ...this.coopData,
        name: res.data.name,
        remarks: res.data.remarks,
        coop_dep: res.data.coop_dep,
        id
      }
    }
  }

  public async initUserProfile () {
    const res: any = await this.userService.getProfile()
    if (res.status === 0) {
      this.coopData = {
        ...this.coopData,
        sponsor_name: res.data.name,
        sponsor_police_id: res.data.police_id
      }
    }
    const resp: any = await this.groupService.getGroup()
    if (resp.status === 0) {
      this.coopData = {
        ...this.coopData,
        sponsor_dep: resp.data.name,
        sponsor_dep_code: resp.data.id
      }
    }
  }

  public componentDidMount () {
    this.props.onRef(this)
  }

  public ok = async () => {
    if (this.coopData.id) {
      if (!this.feedText) {
        message.error('反馈内容不能为空')
        return
      }
      const res: any = await this.coopService.feedback({
        coop_id: this.coopData.id,
        content: this.feedText
      })
      if (res.status === 0) {
        message.success('反馈成功')
        this.props.refersh()
        this.props.close()
      } else {
        message.error(res.msg || '反馈失败')
      }
    } else {
      if (!this.coopData.name) {
        message.error('名称不能为空')
        return
      }
      if (!this.coopData.coop_dep) {
        message.error('协作部门不能为空')
        return
      }
      const res = await this.coopService.addCoop(this.coopData)
      if (res.status === 0) {
        message.success('添加成功')
        this.props.refersh()
        this.props.close()
      } else {
        message.error(res.msg || '添加失败')
      }
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
        title="情报协作表单"
        centered
        maskClosable={false}
        cancelText={'取消'}
        okText={'确定'}
        visible={visible}
        onOk={this.ok}
        onCancel={this.cancel}
      >
        <div className="form-input">
          <label>事项名称</label>
          <Input
            placeholder="请填写名称（必填）"
            value={this.coopData.name}
            disabled={!!this.coopData.id}
            onChange={e => { this.coopData.name = e.target.value }} />
        </div>
        <div className="form-input">
          <label>协作部门</label>
          <Select
            disabled={!!this.coopData.id}
            value={this.coopData.coop_dep}
            onChange={(value: any) => { this.coopData.coop_dep = value }} >
            {
              Bean.DEP_SEL_LIST.map((item: any, index: number) => (
                <Select.Option key={index} value={item.value} >{item.name}</Select.Option>
              ))
            }
          </Select>
        </div>
        <div className="form-input area">
          <label>协作请求描述</label>
          <Input.TextArea
            disabled={!!this.coopData.id}
            placeholder="请填写协作请求描述…"
            value={this.coopData.remarks}
            onChange={e => { this.coopData.remarks = e.target.value }} />
        </div>
        <div className="form-input">
          <div className="item">
            <label>发起人姓名</label>
            <Input disabled value={this.coopData.sponsor_name} onChange={e => { this.coopData.sponsor_name = e.target.value }} />
          </div>
          <div className="item">
            <label>发起人警号</label>
            <Input disabled value={this.coopData.sponsor_police_id} onChange={e => { this.coopData.sponsor_police_id = e.target.value }}/>
          </div>
        </div>
        <div className="form-input">
          <div className="item">
            <label>发起人单位</label>
            <Input disabled value={this.coopData.sponsor_dep} onChange={e => { this.coopData.sponsor_dep = e.target.value }} />
          </div>
          <div className="item">
            <label>单位编码</label>
            <Input disabled value={this.coopData.sponsor_dep_code} onChange={e => { this.coopData.sponsor_dep_code = e.target.value }} />
          </div>
        </div>
        {
          (this.coopData.id) ? (
            <div className="form-input area">
              <label>反馈</label>
              <Input.TextArea
                placeholder="请填写反馈…"
                value={this.feedText}
                onChange={e => { this.feedText = e.target.value }} />
            </div>
          ) : ('')
        }
      </Modal>
    )
  }
}

export default AddCoop