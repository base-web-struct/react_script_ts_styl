import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Row, Col } from 'antd'
import { observable } from 'mobx'
import { MsgService } from 'src/services/msg'
import Bean from 'src/beans';
import Util from 'src/utils';
// import Resource from './resource'

interface DetailProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
}

@inject('msgService')
@observer
class Detail extends React.Component<DetailProps, {}> {

  public msgService: MsgService

  @observable public detailData: any = {
    feedback_list: []
  }
  @observable public schema: any[] = []
  @observable public baseData: any = {}
  @observable public resourceModal: boolean = false
  @observable public feedback_file_list: any = {}

  constructor (props: any) {
    super(props)
    this.msgService = props.msgService
  }

  public componentDidMount () {
    this.props.onRef(this)
  }

  public initData = async (id: string) => {
    this.baseData = {}
    const res: any = await this.msgService.getMsgDetail({
      id
    })
    if (res.status === 0) {
      this.detailData = res.data
      if (this.detailData.schema) {
        this.schema = JSON.parse(this.detailData.schema)
        const data: any = JSON.parse(this.detailData.data)
        this.schema.forEach((item: any, index: number) => {
          this.baseData[item.name] = data[index]
        })
      }
    }
  }

  public ok = () => {
    console.log(1)
  }

  public cancel = () => {
    this.props.close()
    this.detailData = {
      feedback_list: []
    }
    
  }

  public showResource = (item: any) => {
    this.resourceModal = true
    this.feedback_file_list = item
  }

  public closeResource = () => {
    this.resourceModal = false
    this.feedback_file_list = []
  }

  public render () {

    const { visible}  = this.props

    return (
      <div>    
        {/* <Resource visible={this.resourceModal} close={this.closeResource} data={this.feedback_file_list}></Resource> */}
        <Modal
          className="msg-detail-modal"
          title="详情"
          width={600}
          footer={null}
          centered
          visible={visible}
          onCancel={this.cancel}>
            <div className="form-input col2">
              <label>流水号</label>
              <div className="item-con">{this.detailData.id}</div>
            </div>
            <div className="form-input col4">
              <label>任务名称</label>
              <div className="item-con">{this.detailData.task_name}</div>
              <label>任务分类</label>
              <div className="item-con">{this.detailData.classify}</div>
            </div>
            <div className="form-input col4">
              <label>任务大类</label>
              <div className="item-con">{this.detailData.category}</div>
              <label>任务小类</label>
              <div className="item-con">{this.detailData.sub_category}</div>
            </div>
            <div className="form-input col4">
              <label>任务类型</label>
              <div className="item-con">{this.detailData.type}</div>
              <label>推送对象</label>
              <div className="item-con">{this.detailData.target}</div>
            </div>
            <div className="form-input col2">
              <label>任务规则</label>
              <div className="item-con">{this.detailData.rule}</div>
            </div>
            <div className="form-input col2">
              <label>任务要求</label>
              <div className="item-con">{this.detailData.demand}</div>
            </div>
            <div className="form-input col2">
              <label>任务内容</label>
              <div className="item-con">{this.detailData.title}</div>
            </div>
            <div className="form-input col2">
              <label>任务状态</label>
              <div className="item-con">{Bean.MSG_STATUS[this.detailData.status]}</div>
            </div>
            {
              this.schema.length ?
              <div className="form-input origin">
              <label>原始数据</label>
              <div className="item-con">
                <Row>
                  {
                    this.schema.map((item: any, index: number) => (
                      <Col key={index} span={12}>
                        <span>{item.alias || item.name}</span>
                        <span>{this.baseData[item.name]}</span>
                      </Col>
                    ))
                  }
                </Row>
              </div>
            </div> : ''
            }
            <div className="form-input list">
              <label>反馈列表</label>
              <div className="item-list">
                <ul>
                  {
                    this.detailData.feedback_list.length ? this.detailData.feedback_list.map((item: any, index: number) => (
                      <li key={index}>
                        <i></i>
                        <span className="time">{Util.momentDate(item.create_time)}</span>
                        <span>{item.content}</span>
                        <span onClick={this.showResource.bind(this, item.feedback_file_list)}>
                          <a href="#">查看资源</a>
                        </span>
                      </li>
                    )) : <li className="no-info">无</li>
                  }
                </ul>
              </div>
            </div>
        </Modal>
      </div>
    )
  }

}

export default Detail