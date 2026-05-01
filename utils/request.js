//const BASE_URL = 'https://unegoistical-elongative-cecile.ngrok-free.dev'; 
//const BASE_URL = 'http://127.0.0.1:8000'; 
const BASE_URL = 'https://yodragon.cn'; 


let isRefreshing = false; //是否正在刷新token 
let requestsQueue = []; //等待队列 

// 统一退出逻辑 
function logoutAndRedirect() { 
  wx.removeStorageSync('access'); 
  wx.removeStorageSync('refresh'); 
  wx.showToast({ title: '登录已过期', icon: 'none' }); 
  setTimeout(() => { 
    wx.reLaunch({ url: '/pages/login/login' }); 
  }, 1000); 
} 

//刷新token 
const refreshToken = () => { 
  return new Promise((resolve,reject) => { 
    const refresh = wx.getStorageSync('refresh'); 
    if(!refresh){ 
      //没有refresh直接退出 
      logoutAndRedirect(); 
      return reject('缺失refreshtoken'); 
    } 
    wx.request ({ 
      url: BASE_URL + '/api/token/fresh/', 
      method: 'POST', 
      data: { refresh:refresh }, 
      success: (refreshRes) => { 
        const rdata = refreshRes.data 
        if(rdata.code !==200) { 
          logoutAndRedirect(); 
          return reject(rdata.msg); 
        } 
        const newAccess = refreshRes.data.data.access; 
        //存新token 
        wx.setStorageSync('access',newAccess); 
        resolve(newAccess); 
      }, 
      //请求没有成功 
      fail: (err) => { 
        logoutAndRedirect(); 
        reject(err); 
      } 
    }); 
  }); 
} 

//export const request = (options) => {},是js的模块导出语法，也就是定义一个函数request并且导出，其他的文件都可以用，通过import { request } from '../../utils/request'语句 
//option是发起request请求传的参数，比如url method data 
/*在本函数里面，经过该函数封装的请求，只有四种情况，对于后端业务来说，只有状态码为200，状态码为401，状态码为其他（对应success），或者网络层面失败（对应fail），前三者返回后端业务返回的数据，最后一个返回的是微信底层的错误对象，类似{errMsg: "request:fail", errno: undefined}*/ 
export const request = (options) => { 
  return new Promise((resolve, reject) => { 
    //读取token 
    const access = wx.getStorageSync('access'); 
    const refresh = wx.getStorageSync('refresh'); 
    //所有的requset都会走这里，先进行一层封装 
    wx.request({ 
      url: BASE_URL + options.url, 
      method: options.method || 'GET', 
      data: options.data || {}, 
      header: { 
        'Content-Type': 'application/json', 
        'ngrok-skip-browser-warning': 'true', 
        'Authorization': access ? `Bearer ${access}` : '' 
      }, 
      success: async (res) => { 
        const data = res.data; 
        //正常返回 
        if (res.statusCode === 200 && data.code === 200) { 
          console.log('请求地址：', BASE_URL + options.url); 
          //成功的流程，把res.data塞给resolve 
          resolve(data); 
          return; 
        } 
        //access过期 
        else if (res.statusCode === 401 && refresh) { 
          //如果已经在刷新，进入队列 
          if(isRefreshing) { 
            requestsQueue.push(() => { 
              request(options).then(resolve).catch(reject); 
            }); 
            return; 
          } 
          isRefreshing = true; 
          try{ 
            await refreshToken(); 
            //先执行队列里面的请求 
            requestsQueue.forEach(cb => cb()); 
            requestsQueue = []; 
            //再次重试当前请求 
            request(options).then(resolve).catch(reject); 
          }catch(err){ 
            reject(err) 
          }finally{ 
            isRefreshing = false; 
          } 
        } 
        //返回码不是200.也不是401，直接reject 
        else{ 
          reject(data); 
        } 
      }, 
      //请求失败了 
      fail: (err) => { 
        wx.showToast({ title: "网络异常", icon: 'none' }); 
        //把失败的数据塞给reject 
        reject(err); 
      } 
    }); 
  }); 
}; 

//处理上传文件的请求 
export const upload = (options) => { 
  return new Promise((resolve,reject) => { 
    const access = wx.getStorageSync('access'); 
    const refresh = wx.getStorageSync('refresh'); 
    wx.uploadFile({ 
      url:BASE_URL + options.url, 
      filePath: options.filePath, 
      name:options.name, 
      header:{ 
        'Authorization' : access ? `Bearer ${access}` : ' ', 
        'ngrok-skip-browser-warning': 'true', 
      }, 
      //这个res是微信服务器返回的完整对象， 
      success: async (res) => { 
        //把数据从微信服务器返回的完整对象里面拿出来 
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data; 
        //正常返回 
        if(res.statusCode === 200 || data.code === 200) resolve(data) 
        else if(res.statusCode === 401 && refresh) { 
          if(isRefreshing) { 
            //加入刷新队列 
            requestsQueue.push(() => upload(options).then(resolve).catch(reject)); 
          } 
          isRefreshing = true; 
          try{ 
            await refreshToken(); 
            requestsQueue.forEach(cb => cb()); 
            requestsQueue = []; 
            //重新执行当前上传 
            const retryRes = await upload(options); 
            resolve(retryRes); 
          } 
          //这里的err是refreshToken这个函数reject的东西， 
          catch(err) { 
            reject(err); 
          }finally{ 
            isRefreshing = false; 
          } 
        }else { 
          reject(data) 
        } 
      }, 
      //这个微信服务器的请求没有成功 
      fail:(err) => reject(err) 
    }); 
  }); 
}