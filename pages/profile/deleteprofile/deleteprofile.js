import { request } from '../../../utils/request';
import { clearUserStorage } from '../../../utils/auth'

Page({
  data: {
    email: '',
    code: '',
    countdown: 0
  },

  onLoad(options) {
    // 从上个页面传来的参数里拿到邮箱
    if (options.email) {
      this.setData({ email: options.email });
    }
  },

  // 发送验证码
  async sendCode() {
    try {
      await request({
        url: '/api/sendcode/', 
        method: 'POST',
        data: { email: this.data.email ,send_type:"delete"}
      });

      wx.showToast({ title: '验证码已发送', icon: 'success' });
      this.setData({ countdown: 60 });
      const timer = setInterval(() => {
        if (this.data.countdown > 0) {
          this.setData({ countdown: this.data.countdown - 1 });
        } else {
          clearInterval(timer);
        }
      }, 1000);
    } catch (err){
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  },

  // 最终注册：验证码验证并转正账号
  async handleFinalDelete() {
    if (!this.data.code) {
      return wx.showToast({ title: '请输入验证码', icon: 'none' });
    }

    try {
      const res = await request({
        url: '/api/deleteaccount/', // 对应你说的验证验证码的API
        method: 'POST',
        data: { 
          email: this.data.email, 
          code: this.data.code ,
        }
      });
      wx.showToast({ title: '注销成功', icon: 'success' });
      console.log('注销账号成功');
      //清理所有缓存
      clearUserStorage();
      const app = getApp();
      if(app.setUserInfo) app.setUserInfo(null);//清理全局
      setTimeout(() => {
        wx.reLaunch({
          url: `/pages/login/account_login`,
        });
      }, 800);
    }
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg ||err|| "注销失败",
        icon:"none"
      });
    }
  }
});