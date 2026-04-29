Page({
  data: {
    userInfo: {
      image: '',
      nickname: '',
      birthday: '',
      address: '',
      gexing: '',
      desc: ''
    },
    genderRange: ['男', '女'],
    genderIndex: 0
  },
  data:{
    userInfo: {
      image:'',
      nickname:'',
      gender:'',
      birthday:'',
      address:'',
      gexing:'',
      desc:'',
    },
    genderRange: ['男','女'],
    genderIndex: 0,
  },
  onLoad() {
    const app = getApp();
    const userInfo = app.getUserInfo() || wx.getStorageSync('userInfo');
    if (userInfo) {
      let genderIndex = 0
      if (userInfo.gender === '女') genderIndex = 1
      else if (userInfo.gender === '男') genderIndex = 0
      this.setData({
        userInfo,
        genderIndex
      })
    }
  },

  // 跳转到编辑页面
  goToEdit() {
    wx.navigateTo({
      url: '/pages/profile/editprofile/editprofile' 
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
});