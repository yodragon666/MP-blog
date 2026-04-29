import { request } from '../../utils/request';
import { getUserIsCompleted,getUserIsGuest,logoutAction, } from '../../utils/auth'
import { getWXcode } from '../../utils/getWXcode'
import { updateUserGlobalInfo } from '../../utils/auth'

Page({
  data: {
    isLogin: false,
    userInfo: {},
    isReady: false, //是否可以渲染，
  },

  onShow() {
    this.checkLoginStatus();
    const app = getApp();
    app.updateUnreadCount(); // 每次切到这个 Tab，都强制刷一下红点
  },

  // 登录判断状态
  async checkLoginStatus() {
    const access = wx.getStorageSync('access');
    const minLoadingTime = 1000;
    const startTime = Date.now();

    const finishLoading = (data) => {
      const remainTime = minLoadingTime - (Date.now() - startTime);
      setTimeout(() => {
        this.setData({...data,isReady: true});
        // 如果登录成功，检查弹窗
        if (data.isLogin) this.checkModal();
      }, remainTime > 0 ? remainTime : 0);
    };
    if (!access) return finishLoading({isLogin: false,userInfo: {} });
    try {
      const res = await request({url: '/api/userprofile/',method: 'GET',});
      const data = res.data;
      console.log('获取个人信息返回:',res);
      console.table(data);
      updateUserGlobalInfo(data);
      finishLoading({
        isLogin: true,
        userInfo: res.data
      });

    } catch (err) {
      console.error("获取个人信息失败：", err);
      finishLoading({isLogin: false,userInfo: {}});
      if(err.msg || err) wx.showToast({title: err.msg || "状态异常",icon:"none"});
    }
  },

  //判断是否需要弹窗
  checkModal()
  {
    const is_completed = getUserIsCompleted();
    const is_guest = getUserIsGuest();
    const hasPrompted = wx.getStorageSync('hasPromptedComplete');
    const userInfo = this.data.userInfo


    //启动弹窗，未完成+是游客+没弹过
    if (!is_completed && is_guest && !hasPrompted)
    {
      wx.setStorageSync('hasPromptedComplete',true),

      wx.showModal({
        title:'提示',
        content:'您的信息尚未完善，请先完善资料',
        confirmText:'去完善',
        cancelText:'暂不',
        confirmColor:'#fa5151',
        success: (res) => 
        {
          if(res.confirm)
          {
            wx.navigateTo({
              url: '/pages/profile/completeprofile',
            })
          }
        },
      });
    }

    if (!is_completed && !is_guest && !hasPrompted)
    {
      wx.setStorageSync('hasPromptedComplete',true),

      wx.showModal({
        title:'提示',
        content:'您尚未绑定微信，是否绑定当前微信',
        confirmText:'绑定',
        cancelText:'暂不',
        confirmColor:'#fa5151',
        success: async (res) => {
          if( res.confirm ) {
            wx.showLoading({
              title: '正在绑定...',
              mask:true,
            });
            try{
              const code = await getWXcode();
              const res = await request({
                url: '/api/bind/',
                method: 'POST',
                data: { code }
              });

              wx.hideLoading();
              wx.showToast({
                title:res.msg,
                icon:'success'
              })

              wx.setStorageSync('is_guest',false);
              wx.setStorageSync('is_completed',true);

            } catch (err)
            {
              console.error("后端API错误：",err);
              wx.showToast({
                title:err.msg || "绑定失败",
                icon:"none"
              });
            }
          }
        }
      })
    }
  },



  // 退出登录
  handleLogout() 
  {
    wx.showModal({
      title:"提示",
      content:"确定要退出登录吗?",
      confirmColor:'#fa5151',
      success: async (res)=> 
      {
        if(res.confirm)
        {
          wx.showLoading ({title:'正在退出...',mask:true});

          const isLogoutSuccess = await logoutAction();

          this.setData({
            isLogin:false,
            userInfo:{}
          });

          wx.hideLoading();

          wx.showToast({
            title:isLogoutSuccess ? '已安全退出' : '退出成功过',
            icon:'success',
            duration:1500
          });
        }
      }
    });
  },
  //图片预览功能
  previewAvatar(e) {
    const currentUrl = e.currentTarget.dataset.src;
    if(!currentUrl) return;
    console.log("头像URL：", currentUrl),
    wx.previewImage({
      current:currentUrl,
      urls:[currentUrl],
      longPressActions:{
        itemList:['发送给朋友','保存图片','收藏'],
        success: function(data) {
        }
      }
    });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goToEditProfile() {
    wx.navigateTo({ url: '/pages/profile/editprofile/editprofile' });
  },

  goToSecurity() {
    wx.navigateTo({ url: "/pages/profile/profilesecurity/profilesecurity"});
  },
  goToUserProfile() {
    wx.navigateTo({ url: '/pages/profile/myprofile/myprofile' });
  },
  goToMyPosts() {
    wx.navigateTo({ url: '/pages/profile/myposts/myposts' });
  },
  goToMyMessages() {
    wx.navigateTo({ url: '/pages/profile/mymessages/mymessages' });
  },
  goToLikes() {
    wx.navigateTo({ url: '/pages/profile/mylike/mykile' });
  },
  goToFavorites() {
    wx.navigateTo({ url: '/pages/profile/myfavorite/myfavorite' });
  },
  goToSettings() {
    wx.navigateTo({ url: '/pages/profile/settings/settings' });
  }
});