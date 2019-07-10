import * as React from 'react'
import { Modal, Input, message, Select } from 'antd'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { UserService } from 'src/services/user'
import { GroupService } from 'src/services/group'
import { CoopService } from 'src/services/coop'
import { RoleService } from 'src/services/role'
import Util from 'src/utils';

export interface AddCoopProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
  refersh: () => void
  isDetail: boolean
}

interface CoopDataProp {
  name: string,
  sponsor_name: string,
  sponsor_police_id: string,
  sponsor_dep: string,
  sponsor_dep_code: string,
  remarks: string,
  coop_dep: string,
  id: string,
  feedback_list: any[]
}

class ModalProps {
  public className: string = 'add-coop-modal'
  public title: string = '情报协作表单'
  public centered: boolean = true
  public cancelText: string = '取消'
  public okText: string = '确定'
  public visible: boolean = false
  public onOk: any
  public onCancel: any

  constructor (onOk: any, onCancel: any) {
    this.onOk = onOk
    this.onCancel = onCancel
  }
}

@inject('userService', 'groupService', 'coopService', 'roleService')
@observer
class AddCoop extends React.Component<AddCoopProps, {}> {

  @observable public coopData: CoopDataProp
  @observable public feedText: string
  public modalPrps: any 
  public deptList: any[] = []

  public userService: UserService
  public groupService: GroupService
  public coopService: CoopService
  public roleService: RoleService

  constructor (props: any) {
    super(props)
    this.userService = props.userService
    this.groupService = props.groupService
    this.coopService = props.coopService
    this.roleService = props.roleService
    this.refresh()
    this.getDeptList()
    this.modalPrps = new ModalProps(this.ok, this.cancel)
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
      coop_dep: '',
      feedback_list: []
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
        id,
        feedback_list: res.data.feedback_list
      }
    }
  }

  public async getDeptList () {
    const res: any = await this.roleService.getDeptList()
    if (res.status === 0) {
      this.deptList = res.data
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

  public FeedBackList = (coopData: CoopDataProp): React.ReactNode => {
   
    if (this.props.isDetail) {
      return coopData.feedback_list.length ? coopData.feedback_list.map((item: any, index: number) => (
        <li key={index}>
          <i></i>
          <span className="time">{Util.momentDate(item.create_time)}</span>
          <span>{item.content}</span>
        </li>
      )) : <li className="no-info">无</li>
    } else {
      return ''
    }
  }

  public componentWillReceiveProps (nextProps: any) {
    this.modalPrps.visible = nextProps.visible
    if (nextProps.isDetail) {
      this.modalPrps = {...this.modalPrps, footer: null}
    } else {
      delete this.modalPrps.footer
    }
  }

  public render () {
    const { isDetail } = this.props
    return (
      <Modal 
      {...this.modalPrps}
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
              this.deptList.map((item: any, index: number) => (
                <Select.Option key={index} value={item} >{item}</Select.Option>
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
          this.coopData.id && !isDetail ? 
            <div className="form-input area">
              <label>反馈</label>
              <Input.TextArea
                placeholder="请填写反馈…"
                value={this.feedText}
                onChange={e => { this.feedText = e.target.value }} />
            </div>
           : <div className="feedback-list">
              <div className="label">反馈列表</div>
              <ul>
                {this.FeedBackList(this.coopData)}
              </ul>
              
            </div>
        }
      </Modal>
    )
  }
}

export default AddCoop