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

  public static DEP_SEL_LIST = [
    {
      name: '分局协作作战中心',
      value: '分局协作作战中心'
    },
    {
      name: '市局大数据中心',
      value: '市局大数据中心'
    }
  ] 
  
  public static BDP_ORIGIN = 'http://10.73.92.144'
}
