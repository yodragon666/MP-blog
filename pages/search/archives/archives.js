import { request } from '../../../utils/request';

Page({
  data:{
    year:'',
    month:'',
    postList: [],
    page:1,
    totalPage:1,
    total:0
  },
  onLoad(options){
    this.setData({
      year:options.year,
      month:options.month,
    });
    this.getArchivePosts();
  },
  async getArchivePosts() {
    const res = await request({
      url:'/api_blog/archives/',
      data:{
        year:this.data.year,
        month:this.data.month,
        page:this.data.page
      },
    });
    const data = res.data;
    this.setData({
      postList:data.list || [],
      totalPage:data.total_page || 1,
      total: data.total || 0,
    });
    console.log('归档文章已获取',);
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:`/pages/postdetail/postdetail?id=${id}`
    });
  },
  //上一页文章
  prevPage() {
    if(this.data.page <= 1) return;
    this.setData({
      page:this.data.page - 1
    });
    this.getArchivePosts();
  },
  //下一页文章
  nextPage() {
    if(this.data.page >= this.data.totalPage) return;
    this.setData({
      page:this.data.page + 1
    });
    this.getArchivePosts();
  }
})
