import { request } from '../../utils/request';
import { requireLogin } from '../../utils/authGuard';



Page({
  data: {
    keyword: '',
    newPosts: [],
    hotPosts: [],
    archives: [],

    postList: [],
    page: 1,
    totalPage: 1,
    total: 0,
    isLoading: false,
    hasSearched: false,
  },

  onShow() {
    this.getSidebar();
    console.log('requireLogin:', requireLogin)
    const app = getApp();
    app.updateUnreadCount(); // 每次切到这个 Tab，都强制刷一下红点
  },

  // ⭐ 输入（防抖核心）
  onInput(e) {
    const value = e.detail.value;

    this.setData({
      keyword: value
    });

    // 清空 -> 回到首页
    if (!value) {
      clearTimeout(this.searchTimer);

      this.setData({
        hasSearched: false,
        postList: [],
        total: 0,
        page: 1
      });

      return;
    }

    // ⭐ 有输入 -> 进入搜索态
    this.setData({
      hasSearched: true
    });

    // ⭐ 防抖
    clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      this.setData({ page: 1 });
      this.getPosts();
    }, 500);
  },

  // ⭐ 点击清空
  onClear() {
    clearTimeout(this.searchTimer);

    this.setData({
      keyword: '',
      hasSearched: false,
      postList: [],
      total: 0,
      page: 1
    });
  },

  // ⭐ 手动搜索（回车）
  onSearch() {
    if (!this.data.keyword) return;

    clearTimeout(this.searchTimer);

    this.setData({
      page: 1,
      hasSearched: true
    });

    this.getPosts();
  },

  unwrap(res) {
    if (res?.data?.data) return res.data.data;
    if (res?.data) return res.data;
    return res;
  },

  // ⭐ 核心请求
  async getPosts() {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    try {
      const res = await request({
        url: '/api_blog/posts/',
        data: {
          keyword: this.data.keyword,
          page: this.data.page,
        }
      });

      const data = this.unwrap(res);

      this.setData({
        postList: data.list || [],
        totalPage: data.total_page || 1,
        total: data.total || 0,
      });

    } catch (err) {
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      });
    }

    this.setData({ isLoading: false });
  },

  async getSidebar() {
    try {
      const res = await request({
        url: '/api_blog/sidebar/'
      });

      const data = this.unwrap(res);

      this.setData({
        newPosts: data.new_posts || [],
        hotPosts: data.hot_posts || [],
        archives: data.archives || []
      });

    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/postdetail/postdetail?id=${id}`
    });
  },

  goArchive(e) {
    const year = e.currentTarget.dataset.year;
    const month = e.currentTarget.dataset.month;

    wx.navigateTo({
      url: `/pages/search/archives/archives?year=${year}&month=${month}`
    });
  },

  prevPage() {
    if (this.data.page <= 1) return;

    this.setData({
      page: this.data.page - 1
    });

    this.getPosts();
  },

  nextPage() {
    if (this.data.page >= this.data.totalPage) return;

    this.setData({
      page: this.data.page + 1
    });

    this.getPosts();
  },

    // ⭐ 下拉刷新（等于重进页面）
  async onPullDownRefresh() {
    try {
      // 清空防抖定时器（避免干扰）
      clearTimeout(this.searchTimer);

      // ⭐ 重置所有状态（核心）
      this.setData({
        keyword: '',
        hasSearched: false,
        postList: [],
        page: 1,
        totalPage: 1,
        total: 0
      });

      // ⭐ 重新请求数据（等同 onShow）
      await this.getSidebar();

    } catch (err) {
      console.error('刷新失败', err);
    }

    // ⭐ 必须停止动画
    wx.stopPullDownRefresh();
  },
  goToAddPost() {
    requireLogin(() => {
      wx.navigateTo({ url: '/pages/addpost/addpost' });
    })
  }
});