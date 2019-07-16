import * as React from 'react'
import {
  Button,
  Table,
  Modal,
  message
} from 'antd'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { CoopService } from 'src/services/coop'
import Util from 'src/utils'
import Bean from 'src/beans'
import AddCoop from './modals/add_coop'

@inject('coopService')
@observer
class Cooperate extends React.Component<{}, {}> {

  public coopService: CoopService
  public tableConfig: any[]
  public tableBox: React.RefObject<any>
  public addCoopRef: any
  public count: number

  @observable public page: number = 1
  @observable public total: number
  @observable public tableData: any[]
  @observable public scrollHeight: number
  @observable public pagination: any
  @observable public addCoopModal: boolean
  @observable public isDetail: boolean = false

  constructor (props: any) {
    super(props)
    this.tableBox = React.createRef()
    this.coopService = props.coopService
    this.addCoopModal = false
    this.pagination = {
      pageSize: 10,
      size: 'middle',
      onChange: this.changePage,
      hideOnSinglePage: true
    }
    this.initTable()
  }

  public componentDidMount () {
    this.scrollHeight = this.tableBox.current.offsetHeight
  }

  public changePage = (page: number) => {
    this.page = page
    this.searchData()
  }

  public openAddCoop = () => {
    this.addCoopRef.init()
    this.isDetail = false
    this.addCoopModal = true
  }

  public closeAddCoop = () => {
    this.addCoopModal = false
  }

  public searchData = async () => {
    this.tableData = []
    const res: any = await this.coopService.getCoopList({
      page_no: this.page,
      page_size: this.pagination.pageSize
    })
    if (res.status === 0) {
      this.tableData = res.data.data
      this.total = res.data.total_count
    }
  }

  public recive = (data: any) => {
    Modal.confirm({
      title: '提示',
      content: `是否接收${data.name}`,
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        const res = await this.coopService.receive({
          id: data.id
        })
        if (res.status === 0) {
          message.success('接收成功')
          this.searchData()
        } else {
          message.error(res.msg || '接受失败')
        }
      }
    })
  }

  public feed = async (data: any) => {
    await this.addCoopRef.init()
    await this.addCoopRef.feed(data.id)
    this.addCoopModal = true
  }
  public showFeed = (data: any) => {
    this.isDetail = false
    this.feed(data)
  }

  public showDetail = (data: any) => {
    this.isDetail = true
    this.feed(data)
  }
  public finish = (data: any) => {
    Modal.confirm({
      title: '提示',
      content: `是否完成${data.name}`,
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        const res = await this.coopService.finish({
          id: data.id
        })
        if (res.status === 0) {
          message.success('协作完成')
          this.searchData()
        } else {
          message.error(res.msg || '协作完成异常')
        }
      }
    })
  }

  public initTable = async () => {
    this.tableConfig = [
      {
        width: 200,
        title: '名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        width: 180,
        title: '发起时间',
        dataIndex: 'create_time',
        key: 'create_time',
        render: (data: any) => (
          <div>
            {Util.momentDate(data)}
          </div>
        )
      },
      {
        title: '协作内容',
        dataIndex: 'remarks',
        key: 'remarks'
      },
      {
        width: 80,
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (data: any) => (
          <div>
            {Bean.COOP_STATUS_MAP[data]}
          </div>
        )
      },
      {
        width: 160,
        title: '操作',
        key: 'op',
        render: (data: any, index: number) => {
          data.showJSBtn = false
          data.showWCBtn = false
          return (
            <div className="op-box">
              {
                (data.status === 0 && !data.is_owner) ? (
                  <Button className="receive" onClick={this.recive.bind(this, data)}>接收</Button>
                ) : ('')
              }
              {
                ((data.status === 2 || data.status === 1) && !data.is_owner) ? (
                  <Button className="feed" onClick={this.showFeed.bind(this, data)}>反馈</Button>
                ) : ('')
              }
              {
                ((data.status === 2 || data.status === 0 || data.status === 1) && data.is_owner) ? (
                  <Button className="finish" onClick={this.finish.bind(this, data)}>完成</Button>
                ) : ('')
              }
              {
                (data.status === 3) ? (
                  <Button disabled className="finish" type="primary">已完成</Button>
                ) : ('')
              }
               <Button className="receive" onClick={this.showDetail.bind(this, data)}>详情</Button>
            </div>
          )
        }
      }
    ]
    this.searchData()
  }

  public onRef = (ref: React.Component) => {
    this.addCoopRef = ref
  }

  public render () {
    return (
      <div className="cooperate-main">
        <AddCoop
          isDetail={this.isDetail}
          onRef={this.onRef}
          visible={this.addCoopModal}
          refersh={this.searchData}
          close={this.closeAddCoop} />
        <div className="cooperate-con">
          <div className="coo-header">
            <i></i>
            <span>派出所民警</span>
          </div>
          <div className="coo-body">
            <Button icon="plus" onClick={this.openAddCoop} type="primary">
              发起协作
            </Button>
            <div ref={this.tableBox} className="table-con">
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
                dataSource={this.tableData} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Cooperate