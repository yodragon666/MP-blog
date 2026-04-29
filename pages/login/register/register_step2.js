import { request } from '../../../utils/request';

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
        data: { email: this.data.email ,send_type:"register"}
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
    } 
    catch (err){
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  },

  // 最终注册：验证码验证并转正账号
  async handleFinalRegister() {
    if (!this.data.code) {
      return wx.showToast({ title: '请输入验证码', icon: 'none' });
    }

    try {
      const res = await request({
        url: '/api/verifycode/', // 对应你说的验证验证码的API
        method: 'POST',
        data: { 
          email: this.data.email, 
          code: this.data.code ,
          send_type:'register'
        }
      });
      console.log('注册成功：',res);
      wx.showToast({ title:res.msg, icon: 'success' });
      setTimeout(() => {
        // 注册并激活成功后，直接回到最初的登录页
        wx.reLaunch({
          url: `/pages/login/account_login?email=${this.data.email}`
        });
      }, 800);
      
    } 
    catch (err){
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  }
});