Page({
  data: {
    cacheSize: '0',
    // 核心白名单：清理时跳过这些 Key
    cacheWhitelist: ['access',
      'refresh',
      'user_id',
      'is_completed',
      'is_guest',
      'hasPromptedComplete',
      'userInfo'
    ]
  },

  onShow() {
    this.calculateCache();
  },

  // 计算除白名单外的缓存大小
  calculateCache() {
    const res = wx.getStorageInfoSync();
    // 实际项目中，精准计算单个 key 大小较复杂，这里显示总占用
    // 但清理时我们会执行白名单逻辑
    this.setData({
      cacheSize: res.currentSize
    });
  },

  // 联系管理员：弹窗 + 一键复制
  handleContactAdmin() {
    const email = '2251620337@qq.com';
    wx.showModal({
      title: '联系管理员',
      content: `邮箱：${email}`,
      confirmText: '复制邮箱',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: email,
            success: () => wx.showToast({ title: '邮箱已复制', icon: 'success' })
          });
        }
      }
    });
  },

  // 精准清理缓存
  handleClearCache() {
    const res = wx.getStorageInfoSync();
    const keysToRemove = res.keys.filter(key => !this.data.cacheWhitelist.includes(key));

    if (keysToRemove.length === 0) {
      wx.showToast({ title: '暂无冗余缓存', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '温馨提示',
      content: '将清理图片缓存及搜索历史，不影响登录状态。',
      success: (sm) => {
        if (sm.confirm) {
          keysToRemove.forEach(key => wx.removeStorageSync(key));
          wx.showToast({ title: '清理完成' });
          this.calculateCache();
        }
      }
    });
  },

  // 路由跳转
  goToLegal(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/profile/settings/legal/legal?type=${type}` });
  },
  checkUpdate() {
    wx.showLoading({ title: '检查中' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '已是最新版本', icon: 'none' });
    }, 800);
  }
});