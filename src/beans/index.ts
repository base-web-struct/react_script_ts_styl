export default class Bean {

  public static COOP_STATUS_MAP = {
    0: '发起',
    1: '已接收', 
    2: '已反馈',
    3: '已完成'
  }

  public static MSG_STATUS = {
    0: '未处理',
    10: '处理中',
    30: '已派发',
    20: '已完成',
    11: '已反馈'
  }
  public static BDP_ORIGIN = 'http://10.73.92.144'

  public static DEP_SEL_LIST = [
    {
      name: '分局合成作战中心',
      value: '分局合成作战中心'
    },
    {
      name: '武汉市公安局',
      value: '武汉市公安局'
    }
  ] 

  public static TASK_TYPE_MAP = {
    0: '智能任务',
    1: '自建任务',
    2: '系统对接任务',
  }

  public static FH_MAP_URL = 'http://60.32.1.3/hero/community/index.html?policeNo=032604'
  // public static FH_MAP_URL = 'http://10.73.129.213:8888/hero/community/index.html?policeNo=032604'
}
