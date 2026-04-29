export const requireLogin = (callback) => {
  const access = wx.getStorageSync('access')
  if(!access){
    wx.showToast({
      "title":'请先登录',
      'icon':'none'
    });
    setTimeout(() => {
      wx.navigateTo({
        'url':'/pages/login/login'
      });
    },800)
    return false;
  }
  //执行回调
  callback && callback()
  return true
}