// pages/profile/completeprofile.js
import { request } from '../../utils/request'
Page({
  data:
  {
    email:'',
    code:'',
    username:'',
    password:'',
    password1:'',
    isCounting: false,
    count:60,
    //控制眼睛状态
    isPwdVisible1:false,
    isPwdVisible2:false,
  },
  onUsernameInput(e){
    this.setData({
      username:e.detail.value
    })
  },
  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  },
  onPasswordInput(e){
    this.setData({
      password:e.detail.value
    })
  },
  onPassword1Input(e){
    this.setData({
      password1:e.detail.value
    })
  },
  // --- 切换密码可见性 ---
  togglePwdVisible1() {
    this.setData({ isPwdVisible1: !this.data.isPwdVisible1 });
  },
  togglePwdVisible2() {
    this.setData({ isPwdVisible2: !this.data.isPwdVisible2 });
  },
  async sendCode() 
  {
    const { email  } = this.data;
    if(!email)
    {
      return wx.showToast({
        title:'请输入邮箱',
        icon:'none'
      })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) 
    {
      return wx.showToast({
        title:'邮箱格式不正确',
        icon:'none'
      })
    }
    try 
    {
      await request({
        url:'/api/sendcompleteprofilecode/',
        method:'POST',
        data: {email:this.data.email}
      });
      wx.showToast({title:'验证码已发送',icon:'none'})
      this.setData({ 
        isCounting: true, 
        count: 60 
      });
      let remainTime = 60; // 定义一个局部变量，它是同步的，不归 setData 管
      const timer = setInterval(() => {
        remainTime--; // 每一秒减 1，非常准确
        if (remainTime > 0) {
          this.setData({ count: remainTime });
        } else {
          clearInterval(timer);
          this.setData({
            isCounting: false,
            count: 60
          });
        }
      }, 1000);
    }
    catch (err)
    {
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      });
    };
  },
  async handleComplete()
  {
    const { email ,code,password,password1,username } = this.data;
    if(!email || !code || !password || !password1 || !username)
    {
      return wx.showToast({title:'请填写完整',icon:'none'})
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) 
    {
      return wx.showToast({title:'邮箱格式不正确',icon:'none'})
    }
    if (!/^1[3-9]\d{9}$/.test(username))
    {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    }
    if (password !== password1)
    {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }
    try
    {
      const res = await request({
        url:'/api/completeprofile/',
        method:'POST',
        data:{
          email,
          code,
          password,
          password1,
          username,
        },
      })
      wx.showToast({title:'信息已补全',icon:'success'});
      wx.setStorageSync('is_guest', false);
      wx.setStorageSync('is_completed', true);
      wx.setStorageSync('hasPromptedComplete',true);
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile',
        });
      },500);

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

  goToBindAccount() {
    wx.navigateTo({
      url: '/pages/profile/hasaccount'
    });
  },
})