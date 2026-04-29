import { request } from '../../../utils/request';
Page
({
  data:
  {
    email:'',
    code:'',
    isCounting: false,
    count:60,
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
  async sendCode() 
  {
    const { email ,code } = this.data;
    if(!email)
    {
      return wx.showToast({
        title:'请填写完整',
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
        url:'/api/sendcode/',
        method:'POST',
        data: {email:this.data.email,send_type:'forget'}
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
  async handleVerify()
  {
    const { email ,code } = this.data;
    if(!email || !code)
    {
      return wx.showToast({title:'请填写完整',icon:'none'})
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) 
    {
      return wx.showToast({title:'邮箱格式不正确',icon:'none'})
    }
    try
    {
      const res = await request({
        url:'/api/verifycode/',
        method:'POST',
        data:{
          email:this.data.email,
          code:this.data.code,
          send_type:'forget'
        },
      })
      wx.showToast({title:'验证成功',icon:'success'});
      wx.setStorageSync('reset_email', email);
      wx.setStorageSync('reset_token', res.reset_token);
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/forgetpwd/forgetpwd_step2',
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
  }
})

