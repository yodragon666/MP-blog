import { request } from '../../../utils/request';

Page({
  data: {
    username: '',
    email: '',
    password: '',
    password1: '',
    isPasswordVisible1: false,
    isPasswordVisible2: false, 
  },
  // 切换可见性
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
  async handleNext() {
    const { username, email, password, password1 } = this.data;

    // 基础校验
    if (!username || !email || !password || !password1) {
      return wx.showToast({ title: '请填写完整', icon: 'none' });
    }
    // 手机号格式校验（和后端一致）
    if (!/^1[3-9]\d{9}$/.test(username)) {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    }
    // 邮箱基础校验
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
    }
    if (password.length < 6) {
      return wx.showToast({ title: '密码至少6位', icon: 'none' });
    }
    if (password !== password1) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    try 
    {
      // 调用你的注册接口，将信息存入临时注册表
      //请求返回正常，自动进res
      const res = await request({
        url: '/api/register/', 
        method: 'POST',
        data: { username, email, password,password1}
      });
      console.log('用户表提交成功：',res)
      // 跳转到第二步，把邮箱传过去
      wx.navigateTo({
        url: `/pages/login/register/register_step2?email=${email}`
      });
    } 
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  }
});