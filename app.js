import { request } from './utils/request';
App({
  globalData: {
    userInfo: null,
    keyword:'',
    unreadCount: 0

  },
  setUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  },
  getUserInfo(){
    return this.globalData.userInfo;
  },
  // 封装成全局方法
  async updateUnreadCount() {
    const token = wx.getStorageSync('access');
    if (!token) return;

    try {
      // 注意：这里的 request 必须是封装好的、能自动处理 token 的
      const res = await request({ url: '/api_blog/unreadcount/' });
      const count = res.unread_count || 0;
      
      this.globalData.unreadCount = count;

      if (count > 0) {
        wx.setTabBarBadge({
          index: 0, // 你的“消息”或“首页”所在的 Tab 索引
          text: count > 99 ? '99+' : count.toString()
        });
      } else {
        wx.removeTabBarBadge({ index: 0 });
      }
    } catch (err) {
      console.error("全局未读数获取失败", err);
    }
  }
})