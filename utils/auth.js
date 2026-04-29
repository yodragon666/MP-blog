import {request} from './request';

//登录成功处理
  export async function handleLoginSuccess(data)
  {
    //存token
    wx.setStorageSync('access',data.access);
    wx.setStorageSync('refresh',data.refresh);
    wx.setStorageSync('user_id',data.user_id);
    //未弹过窗
    wx.setStorageSync('hasPromptedComplete',false);
    //获取用户状态
    try{
      const res = await request({
        url:'/api/getuserstatus/',
        method:'GET',
      });
      wx.setStorageSync('is_completed',res.data.is_completed);
      wx.setStorageSync('is_guest',res.data.is_guest);
      console.log('获取状态返回：', res);
      console.table(res.data);
    }
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg ||err|| "获取状态失败",
        icon:"none"
      });
    }
  }


//返回是否填写完成
  export function getUserIsCompleted(){
    return wx.getStorageSync('is_completed');
  }


//返回是否是游客
  export function getUserIsGuest(){
    return wx.getStorageSync('is_guest');
  }

/**
 * 纯粹清理本地所有用户相关的storage
 */
  export const clearUserStorage = () => {
    const keys = [
      'access',
      'refresh',
      'user_id',
      'is_completed',
      'is_guest',
      'hasPromptedComplete',
      'userInfo'
    ];
    keys.forEach(key => wx.removeStorageSync(key));
    console.log('本地缓存已清理')
  }
/**
 * 退出登录逻辑封装，通知后端，清理缓存，更新状态
 */
  export const logoutAction = async () => {
    const refresh = wx.getStorageSync('refresh');
    let isLogoutSuccess = true ;//标记后端是否处理成功
    if(refresh)
    {
      //调用登录接口
      try {
        const res = await request({
          url:'/api/logout/',
          method:'POST',
          data:{
            refresh_token:refresh
          },
        });
        console.log('数据清理成功：',res)
      }catch (err)
      {
        console.log('后退API错误,已清理数据并退出',err)
        isLogoutSuccess = false;
      }
    }
      //清理本地
      clearUserStorage();
      //清理全局
      const app = getApp();
      //if判断，防止app没加载完导致崩溃
      if(app.setUserInfo) app.setUserInfo(null);
      //返回成功标记
      return isLogoutSuccess;
  }
/**
 * 同一更新用户全局信息
 */
  export const updateUserGlobalInfo = (userinfo) => {
    if(!userinfo) return;
    //更新全局实例
    const app = getApp()
    if (app){
      app.setUserInfo(userinfo)
    }
    //更新本地缓存
    wx.setStorageSync('userInfo',userinfo)
    console.log('-------全局信息已更新-------')
  }