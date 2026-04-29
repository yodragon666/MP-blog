import { request } from '../../../utils/request'
import { updateUserGlobalInfo } from '../../../utils/auth'
import { upload } from '../../../utils/request'
Page({
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
    avatarChanged: false, //头像是否更改
    avatarFilePath: '', //存更改后的头像的本地路径
    is_guest:'',
    is_completed:'',
  },
  onLoad() {
    const app = getApp();
    const userInfo = app.getUserInfo() || wx.getStorageSync('userInfo');
    const is_guest = wx.getStorageSync('is_guest')
    const is_completed = wx.getStorageSync('is_completed')
    if (userInfo) 
    {
      let genderIndex = 0
      if (userInfo.gender === '女') genderIndex = 1
      else if (userInfo.gender === '男') genderIndex = 0
      this.setData({
        userInfo,
        genderIndex,
        is_guest,
        is_completed,
      })
    }
  },
  //手动选择头像
  // 手动选择头像（拍照或相册）
onChooseImageManual() {
  wx.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'], // 关键：同时支持相册和拍照
    success: (res) => {
      const filepath = res.tempFiles[0].tempFilePath;
      // 复用你的预览逻辑
      this.setData({
        'userInfo.image': filepath,
        avatarChanged: true,
        avatarFilePath: filepath,
      });
    }
  })
},
  //微信头像选择接口
  onChooseAvatar(e) {
    const filepath = e.detail.avatarUrl;
    //本地预览
    this.setData({
      'userInfo.image':filepath,
      avatarChanged: true,
      avatarFilePath:filepath,
    })
  },
  //绑定信息
  onNicknameInput(e) { this.setData({ 'userInfo.nickname' : e.detail.value}) },
  onGenderChange(e) { 
    const index = e.detail.value
    const genderMap = ['male','female']
    this.setData({ 
      genderIndex: index,
      'userInfo.gender': genderMap[index]
    }) 
  },
  onBirthdayChange(e) { this.setData({ 'userInfo.birthday': e.detail.value }) },
  onAddressInput(e) { this.setData({ 'userInfo.address': e.detail.value }) },
  onGexingInput(e) { this.setData({ 'userInfo.gexing': e.detail.value }) },
  onDescInput(e) { this.setData({ 'userInfo.desc': e.detail.value }) },
  //上传头像，如果头像更改就这样处理
  uploadAvatar(filePath){
    return upload ({
      url:'/api/upload_avatar/',
      filePath:filePath,
      name:'image',
    })
  
  },
  //保存信息函数
  async onSave() {
    try{
      wx.showLoading({ title:"保存中...",mask:true })
      let imageurl = this.data.userInfo.image
      //如果头像更改了，先上传头像
      if(this.data.avatarChanged){
        const uploadRes = await this.uploadAvatar(this.data.avatarFilePath)
        if(uploadRes.code !== 200) throw new Error (uploadRes.msg)
        imageurl = uploadRes.image
        console.log('头像上传成功：',imageurl)
      }
      //上传其余信息
      const res = await request({
        url: '/api/userprofile/',
        method:'PUT',
        data:{
          nike_name:this.data.userInfo.nickname,
          gender:this.data.userInfo.gender === '女' || this.data.userInfo.gender === 'female' ? 'female' : 'male',
          birthday:this.data.userInfo.birthday||null,
          address:this.data.userInfo.address,
          gexing:this.data.userInfo.gexing,
          desc:this.data.userInfo.desc,
        }
      })
      wx.hideLoading();
      wx.showToast({title:'保存成功',icon:'success'})
      console.log('信息保存成功')
      console.table(this.data.userInfo)
      const newUserInfo = {
        ...this.data.userInfo,
        image:imageurl
      }
      updateUserGlobalInfo(newUserInfo)
      this.setData({
        userInfo: newUserInfo,
        avatarChanged: false
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }, 500);
    }catch(err){
      console.error("后端API错误：",err);
      wx.showToast({
        title:err.msg || "请求失败",
        icon:"none"
      })
    }
  }
})