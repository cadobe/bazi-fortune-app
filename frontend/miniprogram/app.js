App({
  globalData: {
    userInfo: null,
    openid: null,
    baseUrl: 'https://bazi-fortune-app.onrender.com', // 后端API地址（Render部署）
    currentChart: null, // 当前命盘数据
    theme: 'classic' // 默认主题
  },

  onLaunch() {
    console.log('八字排盘小程序启动')

    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        console.log('系统信息：', res)
      }
    })

    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token有效性
      this.validateToken(token)
    }
  },

  // 验证token
  validateToken(token) {
    wx.request({
      url: `${this.globalData.baseUrl}/api/auth/me`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          this.globalData.userInfo = res.data.data.user
        } else {
          // token无效，清除本地存储
          wx.removeStorageSync('token')
        }
      },
      fail: (err) => {
        console.error('验证token失败：', err)
      }
    })
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      // 先获取用户信息（需要用户授权），再获取 code
      const doLogin = (wechatUserInfo) => {
        wx.login({
          success: (res) => {
            if (res.code) {
              wx.request({
                url: `${this.globalData.baseUrl}/api/auth/wechat-login`,
                method: 'POST',
                data: { code: res.code, userInfo: wechatUserInfo },
                success: (loginRes) => {
                  if (loginRes.data.success) {
                    const { token, user, openid } = loginRes.data.data
                    wx.setStorageSync('token', token)
                    // 把真实微信头像/昵称存本地，供 profile 页直接展示
                    if (wechatUserInfo && wechatUserInfo.nickName) {
                      wx.setStorageSync('wechatUserInfo', {
                        nickName: wechatUserInfo.nickName,
                        avatarUrl: wechatUserInfo.avatarUrl
                      })
                    }
                    this.globalData.userInfo = user
                    this.globalData.wechatUserInfo = wechatUserInfo || null
                    this.globalData.openid = openid
                    resolve(loginRes.data.data)
                  } else {
                    reject(loginRes.data.message)
                  }
                },
                fail: reject
              })
            } else {
              reject('获取微信code失败')
            }
          },
          fail: reject
        })
      }

      wx.getUserProfile({
        desc: '用于显示您的昵称和头像',
        success: (profileRes) => {
          doLogin(profileRes.userInfo)
        },
        fail: () => {
          // 用户拒绝授权，仍可静默登录（无昵称头像）
          doLogin(null)
        }
      })
    })
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取用户信息成功：', res.userInfo)
          this.globalData.userInfo = res.userInfo
          resolve(res.userInfo)
        },
        fail: reject
      })
    })
  }
})