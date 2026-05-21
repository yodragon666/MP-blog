// pages/profile/changeemail/changeemail_step2.js
import { request } from '../../../utils/request'

Page({
  data: {
    verify_token: '',
    newemail: '', // 保持全小写
    newcode: '',  // 保持全小写
    countdown: 0,
  },

  onLoad() {
    const verify_token = wx.getStorageSync('verify_token');
    this.setData({
      verify_token: verify_token,
    })
  },

  // 输入监听
  onNewEmailInput(e) {
    this.setData({ newemail: e.detail.value });
  },

  onNewCodeInput(e) {
    this.setData({ newcode: e.detail.value });
  },

  // 给新邮箱发送验证码
  async sendNewCode() {
    const { newemail, verify_token, countdown } = this.data;
    
    // 拦截正在倒计时的情况
    if (countdown > 0) return;
    
    if (!newemail) {
      return wx.showToast({ title: '请输入邮箱', icon: 'none' });
    }
    
    // 修复变量名：使用全小写的 newemail
    if (!/^\S+@\S+\.\S+$/.test(newemail)) {
      return wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
    }

    try {
      await request({
        url: '/api/send_new_email/', 
        method: 'POST',
        data: { 
          email: newemail,
          verify_token: verify_token,
        }
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
    } 
    catch (err) {
      console.error("后端API错误：", err);
      wx.showToast({
        title: err.msg || "请求失败",
        icon: "none"
      })
    }
  },

  // 处理确认修改按钮
  async handleSubmit() {
    const { newcode, newemail, verify_token } = this.data;

    if (!newcode || !newemail) {
      return wx.showToast({ title: '请输入完整信息', icon: 'none' });
    }
    try {
      await request({
        url: '/api/change_email/', 
        method: 'POST',
        data: { 
          email: newemail, 
          code: newcode,
          verify_token: verify_token
        }
      });

      // 更新缓存
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.email = newemail;
      wx.setStorageSync('userInfo', userInfo);
      wx.removeStorageSync('verify_token');

      // 更新全局APP
      const app = getApp();
      if (app && typeof app.setUserInfo === 'function') {
        app.setUserInfo(userInfo);
      }

      wx.showToast({ title: '修改成功', icon: 'success' });
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profilesecurity/profilesecurity'
        });
      }, 800);
    } 
    catch (err) {
      console.error("后端API错误：", err);
      wx.showToast({
        title: err.msg || "请求失败",
        icon: "none"
      })
    }
  }
})