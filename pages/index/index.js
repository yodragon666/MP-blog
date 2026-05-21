import { request } from '../../utils/request';
import { requireLogin } from '../../utils/authGuard';
const app = getApp();

Page({
  data: {
    categoryList: [],
    postList: [],
    currentId: 0,
    currentCategoryName: '',
    keyword: '',
    page: 1,
    totalPage: 1,
    total: 0,
    isLoading: false,
    isReady: false,
    unreadCount: 0 ,// 未读消息数
    isReviewed:false,
  },

  onLoad() {
    this.getCategories();
    this.getAppStatus();
  },

  onShow() {
    console.log('requireLogin:', requireLogin)
    this.getUnreadCount();
    app.updateUnreadCount();
    // 只有当 globalData 传回了关键词时，才重置并搜索
    if (app.globalData.keyword) {
      this.setData({
        keyword: app.globalData.keyword,
        page: 1,
        postList: [] 
      }, () => {
        this.getPosts(); // 重置后搜索
      });
      app.globalData.keyword = '';
      return; // 处理完搜索直接返回，不要再执行下面的 getPosts
    }
  
    // 如果 postList 是空的（第一次进入），才获取数据
    this.getPosts();
  },

  // 获取未读消息数量
  // 获取未读消息数量 (修改后的建议)
  async getUnreadCount() {
    const token = wx.getStorageSync('access');
    if (!token) return;

    try {
      const res = await request({ url: '/api_blog/unreadcount/' });
      this.setData({ unreadCount: res.unread_count });
      
      // 如果你有底部 Tab 栏，且消息在第 2 个 Tab (index为1)
      if (res.unread_count > 0) {
        wx.setTabBarBadge({
          index: 0, // 替换成你实际消息 Tab 的索引
          text: res.unread_count > 99 ? '99+' : res.unread_count.toString()
        });
      } else {
        wx.removeTabBarBadge({ index: 0 });
      }
    } catch (err) {
      console.error("未读数获取失败", err);
    }
  },

  // 跳转消息页面（含登录检查）
  goToMessages() {
    const token = wx.getStorageSync('access');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录账号以查看消息',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' }); // 你的登录页路径
          }
        }
      });
      return;
    }
    wx.navigateTo({ url: '/pages/profile/mymessages/mymessages' }); // 消息页路径
  },

  async getPosts(isSilent = false) {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });

    const startTime = Date.now();
    const MIN_LOADING_TIME = this.data.page === 1 ? 1000 : 500; // 第一页为了仪式感慢一点，后续快一点

    try {
      const res = await request({
        url: '/api_blog/posts/',
        data: {
          page: this.data.page,
          keyword: this.data.keyword,
          category_id: this.data.currentId
        }
      });
      const data = this.unwrap(res);
      const newList = data.list || [];

      // 如果是静默加载（下拉刷新）
      if (isSilent) {
        this.setData({
          postList: newList,
          totalPage: data.total_page || 1,
          total: data.total || 0,
          isLoading: false
        });
        return;
      }

      const stayTime = Date.now() - startTime;
      const remainTime = Math.max(0, MIN_LOADING_TIME - stayTime);

      setTimeout(() => {
        let newListData = [];
        if (this.data.page === 1) {
          newListData = newList;
        } else {
          // 【关键】去重过滤：只保留 postList 中不存在的 item
          const existingIds = this.data.postList.map(item => item.id);
          const filteredNewList = newList.filter(item => !existingIds.includes(item.id));
          newListData = this.data.postList.concat(filteredNewList);
        }
      
        this.setData({
          postList: newListData,
          totalPage: data.total_page || 1,
          total: data.total || 0,
          isReady: true,
          isLoading: false
        });
      }, remainTime);

    } catch (err) {
      this.setData({ isLoading: false, isReady: true });
    }
  },

  // 触底加载下一页
  onReachBottom() {
    if (this.data.page < this.data.totalPage && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 });
      this.getPosts();
    }
  },

  // 搜索和分类切换时需要重置为第一页并清空列表
  onSearch() {
    this.setData({ page: 1, postList: [] });
    this.getPosts();
  },

  tabCategory(e) {
    const id = e.currentTarget.dataset.id;
    let name = '全部';
    if(id != 0) {
      const item = this.data.categoryList.find(i => i.id == id);
      name = item ? item.name : '';
    }
    this.setData({
      currentId: id,
      currentCategoryName: name,
      page: 1,
      postList: [] 
    });
    this.getPosts();
  },

  // 这里的 onInput 改为仅更新 keyword，不触发 getPosts，避免输入过程中列表疯狂跳动
  onInput(e) {
    this.setData({ keyword: e.detail.value });
    if (!e.detail.value) {
      this.setData({ page: 1, postList: [] });
      this.getPosts();
    }
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, postList: [] });
    this.getPosts();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, unreadCount: 0 });
    Promise.all([
      this.getCategories(),
      this.getPosts(true),
      this.getUnreadCount()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  unwrap(res) {
    if (res?.data?.data) return res.data.data;
    if (res?.data) return res.data;
    return res;
  },
  async getAppStatus(){
    try {
      const res = await request({
        url:'/api_blog/appstatus/',
        method:'GET',
      });
      this.setData({
        isReviewed:res.data.status
      });
    }
    catch{
      console.error("获取失败",err)
    }
  },

  async getCategories() {
    try {
      const res = await request({ url: '/api_blog/categories/' });
      this.setData({ categoryList: this.unwrap(res) });
    } catch (err) {}
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/postdetail/postdetail?id=${e.currentTarget.dataset.id}` });
  },

  goToAddPost() {
    requireLogin(async () => {
      try{
        const res = await request({
          url:'/api/checkauthor/',
          method:'GET'
        });
        console.log('当前用户权限：',res.data.is_author);
        //有发布权限
        if(res.data.is_author){
          wx.navigateTo({
            url:'/pages/addpost/addpost'
          });
        }
        //已经提交申请
        else if(res.data.is_apply){
          wx.showToast({
            title: '创作权限审核中',
            icon:'none',
          })
        }
        else{
          wx.showModal({
            content:'您当前无权限，是否申请创作者权限？',
            confirmText:'去申请',
            confirmColor:"#fa5151",
            success:(modalRes)=>{
              if(modalRes.confirm){
                wx.navigateTo({
                  url:'/pages/applyauthor/applyauthor'
                });
              }
            }
          });
        }
      }catch(err){
        wx.showToast({
          title: '获取权限失败',
          icon:'none',
        })
      }
    })
  },
});