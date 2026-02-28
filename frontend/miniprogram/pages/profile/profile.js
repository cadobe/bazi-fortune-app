const { request } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    isLoading: false,
    stats: { totalCharts: 0, totalShares: 0 }
  },

  onShow() {
    this.checkLoginState()
  },

  async checkLoginState() {
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({ isLoggedIn: false, userInfo: null })
      return
    }
    // token 存在但 globalData 可能因重启丢失
    if (app.globalData.userInfo) {
      this.setData({ isLoggedIn: true, userInfo: this._mergeWechatInfo(app.globalData.userInfo) })
    } else {
      try {
        const data = await request('/api/auth/me')
        app.globalData.userInfo = data.user
        this.setData({ isLoggedIn: true, userInfo: this._mergeWechatInfo(data.user) })
      } catch (e) {
        wx.removeStorageSync('token')
        this.setData({ isLoggedIn: false, userInfo: null })
        return
      }
    }
    this.loadUserStats()
  },

  // 用本地缓存的真实微信头像/昵称覆盖后端数据
  _mergeWechatInfo(user) {
    const cached = wx.getStorageSync('wechatUserInfo')
    if (!cached) return user
    return {
      ...user,
      wechat: {
        ...(user.wechat || {}),
        nickname: cached.nickName || (user.wechat && user.wechat.nickname),
        avatarUrl: cached.avatarUrl || (user.wechat && user.wechat.avatarUrl)
      }
    }
  },

  async handleLogin() {
    this.setData({ isLoading: true })
    try {
      await app.wxLogin()
      this.setData({ isLoggedIn: true, userInfo: this._mergeWechatInfo(app.globalData.userInfo), isLoading: false })
      this.loadUserStats()
    } catch (e) {
      this.setData({ isLoading: false })
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
    }
  },

  async loadUserStats() {
    try {
      const data = await request('/api/charts/stats/overview')
      const overview = data.overview || {}
      this.setData({
        stats: {
          totalCharts: overview.totalCharts || 0,
          totalShares: overview.totalShares || 0
        }
      })
    } catch (e) { /* 统计加载失败不影响主界面 */ }
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后本地命盘记录不受影响',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          app.globalData.userInfo = null
          this.setData({ isLoggedIn: false, userInfo: null, stats: { totalCharts: 0, totalShares: 0 } })
        }
      }
    })
  }
})
