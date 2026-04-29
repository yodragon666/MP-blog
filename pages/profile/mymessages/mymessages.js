import { request } from '../../../utils/request'; // 假设你的请求工具路径

Page({
  data: {
    isReady: false,
    postList: [], // 消息列表
    page: 1,
    totalPage: 1,
    total: 0,
    
    // 筛选状态：'all' 或 'unread'
    filterType: 'all', 
    filterName: '全部消息',
    
    // 菜单控制
    showMoreMenu: false,
    showFilterMenu: false,
    isLoading: false,

    // 消息类型映射字典
    typeMap: {
      'system': '系统通知',
      'post': '审核通知',
      'like': '点赞通知',
      'favorite': '收藏通知',
      'account': '账号安全'
    }
  },

  onLoad() {
    this.fetchMessages(true);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchMessages(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 触底自动加载下一页 (无限下滑)
  onReachBottom() {
    if (this.data.page < this.data.totalPage && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 });
      this.fetchMessages(false);
    }
  },

  // 获取消息列表 (reset=true代表重新加载第一页)
  async fetchMessages(reset = false) {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });

    if (reset) {
      this.setData({ page: 1 });
    }

    const { filterType, page } = this.data;
    const url = filterType === 'all' ? '/api_blog/notifications/' : '/api_blog/notificationsunread/';

    try {
      const res = await request({
        url: url,
        data: { page: page }
      });

      if (res.code === 200) {
        const newData = res.data.list || [];
        this.setData({
          postList: reset ? newData : [...this.data.postList, ...newData],
          total: res.data.total,
          totalPage: res.data.total_page || 1,
          isReady: true
        });
      }
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // --- 菜单开关控制 ---
  toggleMoreMenu() {
    this.setData({ 
      showMoreMenu: !this.data.showMoreMenu,
      showFilterMenu: false 
    });
  },

  toggleFilterMenu() {
    this.setData({ 
      showFilterMenu: !this.data.showFilterMenu,
      showMoreMenu: false
    });
  },

  closeAllMenu() {
    this.setData({ showMoreMenu: false, showFilterMenu: false });
  },

  // --- 筛选列表切换 ---
  switchFilter(e) {
    const type = e.currentTarget.dataset.type;
    const name = type === 'all' ? '全部消息' : '未读消息';
    this.setData({ 
      filterType: type, 
      filterName: name,
      showFilterMenu: false 
    });
    this.fetchMessages(true);
  },

  // --- 批量操作 (顶部菜单) ---
  async markAllRead() {
    this.closeAllMenu();
    // 提取当前列表中所有未读消息的 ID
    const unreadIds = this.data.postList.filter(item => !item.is_read).map(item => item.id);
    if (unreadIds.length === 0) return wx.showToast({ title: '暂无未读消息', icon: 'none' });

    this.executeMarkRead(unreadIds, true);
  },

  async deleteAllLoaded() {
    this.closeAllMenu();
    const allIds = this.data.postList.map(item => item.id);
    if (allIds.length === 0) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除当前列表已加载的消息吗？',
      success: (res) => {
        if (res.confirm) this.executeDelete(allIds, true);
      }
    });
  },

  // --- 单个卡片长按操作 (原生 ActionSheet 体验最好) ---
  onLongPressMessage(e) {
    const id = e.currentTarget.dataset.id;
    const isRead = e.currentTarget.dataset.read;
    
    let itemList = isRead ? ['删除信息'] : ['标为已读', '删除信息'];
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const tapIndex = res.tapIndex;
        if (!isRead && tapIndex === 0) {
          // 标为已读
          this.executeMarkRead([id]);
        } else {
          // 删除信息
          this.executeDelete([id]);
        }
      }
    });
  },

  // 点击进入详情 (预留)
  goToDetail(e) {
    const { id, read } = e.currentTarget.dataset;
    // 如果是未读，点击进去的同时可以静默标为已读
    if (!read) this.executeMarkRead([id]);
    // wx.navigateTo({ url: `/pages/messageDetail/messageDetail?id=${id}` });
  },

  // --- 封装 API 执行函数，优化本地状态更新体验 ---
  async executeMarkRead(ids, isBatch = false) {
    try {
      wx.showLoading({ title: '处理中...' });
      await request({
        url: '/api_blog/notificationsread',
        method: 'POST',
        data: { ids: ids }
      });
      wx.hideLoading();
      
      // 本地状态更新，无需重新请求，体验更顺滑
      let newList = this.data.postList.map(item => {
        if (ids.includes(item.id)) item.is_read = true;
        return item;
      });
      // 如果当前是“未读列表”模式，标为已读后应从列表中移除
      if (this.data.filterType === 'unread') {
        newList = newList.filter(item => !item.is_read);
      }
      this.setData({ postList: newList });
      if(isBatch) wx.showToast({ title: '已全部标为已读', icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async executeDelete(ids, isBatch = false) {
    try {
      wx.showLoading({ title: '删除中...' });
      await request({
        url: '/api_blog/notificationsdelete',
        method: 'POST',
        data: { ids: ids }
      });
      wx.hideLoading();
      
      // 本地移除被删数据
      const newList = this.data.postList.filter(item => !ids.includes(item.id));
      this.setData({ 
        postList: newList,
        total: Math.max(0, this.data.total - ids.length)
      });
      wx.showToast({ title: '删除成功', icon: 'success' });
      
      // 如果删完了当前页，尝试拉取一下
      if (newList.length < 5) this.fetchMessages(true);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },
  goToDetail(e) {
    const { id, read } = e.currentTarget.dataset;
    // 从列表中找出当前点击的消息完整对象
    const msgItem = this.data.postList.find(item => item.id === id);

    // 如果是未读，静默调用已读接口（不阻挡用户跳转）
    if (!read) {
      this.executeMarkRead([id]);
    }

    // 将对象转为字符串传递给详情页
    const msgData = encodeURIComponent(JSON.stringify(msgItem));
    wx.navigateTo({ 
      url: `/pages/profile/mymessages/messagedetail/messagedetail?data=${msgData}` 
    });
  },
});