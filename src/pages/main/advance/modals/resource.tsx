import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Modal } from 'antd'
import { observable } from 'mobx';

interface ResourceProps {
  visible: boolean
  close: () => void
  onRef: (ref: React.Component) => void
}

@inject()
@observer
class Resource extends React.Component<ResourceProps, {}> {
  @observable public file_list: any = {
    '图片': [],
    '音频': [],
    '视频': []
  }
  constructor (props: any) {
    super(props)
  }

  public componentDidMount () {
    this.props.onRef(this)
  }

  public filterFileList = (file_list: any) => {
    const imglist: any[] = []
    const audiolist: any[] = []
    const videolist: any[] = []
    file_list = [...file_list]
    file_list.map((item: any) => {
      item = {...item}
      if (item.file_type === '1') {
        imglist.push(item.file_url)
      } else if (item.file_type === '2') {
        audiolist.push(item.file_url)
      } else if (item.file_type === '3') {
        videolist.push(item.file_url)
      }
    })
    this.file_list = {
      '图片': imglist,
      '音频': audiolist,
      '视频': videolist
    }
  }

  public render () {
    const {visible, close} = this.props
    return (
      <Modal 
        className="resourse-modal"
        title="查看资源"
        footer={null}
        visible={visible}
        onCancel={close}>
          {
            Object.keys(this.file_list).map((item: string) => (
              this.file_list[item].length > 0 ?
                <div>
                  <p>{item}</p>
                  {
                    item === '图片' ?
                    this.file_list[item].map((fileItem: any) => (
                      <img src={fileItem}/>
                    )) 
                    : item === '视频' ?
                    this.file_list[item].map((fileItem: any) => (
                      // @ts-ignore
                      <video controls="controls" autoplay="autoplay">
                        <source src={fileItem} />
                      </video>
                    ))
                    : item === '音频' ?
                    this.file_list[item].map((fileItem: any) => (
                      fileItem.substring(fileItem.length - 4) !== 'mp3' || fileItem.substring(fileItem.length - 4) !== 'ogg' ?
                      <a href={fileItem}>下载音频</a> :
                      // @ts-ignore
                      <audio controls="controls">
                        <source src={fileItem} type="audio/mp3" />
                        <source src={fileItem} type="audio/ogg" />
                        <embed height="100" width="100" src={fileItem} />
                      </audio>
                    )) : ''
                  }
                </div> : ''
            ))
          }
      </Modal>
    )
  }
}

export default Resource