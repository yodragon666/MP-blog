// pages/profile/changeemail/changeemail_step1.js
import { request } from '../../../utils/request'
Page({
  data: {
    email:'',
    code:'',
    countdown:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    //从全局获取信息
    const app = getApp();
    const userInfo = app.getUserInfo();
    if(userInfo)
    {
      this.setData({
        email:userInfo.email
      });
    }
    else
    {
      const userInfo = wx.getStorageSync('userInfo');
      this.setData({
        email:userInfo.email,
      })
    }
  },
  //输入验证码
  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },
  // 发送验证码
  async sendCode() {
    if (this.data.countdown > 0) return;
    try {
      await request({
        url: '/api/send_old_email/', 
        method: 'POST',
        data: { send_type:"change_email_old"}
      });

      wx.showToast({ title: '验证码已发送', icon: 'success' });

       // 开启倒计时
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
  //点击下一步
  async handleVerify()
  {
    try
    {
      const code = this.data.code;
      const res = await request({
        url: '/api/verify_old_email/', 
        method: 'POST',
        data: { code:code}
      });
      const verify_token = res.verify_token;
      //存验证token
      wx.setStorageSync('verify_token',verify_token);
      //弹窗提示成功
      wx.showToast({ title:'验证通过', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/profile/changeemail/changeemail_step2',
        });
      },500);
    }
    catch (err){
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  },
  
})