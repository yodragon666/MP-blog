Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 统一跳转到文章列表页
   * status 对应关系：0-草稿, 1-审核中, 2-已发布, 3-审核失败
   */
  goToStatusList(e) {
    // 获取 WXML 中 data-status 绑定的值
    const status = e.currentTarget.dataset.status;
    
    // 跳转到你新建的那个统一列表页面（假设路径如下）
    wx.navigateTo({
      url: `/pages/profile/myposts/myposts_list/myposts_list?status=${status}`,
      success: (res) => {
        console.log('跳转成功，当前携带状态码:', status);
      },
      fail: (err) => {
        console.error('跳转失败，请检查 app.json 中是否注册了该页面路径', err);
      }
    });
  },

  /**
   * 针对你 WXML 中第四个按钮用的函数名是 goToPostsList 的兼容处理
   * 建议 WXML 里统一改成 goToStatusList，或者在这里多写一个函数
   */
  goToPostsList(e) {
    this.goToStatusList(e);
  }
});