import { request } from '../../utils/request';
import { requireLogin } from '../../utils/authGuard';
Page({
  data: {
    tagList: [],
    selectedTags: [],
    selectedTagsList: [],
    postList: [],

    page: 1,
    totalPage: 1,
    total: 0,

    previewCount: 0, // ⭐ 新增：预览文章数量

    hasSearched: false,
    isReady: false,
    isLoading: false
  },

  onLoad() {
    this.initPage();
  },
  onShow() {
    const app = getApp();
    app.updateUnreadCount(); // 每次切到这个 Tab，都强制刷一下红点
  },
  async initPage() {
    this.setData({ isReady: false });
    await this.getTags();
    this.setData({ isReady: true });
  },

  // 获取标签
  async getTags() {
    try {
      const res = await request({ url: '/api_blog/tags/' });
      const list = res.data || [];

      this.setData({
        tagList: list.map(item => ({ ...item, active: false }))
      });
    } catch (err) {
      wx.showToast({ title: '标签加载失败', icon: 'none' });
    }
  },

  // ⭐ 切换标签（带实时数量请求）
  toggleTag(e) {
    const id = e.currentTarget.dataset.id;
    let selected = [...this.data.selectedTags];
    const index = selected.indexOf(id);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(id);
    }

    const selectedTagsList = this.data.tagList.filter(item =>
      selected.includes(item.id)
    );

    const tagList = this.data.tagList.map(item => ({
      ...item,
      active: selected.includes(item.id)
    }));

    this.setData({
      selectedTags: selected,
      selectedTagsList,
      tagList,
      page: 1
    });

    // ⭐ 每次点击后请求“数量”
    this.getPreviewCount();
  },

  removeTag(e) {
    this.toggleTag(e);
  },

  // ⭐ 只获取数量（核心优化点）
  async getPreviewCount() {
    if (this.data.selectedTags.length === 0) {
      this.setData({ previewCount: 0 });
      return;
    }

    try {
      const res = await request({
        url: '/api_blog/postsbytags',
        data: {
          tags: this.data.selectedTags.join(','),
          page: 1
        }
      });

      const data = res.data || {};
      this.setData({
        previewCount: data.total || 0
      });

    } catch (err) {
      console.error(err);
    }
  },

  // ⭐ 点击按钮正式查询
  confirmSearch() {
    if (this.data.selectedTags.length === 0) {
      wx.showToast({ title: '请先选择标签', icon: 'none' });
      return;
    }

    this.setData({
      hasSearched: true,
      page: 1
    });

    this.getPostsByTags();
  },

  // 获取文章列表
  async getPostsByTags() {
    this.setData({ isLoading: true });

    try {
      const res = await request({
        url: '/api_blog/postsbytags',
        data: {
          tags: this.data.selectedTags.join(','),
          page: this.data.page
        }
      });

      const data = res.data || {};

      this.setData({
        postList: data.list || [],
        total: data.total || 0,
        totalPage: data.total_page || 1
      });

    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  resetSearch() {
    this.setData({
      hasSearched: false,
      postList: [],
      total: 0
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/postdetail/postdetail?id=${id}`
    });
  },

  prevPage() {
    if (this.data.page <= 1) return;
    this.setData({ page: this.data.page - 1 });
    this.getPostsByTags();
  },

  nextPage() {
    if (this.data.page >= this.data.totalPage) return;
    this.setData({ page: this.data.page + 1 });
    this.getPostsByTags();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      selectedTags: [],
      selectedTagsList: [],
      previewCount: 0,
      hasSearched: false
    });

    this.getTags().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  clearAllTags() {
    const tagList = this.data.tagList.map(item => ({
      ...item,
      active: false
    }));
  
    this.setData({
      selectedTags: [],
      selectedTagsList: [],
      tagList,
      previewCount: 0, // 清空数量
      page: 1
    });
  },
  goToAddPost() {
    requireLogin(() => {
      wx.navigateTo({ url: '/pages/addpost/addpost' });
    })
  }
});