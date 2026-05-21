import { request } from '../../../../utils/request';
import { requireLogin } from '../../../../utils/authGuard'
Page({
  data: {
    status: null,
    statusName: '',
    postList: [],
    page: 1,
    totalPage: 1,
    total: 0,
    isReady: false,
    isLoading: false,
    isReviewed:false,
  },

  onLoad(options) {
    const status = options.status;
    const statusMap = {
      '0': '草稿箱',
      '1': '审核中',
      '2': '已发布',
      '3': '审核失败'
    };

    this.setData({
      status: status,
      statusName: statusMap[status] || '我的文章'
    });
    this.getAppStatus();
    this.getPosts();
  },

  async getPosts() {
    if (this.data.isLoading || (this.data.page > this.data.totalPage && this.data.page !== 1)) return;

    this.setData({ isLoading: true });

    try {
      const res = await request({
        url: '/api_blog/my_posts/',
        data: {
          status: this.data.status,
          page: this.data.page
        }
      });

      const result = res.data;
      const newList = result.list || [];

      setTimeout(() => {
        this.setData({
          postList: this.data.page === 1 ? newList : this.data.postList.concat(newList),
          totalPage: result.total_page || 1,
          total: result.total || 0,
          isReady: true,
          isLoading: false
        });
      }, 300);

    } catch (err) {
      this.setData({ isReady: true, isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onReachBottom() {
    if (this.data.page < this.data.totalPage) {
      this.setData({ page: this.data.page + 1 });
      this.getPosts();
    }
  },

  // 修改
  handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/addpost/addpost?id=${id}`
    });
  },
  // 删除（修复字段）
  handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除这篇文章吗？',
      confirmColor: '#EA4335',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/api_blog/deletepost/`, // ✅ 修复
              method: 'POST',
              data: { post_id: id } // ✅ 修复
            });
            wx.showToast({ title: '删除成功' });
            this.setData({ page: 1 });
            this.getPosts();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 撤回（核心）
  handleBack(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定撤回该文章为草稿吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: '/api_blog/backpost/',
              method: 'POST',
              data: {
                post_id: id,
              }
            });
            wx.showToast({ title: '已撤回' });
            this.setData({ page: 1 });
            this.getPosts();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;

    if (this.data.status == '2') {
      wx.navigateTo({ url: `/pages/postdetail/postdetail?id=${id}` });
    } else {
      this.handleEdit(e);
    }
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
});