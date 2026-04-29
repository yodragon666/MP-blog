import { request } from '../../utils/request';
import { handleLoginSuccess } from '../../utils/auth'
import { getWXcode } from '../../utils/getWXcode'
Page({
  data: {
    isAgree: false,
  },

  toggleAgreement() {
    this.setData({ isAgree: !this.data.isAgree });
  },
  goToLegal(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/profile/settings/legal/legal?type=${type}` 
    });
  },
  goToAccountLogin() {
    if (!this.data.isAgree) {
      return wx.showToast({
        title: '请先勾选用户协议',
        icon: 'none'
      });
    }

    wx.navigateTo({
      url: '/pages/login/account_login'
    });
  },

  async handleWechatLogin() {
    if (!this.data.isAgree) {
      return wx.showToast({
        title: '请先勾选用户协议',
        icon: 'none'
      });
    }

    this.setData({ isLoading: true });

    try 
    {

      const code = await getWXcode();
      const res = await request({
        url: '/api/WXlogin/',
        method: 'POST',
        data: { code }
      });

      console.log('登录成功返回：', res);
      const data = res.data;
      console.table(data);

      await handleLoginSuccess(data);
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }, 500);
      

    } 
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg ||err|| "登录失败",
        icon:"none"
      });
    }

  }
});