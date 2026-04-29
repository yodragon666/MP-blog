import { request } from '../../../utils/request'
import { clearUserStorage } from '../../../utils/auth'

Page({
  data: {
    email: '',         // 邮箱
    code: '',          // 验证码
    newpwd: '',        // 新密码
    confirmpwd: '',    // 确认密码
    countdown: 0,
    isPwdVisible1: false,
    isPwdVisible2: false
  },

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
 
  // 输入监听
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onNewPwdInput(e) { this.setData({ newpwd: e.detail.value }); },
  onConfirmPwdInput(e) { this.setData({ confirmpwd: e.detail.value }); },

  // 切换第一个密码可见性
  togglePwdVisible1() {
    this.setData({ isPwdVisible1: !this.data.isPwdVisible1 });
  },

  // 切换第二个密码可见性
  togglePwdVisible2() {
    this.setData({ isPwdVisible2: !this.data.isPwdVisible2 });
  },

  // 发送验证码
  async sendCode() {
    if (this.data.countdown > 0) return;
    try {
      await request({
        url: '/api/send_old_email/', // 你的后端接口
        method: 'POST',
        data: { email: this.data.email,send_type:'change_pwd'}
      });
      wx.showToast({ title: '验证码已发送', icon: 'success' });
      this.setData({ countdown: 60 });
      this.timer = setInterval(() => {
        if (this.data.countdown > 0) {
          this.setData({ countdown: this.data.countdown - 1 });
        } else {
          clearInterval(this.timer);
        }
      }, 1000);
    } 
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  },

  // 提交修改
  async handleSubmit() {
    const { code, newpwd, confirmpwd,email} = this.data;

    if (!code || !newpwd || !confirmpwd)
    {
      return wx.showToast({ title: '请填写完整信息', icon: 'none' });
    }

    if (newpwd !== confirmpwd) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    if (newpwd.length < 6) {
      return wx.showToast({ title: '密码长度至少6位', icon: 'none' });
    }

    try {
      await request({
        url: '/api/changepwd/', // 你的后端接口
        method: 'POST',
        data: {
          email: email,
          code: code,
          new_password: newpwd,
          new_password1:confirmpwd,
        }
      });

      //修改缓存
      clearUserStorage(); 
      const app = getApp();
      if (app.setUserInfo) app.setUserInfo(null);
      console.log('修改密码成功');
      // 修改成功后通常需要重新登录或返回个人中心
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/login/account_login?email=${this.data.email}`
        })
      }, 1000);
    } 
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  }
});