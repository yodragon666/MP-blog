import { request } from '../../../utils/request';

Page({
  data: {
    password: '',
    password1: '',
    email: '',
    reset_token: '',
    isPasswordVisible1: false,
    isPasswordVisible2: false 
  },

  onLoad() 
  {
    // 从 storage 取
    const email = wx.getStorageSync('reset_email');
    const reset_token = wx.getStorageSync('reset_token');

    this.setData({
      email,
      reset_token
    });
  },
  //切换显示隐藏密码
  togglePasswordVisible1() {
    this.setData({
      isPasswordVisible1: !this.data.isPasswordVisible1
    });
  },
  togglePasswordVisible2() {
    this.setData({
      isPasswordVisible2: !this.data.isPasswordVisible2
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  onPassword1Input(e) {
    this.setData({
      password1: e.detail.value
    });
  },

  async handleReset() {
    const { password, password1, email, reset_token } = this.data;

    //判空
    if (!password || !password1) {
      return wx.showToast({
        title: '请填写完整',
        icon: 'none'
      });
    }

    // 两次密码一致
    if (password !== password1) {
      return wx.showToast({
        title: '密码不一致',
        icon: 'none'
      });
    }

    // 密码强度
    if (password.length < 6) {
      return wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
    }

    try {
      const res = await request
      ({
        url: '/resetpwd/',
        method: 'POST',
        data: {
          email,
          reset_token,
          new_password: password,
          new_password1: password1,
        }
      });

      wx.showToast({
        title: '修改成功',
        icon: 'success'
      });

      wx.removeStorageSync('reset_email');
      wx.removeStorageSync('reset_token');

      setTimeout(() => {
        wx.reLaunch({
          url: `/pages/login/account_login?email=${this.data.email}`
        });
      }, 800);

    }
    catch(err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  }
});