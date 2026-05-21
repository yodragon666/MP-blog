import { request } from '../../utils/request';

Page({

  data:{
    reason:''
  },

  onInput(e){
    this.setData({
      reason:e.detail.value
    });
  },

  async submitApply(){
    const { reason } = this.data;
    //trim去除空格，类似py里面的strip()
    if(!reason.trim()){
      return wx.showToast({
        title:'请输入申请理由',
        icon:'none'
      });
    }
    try
    {
      await request({
        url:'/api/applyauthor/',
        method:'POST',
        data:{
          "reason":reason
        }
      });
      wx.showToast({
        title:'申请已提交',
        icon:'success'
      });
       // 1秒后返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }
    catch(err)
    {
      wx.showToast({
        title:err.msg || '提交失败',
        icon:'none'
      });
    }
  }
});