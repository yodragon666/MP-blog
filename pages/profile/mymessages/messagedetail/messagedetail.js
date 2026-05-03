import { request } from '../../../../utils/request';

Page({
  data: {
    msg: null,
    typeMap: {
      'system': '系统通知',
      'post': '审核通知',
      'like': '点赞通知',
      'favorite': '收藏通知',
      'account': '账号安全'
    }
  },

  onLoad(options) {
    if (options.data) {
      // 解析上一个页面传过来的数据
      const msgData = JSON.parse(decodeURIComponent(options.data));
      
      // 因为点击进来的瞬间列表页已经触发了已读接口，所以这里为了体验直接展示为已读
      msgData.is_read = true; 
      
      this.setData({ msg: msgData });
    }
  },

  // 跳转到文章详情
  goToPost() {
    const postId = this.data.msg.post_id;
    if (postId) {
      wx.navigateTo({ 
        url: `/pages/postdetail/postdetail?id=${postId}` 
      });
    }
  },
  // 预览头像
  previewAvatar() {
    let avatarUrl = this.data.msg.actor_avatar;
    
    // 如果没有头像或者是默认本地路径，根据实际需求决定是否开启预览
    // 一般来说，点击系统默认头像没必要放大，可以加个判断
    if (!avatarUrl) {
      avatarUrl = 'https://yodragon.cn/media/images/system-avatar.png';
    }
    wx.previewImage({
      current: avatarUrl, // 当前显示图片的http链接
      urls: [avatarUrl]   // 需要预览的图片http链接列表
    });
  },

  // 删除该条消息
  async handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，是否继续？',
      confirmColor: '#EA4335',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            await request({
              url: '/api_blog/notificationsdelete',
              method: 'POST',
              data: { ids: [this.data.msg.id] }
            });
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });

            // 核心逻辑：通知上一页（列表页）把这条数据删掉，防止返回后数据还在
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2]; // 获取上一页实例
            if (prevPage) {
              const newList = prevPage.data.postList.filter(item => item.id !== this.data.msg.id);
              prevPage.setData({
                postList: newList,
                total: Math.max(0, prevPage.data.total - 1)
              });
            }

            // 延迟返回列表页
            setTimeout(() => {
              wx.navigateBack();
            }, 800);

          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});