import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { MsgService } from 'src/services/msg'
import { Collapse, Button, Table, Modal, message } from 'antd'
import { observable } from 'mobx'
import Bean from 'src/beans'
import Assign from './modals/assign'
import FeedBack from './modals/feedback'
import Detail from './modals/detail'

@inject('msgService')
@observer
class Advance extends React.Component<{}, {}> {

  public msgService: MsgService
  public tableConfig: any[]
  public tableBox: React.RefObject<any>
  public count: number

  @observable public page: number = 1
  @observable public total: number
  @observable public taskList: any[] = []
  @observable public msgList: any[] = []
  @observable public expandList: string[] = []
  @observable public assignRef: any
  @observable public feedbackRef: any
  @observable public detailRef: any
  @observable public pagination: any
  @observable public chooseTask: string
  @observable public scrollHeight: number
  @observable public assignModal: boolean
  @observable public feedbackModal: boolean
  @observable public detailModal: boolean

  constructor (props: any) {
    super(props)
    this.msgService = props.msgService
    this.init()
    this.pagination = {
      pageSize: 10,
      size: 'middle',
      onChange: this.changePage,
      hideOnSinglePage: true
    }
  }

  public componentDidMount () {
    this.scrollHeight = this.tableBox.current.offsetHeight
  }

  public changePage = (page: number) => {
    this.page = page
    this.searchList(this.chooseTask)
  }

  public receive = (data: any) => {
    Modal.confirm({
      title: '提示',
      content: `是否接收${data.title}`,
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        const res = await this.msgService.updateMsgStatus({
          id: data.id,
          status: 10
        })
        if (res.status === 0) {
          message.success('接收成功')
          this.searchList(this.chooseTask)
        } else {
          message.error(res.msg || '接受失败')
        }
      }
    })
  }

  public assign = (data: any) => {
    this.assignRef.initUsers(data.id)
    this.assignModal = true
  }

  public closeAssign = () => {
    this.assignModal = false
  }

  public onAssignRef = (ref: React.Component) => {
    this.assignRef = ref
  }

  public onFeedbackRef = (ref: React.Component) => {
    this.feedbackRef = ref
  }

  public onDetailRef = (ref: React.Component) => {
    this.detailRef = ref
  }

  public feedback = (data: any) => {
    this.feedbackRef.init(data)
    this.feedbackModal = true
  }

  public goDetail = (data: any) => {
    this.detailRef.initData(data.id)
    this.detailModal = true
  }

  public closeFeedback = () => {
    this.feedbackModal = false
  }

  public closeDetail = () => {
    this.detailModal = false
  }

  public finish = (data: any) => {
    Modal.confirm({
      title: '提示',
      content: `是否完成${data.title}`,
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        const res = await this.msgService.updateMsgStatus({
          id: data.id,
          status: 20
        })
        if (res.status === 0) {
          message.success('协作完成')
          this.searchList(this.chooseTask)
        } else {
          message.error(res.msg || '协作完成异常')
        }
      }
    })
  }

  public searchList = async (id: string) => {
    const resp: any = await this.msgService.getMsgList({
      id,
      page_no: this.page,
      page_size: this.pagination.pageSize
    })
    if (resp.status === 0) {
      this.msgList = resp.data.list
      this.total = resp.data.count
    }
  }

  public init = async () => {
    this.tableBox = React.createRef()
    this.tableConfig = [
      {
        title: '消息内容',
        key: 'title',
        render: (data: any) => (
          <div onClick={this.goDetail.bind(this, data)}>{data.title}</div>
        )
      },
      {
        width: 100,
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (data: any) => (
          <div>{Bean.MSG_STATUS[data]}</div>
        )
      },
      {
        width: 200,
        title: '操作',
        key: 'op',
        render: (data: any) => {
          switch (data.status) {
            case 0:
            default:
              return (
                <div className="op-box">
                  <Button onClick={this.receive.bind(this, data)} className="receive">接受</Button>
                  <Button onClick={this.assign.bind(this, data)} className="assign">派发</Button>
                </div>
              )
            case 10:
            case 11:
              return (
                <div className="op-box">
                  <Button onClick={this.feedback.bind(this, data)} className="feed">反馈</Button>
                  <Button onClick={this.finish.bind(this, data)} className="finish">完成</Button>
                </div>
              )
            case 30:
              return (
                <div className="op-box">
                  <Button disabled className="assign">已派发</Button>
                </div>
              )
            case 20:
              return (
                <div className="op-box">
                  <Button disabled className="finish">已完成</Button>
                </div>
              )
          }
        }
      }
    ]
    const res: any = await this.msgService.getTaskTree()
    if (res.status === 0) {
      this.taskList = res.data
      this.taskList.forEach((item: any) => {
        this.expandList = [...this.expandList, `${item.id}`]
      })
      const task: any = await new Promise((resolve: any) => {
        this.taskList.filter((item: any): boolean | void => {
          if (item.children && item.children.length > 0) {
            if (item.children[0]) {
              resolve(item.children[0])
              return true
            }
          }
        })
      })
      this.chooseTask = task.id
      this.searchList(this.chooseTask)
    }
  }

  public chooseMsg = async (item: any) => {
    if (this.chooseTask !== item.id) {
      this.chooseTask = item.id
      this.searchList(this.chooseTask)
    }
  }

  public render () {
    return (
      <div className="advance-main">
        <Assign
          onRef={this.onAssignRef}
          visible={this.assignModal}
          close={this.closeAssign}
          refresh={this.searchList.bind(this, this.chooseTask)}/>
        <FeedBack 
          visible={this.feedbackModal}
          close={this.closeFeedback}
          onRef={this.onFeedbackRef}
          refresh={this.searchList.bind(this, this.chooseTask)}/>
        <Detail
          visible={this.detailModal}
          close={this.closeDetail}
          onRef={this.onDetailRef}/>
        <div className="advance-con">
          <div className="con-left">
            <Collapse
              activeKey={this.expandList}
              onChange={(e: string[]) => this.expandList = e}>
              {
                this.taskList.map((item: any) => {
                  return (
                    <Collapse.Panel header={`${item.name}(${item.count})`}  key={`${item.id}`}>
                      <ul>
                        {
                          (item.children && item.children.length > 0) ? (
                            item.children.map((n: any) => {
                              return (
                                <li className={`${(this.chooseTask === n.id) ? ('selected') : ('')}`} onClick={this.chooseMsg.bind(this, n)} key={n.id}>{`${n.name}(${n.count})`}</li>
                              )
                            })
                          ) : ('')
                        }
                      </ul>
                    </Collapse.Panel>
                  )
                })
              }
            </Collapse>
          </div>
          <div ref={this.tableBox} className="con-right">
            <Table
              rowKey="id"
              bordered
              size="small"
              scroll={{
                x: false,
                y: this.scrollHeight
              }}
              pagination={{
                ...this.pagination,
                current: this.page,
                total: this.total
              }}
              columns={this.tableConfig}
              dataSource={this.msgList} />
          </div>
        </div>
      </div>
    )
  }
  
}

export default Advance