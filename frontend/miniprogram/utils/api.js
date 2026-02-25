const app = getApp()

/**
 * 统一 HTTP 请求工具，自动附带 token，返回 Promise
 * @param {string} path - API 路径，如 '/api/charts'
 * @param {string} method - HTTP 方法，默认 'GET'
 * @param {object} data - 请求体数据
 * @returns {Promise} resolve 为 res.data.data，reject 为 Error
 */
function request(path, method, data) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}${path}`,
      method: method || 'GET',
      data: data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          app.globalData.userInfo = null
          reject(new Error('AUTH_EXPIRED'))
          return
        }
        if (res.data && res.data.success) {
          resolve(res.data.data)
        } else {
          reject(new Error(res.data && res.data.message ? res.data.message : '请求失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

/**
 * 确保用户已登录，未登录则自动发起微信登录
 * @returns {Promise<boolean>} 是否登录成功
 */
async function ensureLogin() {
  const token = wx.getStorageSync('token')
  if (token) return true
  try {
    await app.wxLogin()
    return true
  } catch (e) {
    console.error('自动登录失败：', e)
    return false
  }
}

module.exports = { request, ensureLogin }
