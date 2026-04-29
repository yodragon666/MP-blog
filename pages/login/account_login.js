import { request } from '../../utils/request';
import { handleLoginSuccess } from '../../utils/auth'

Page({
  data: {
    account: '',
    password: '',
    isPasswordVisible: false 
  },
  onLoad(options) {
    if (options.email) {
      this.setData({
        account: options.email
      });
    }
  },
  //切换显示隐藏密码
  togglePasswordVisible() {
    this.setData({
      isPasswordVisible: !this.data.isPasswordVisible
    });
  },
  onAccountInput(e) {
    this.setData({
      account: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/login/register/register_step1'
    });
  },

  goToForgetPwd() {
    wx.navigateTo({
      url: '/pages/login/forgetpwd/forgetpwd_step1'
    });
  },

  async handleLogin() {
    const { account, password } = this.data;

    if (!account || !password) {
      return wx.showToast({
        title: '请填写完整',
        icon: 'none'
      });
    }

    try 
    {
      const res = await request({
        url: '/api/login/',
        method: 'POST',
        data: { account, password }
      });

      console.log('登录返回：', res);
      const data = res.data;
      console.table(data);

      await handleLoginSuccess(data);
      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });
      //由于account_login不是tabBar页面，跳转的时候会先返回到tabBar根路径，在转换到profile，所以会闪一下，使用reLaunch比较丝滑
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      },500);

    }
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "登录失败",
        icon:"none"
      })
    }
  }
});