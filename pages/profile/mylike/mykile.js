import { request } from '../../../utils/request';

Page({
  data: {
    postList: [],
    page: 1,
    totalPage: 1,
    total: 0,
    isLoading: false,
    isReady: false
  },

  onLoad() {
    this.getPosts();
  },
  onShow() {
    this.getPosts();
  },

  async getPosts() {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });

    try {
      const res = await request({
        url: '/api_blog/getlikeposts/', // 对应点赞接口
        data: { page: this.data.page }
      });
      
      const data = res.data; // 根据你API返回的结构
      const newList = data.list || [];
      
      this.setData({
        postList: this.data.page === 1 ? newList : this.data.postList.concat(newList),
        totalPage: data.total_page || 1,
        total: data.total || 0,
        isReady: true,
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      this.setData({ isLoading: false, isReady: true });
    }
  },

  onReachBottom() {
    if (this.data.page < this.data.totalPage && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 });
      this.getPosts();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1 }, () => {
      this.getPosts().then(() => wx.stopPullDownRefresh());
    });
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/postdetail/postdetail?id=${e.currentTarget.dataset.id}` });
  }
});