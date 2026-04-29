import { request } from '../../utils/request';
import { blogTheme } from '../../utils/theme';
import { requireLogin } from '../../utils/authGuard';

const app = getApp();

Page({
  data: {
    post: {},
    prev: null,
    next: null,
    isLoading: false,
    blogTheme,
    is_liked: false,
    is_favorite: false
  },

  onLoad(options) {
    const id = options.id;
    this.getDetail(id);
  },

  // 微信原生分享配置
  onShareAppMessage() {
    return {
      title: this.data.post.title,
      path: `/pages/post/detail?id=${this.data.post.id}`,
      imageUrl: '' // 如果有封面图可以加上
    };
  },

  unwrap(res) {
    if (res?.data?.data) return res.data.data;
    if (res?.data) return res.data;
    return res;
  },

  async getDetail(id) {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await request({
        url: `/api_blog/posts/${id}/`
      });
      const data = this.unwrap(res);
      this.setData({
        post: data.post,
        prev: data.prev,
        next: data.next,
        is_liked: data.is_liked,
        is_favorite: data.is_favorite
      });
      
      // 滚动回顶部
      wx.pageScrollTo({ scrollTop: 0, duration: 300 });

    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ isLoading: false });
      wx.hideLoading();
    }
  },

  // 点赞逻辑
  handleLike() {
    requireLogin(async () => {
      try {
        const res = await request({
          url: '/api/postlike/',
          method: 'POST',
          data: { post_id: this.data.post.id }
        });
  
        const isNowLiked = !this.data.is_liked;
        const countChange = isNowLiked ? 1 : -1;
  
        this.setData({
          is_liked: isNowLiked,
          ['post.like_count']: this.data.post.like_count + countChange
        });
  
        wx.showToast({
          title: res.msg || (isNowLiked ? '点赞成功' : '已取消'),
          icon: 'none'
        });
  
      } catch (err) {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    });
  },

  // 收藏逻辑
  handleFavorite() {
    requireLogin(async () => {
      try {
        const res = await request({
          url: '/api/postfavorite/',
          method: 'POST',
          data: { post_id: this.data.post.id }
        });
  
        const isNowFav = !this.data.is_favorite;
        const countChange = isNowFav ? 1 : -1;
  
        this.setData({
          is_favorite: isNowFav,
          ['post.favorite_count']: this.data.post.favorite_count + countChange
        });
  
        wx.showToast({
          title: res.msg || (isNowFav ? '收藏成功' : '已取消'),
          icon: 'none'
        });
  
      } catch (err) {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    });
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  //标签点击
  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    app.globalData.keyword = tag;
    wx.switchTab({ url: '/pages/index/index' });
  },

  goPrev() {
    if (!this.data.prev) return;
    this.getDetail(this.data.prev.id);
  },

  goNext() {
    if (!this.data.next) return;
    this.getDetail(this.data.next.id);
  }
});