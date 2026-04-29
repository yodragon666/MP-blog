// pages/profile/hasaccount.js
import { request } from '../../utils/request'
Page({
  data:
  {
    account:'',
    password:'',
    isPasswordVisible:false,
  },
  //切换显示隐藏密码
  togglePasswordVisible() {
    this.setData({
      isPasswordVisible: !this.data.isPasswordVisible
    });
  },
  onAccountInput(e){
    this.setData({
      account:e.detail.value
    })
  },
  onPasswordInput(e){
    this.setData({
      password:e.detail.value
    })
  },
  async handleMerge()
  {
    const { account,password } = this.data;
    if(!account || !password)
    {
      return wx.showToast({title:'请填写完整',icon:'none'})
    }

    try
    {
      const res = await request({
        url:'/api/mergeaccount/',
        method:'POST',
        data:{
          account,
          password,
        },
      })
      const data = res.data;
      console.log('账号已合并：', res);
      console.table(data);
      //更换token，更换身份
      wx.setStorageSync('access', data.access);
      wx.setStorageSync('refresh', data.refresh);
      wx.setStorageSync('user_id', data.user_id);
      wx.setStorageSync('is_guest', false);
      wx.setStorageSync('is_completed', true);
      wx.setStorageSync('hasPromptedComplete',true);

      wx.showToast({
        title: '绑定成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }, 500);

    }
    catch(err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  }, 
  goToForgetPwd(){
    wx.navigateTo({
      url:'/pages/login/forgetpwd/forgetpwd_step1'
    })
  },
  goToLogin(){
    wx.navigateTo({
      url:'/pages/login/register/register_step1'
    })
  }
})