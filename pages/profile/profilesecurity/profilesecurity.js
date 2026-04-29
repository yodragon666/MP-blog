import { getWXcode } from "../../../utils/getWXcode";
import { request } from '../../../utils/request'
Page({
  data: {
    userInfo:{},
    is_guest:false,
    is_completed:false,
    //这里用来存放脱敏数据
    displayUserInfo:{
      username:'',
      email:'',
    },
  },
  //处理脱敏数据逻辑,返回字符串
  maskInfo(type,str) {
    if(!str) return "未绑定";
    if(type === 'username')
    {
      //中间四位变*
      if(str.length < 5) return str;
      const start = Math.floor((str.length - 4)/2);
      return str.substring(0,start) + "****" + str.substring(start + 4);
    };
    if(type === 'email')
    {
      const[name,domain] = str.split("@");
      if(!domain) return str; //不是标准邮箱
      if(name.length <= 5) {
        return '*****@' + domain;
      }
      return name.substring(0,name.length - 5) + "*****@" + domain;
    }
    return str;
    
  },
  onShow()
  {
    //确保每次进入都是最新用户信息
    this.loadUserData();
    //页面进入自动检查一次是否补全信息
    this.checkCompleteProfilePrompt();
  },
  //补全信息弹窗
  checkCompleteProfilePrompt(){
    const is_completed = this.data.is_completed;
    const is_guest = this.data.is_guest;
    const hasPrompted = !wx.getStorageSync('hasPromptedComplete');
    //启动弹窗
    if (!is_completed && is_guest && !hasPrompted)
    {
      wx.setStorageSync('hasPromptedComplete',true);
      wx.showModal({
        title: '提示',
        content: '您的信息尚未完善，请先完善资料',
        confirmText: '去完善',
        cancelText: '暂不',
        confirmColor: '#fa5151',
        success: (res) => {
          if (res.confirm) {
            this.goToCompleteProfile();
          }
        },
      });
    }
  },
  //拦截守卫
  checkAccess(){
    if(!this.data.is_completed && this.data.is_guest )
    {
      wx.showModal({
        title:'权限受限',
        content:'请先完善个人信息',
        confirmText:'去完善',
        confirmColor:'#fa5151',
        success: (res) => {
          if(res.confirm){
            this.goToCompleteProfile();
          }
        }
      });
      return false;
    }
    return true;
  },

  //读取用户的数据 
  loadUserData() {
    //优先本地缓存读取
    const userInfo = wx.getStorageSync('userInfo');
    const is_guest = wx.getStorageSync('is_guest');
    const is_completed = wx.getStorageSync('is_completed');

    //如果缓存没有，全局APP读取
    if(!userInfo)
    {
      const app = getApp();
      userInfo = app.getUserInfo() ? app.getUserInfo() : {};
    }
    //执行脱敏操作
    if(userInfo)
    {
      this.setData({
        userInfo:userInfo,
        is_guest:is_guest,
        is_completed:is_completed,
        displayUserInfo:{
          username:this.maskInfo('username',userInfo.username),
          email:this.maskInfo('email',userInfo.email),
        }
      });
    }
  },
  //处理绑定微信
  async handleBindWechat()
  {
    wx.showModal({
      title:"提示",
      content:"是否要绑定当前微信?",
      confirmColor:'#fa5151',//确认按钮为红色
      success: async (res) => 
      {
        if(res.confirm)
        {
          wx.showLoading({
            title:'正在绑定...',
            mask:true,
          })

          try{
            //获取code
            const code = await getWXcode();
            //请求后端绑定接口
            const res = await request({
              url: '/api/bind/',
              method: 'POST',
              data: {
                code:code,
              }
            });
            //绑定成功
            wx.hideLoading();
            wx.showToast({
              title:res.msg,
              icon:'success'
            })
            console.log('绑定成功返回：',res)
            //修改缓存
            wx.setStorageSync('is_guest',false);
            wx.setStorageSync('is_completed',true);
            this.loadUserData();
            
          }
          catch (err)
          {
            console.error("后端API错误：",err);
            wx.showToast({
              title:err.msg ||err|| "绑定失败",
              icon:"none"
            });
          }
        }
      }
    });
  },
  //处理解除绑定微信
  async handleUnbindWechat()
  {
    wx.showModal({
      title:"提示",
      content:"是否要解绑当前微信?",
      confirmColor:'#fa5151',//确认按钮为红色
      success: async (res) => 
      {
        if(res.confirm)
        {
          wx.showLoading({
            title:'正在解绑...',
            mask:true,
          })

          try{
            const res = await request({
              url: '/api/unbind/',
              method: 'POST',

            });
            console.log('解绑成功返回：',res)
            //解除成功
            wx.hideLoading();
            wx.showToast({
              title:res.msg,
              icon:'success'
            })
            //修改缓存
            wx.setStorageSync('is_guest',false);
            wx.setStorageSync('is_completed',false);
            this.loadUserData();
            
          }
          catch (err)
          {
            console.error("后端API错误：",err);
            wx.showToast({
              title:err.msg ||err|| "解绑失败",
              icon:"none"
            });
          }
        }
      }
    });
  },
  //点击去补全
  async goToCompleteProfile(){
    wx.navigateTo({
      url:'/pages/profile/completeprofile'
    })
  },
  //点击修改账号
  async goToChangeAccount()
  {
    if(!this.checkAccess()) return;
    
  },
  //点击去修改邮箱
  async goToChangeEmail()
  {
    if(!this.checkAccess()) return;
    wx.navigateTo({
      url:'/pages/profile/changeemail/changeemail_step1'
    })
  },
  //点击去修改密码
  async goToChangePassword()
  {
    if(!this.checkAccess()) return;
    wx.navigateTo({
      url:'/pages/profile/changepassword/changepassword'
    });
  },
  //注销微信
  async handleDeleteAccount()
  {
    if(!this.checkAccess()) return;
    const userInfo = this.data.userInfo
    wx.showModal({
      title:"提示",
      content:"您确定要注销当前账号?",
      confirmColor:'#fa5151',//确认按钮为红色
      success: async (res) => 
      {
        if(res.confirm)
        {
          wx.navigateTo({
            url: `/pages/profile/deleteprofile/deleteprofile?email=${userInfo.email}`
          })
        }
      }
    });
  }
})