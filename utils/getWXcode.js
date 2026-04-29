/**
 * 封装微信登录获取 code
 * @returns {Promise<string>} 返回 code 字符串
 */
export const getWXcode = () => {
  return new Promise((resolve,reject) => {
    wx.login({
      success:(res) => {
        if(res.code)
        {
          console.log('获取WXcode成功：',res.code);
          resolve(res.code);
        }
        else
        {
          console.log('获取WXcode失败：',res.errMsg);
          reject(err);
        }
      },
      fail: (err) => {
        console.error('微信登录接口调用失败，未获取到code:',err);
        reject(err);
      }
    });
  });
}