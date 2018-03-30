import utils from 'UTILS/utils'

export default {
  //请求的接口，在请求的时候，如axios.get(url,config);这里的url会覆盖掉config中的url
 
  // 请求方法同上
  method: 'post', // 
  // 基础url前缀
  baseURL: '/mpost',　　
　　　　
//   transformRequest: [function (data) {
//     // 这里可以在发送请求之前对请求数据做处理
// 　　data = qs.stringify(data);
//     return data;
//   }],

  transformResponse: [function (data) {
    // 这里提前处理返回的数据
    return data;
  }],

  // 请求头信息
  headers: {
    // "Content-Type": 'application/x-www-form-urlencoded',
    "Mpost-bizId": '2001'
  },

  //parameter参数
  params: {
    cguid:utils.getCGUID()
  },

  //post参数，使用axios.post(url,{},config);如果没有额外的也必须要用一个空对象，否则会报错
  data: {  
  },

  //设置超时时间
  timeout: 60000,
  //返回数据类型
  responseType: 'json', // default 
}