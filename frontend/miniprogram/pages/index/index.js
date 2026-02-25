// 引入八字计算器
const BaziCalculator = require('../../utils/baziCalculator')
const { request, ensureLogin } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      gender: 'male',
      calendarType: 'solar', // solar: 阳历, lunar: 农历
      date: '',
      time: '',
      region: [],
      useTrueSolarTime: false
    },

    // 地区数据
    regionData: [
      ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆'],
      ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '门头沟区', '房山区']
    ],
    selectedRegion: '',

    // 时辰显示
    shichen: '',

    // 命盘数据
    chartData: null,

    // 历史记录
    historyCharts: [],

    // 状态
    isLoading: false,
    canGenerate: false
  },

  onLoad() {
    console.log('排盘页面加载')
    this.baziCalculator = new BaziCalculator()
    this.loadHistoryCharts()
    this.initDefaultData()
  },

  onShow() {
    // 页面显示时刷新历史记录
    this.loadHistoryCharts()
  },

  /**
   * 初始化默认数据
   */
  initDefaultData() {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0].substring(0, 5)

    this.setData({
      'formData.date': date,
      'formData.time': time
    })

    this.updateShichen(now.getHours())
    this.checkCanGenerate()
  },

  /**
   * 姓名输入
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  /**
   * 性别选择
   */
  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    })
  },

  /**
   * 历法选择
   */
  onCalendarTypeChange(e) {
    this.setData({
      'formData.calendarType': e.detail.value
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
    this.checkCanGenerate()
  },

  /**
   * 时间选择
   */
  onTimeChange(e) {
    const time = e.detail.value
    this.setData({
      'formData.time': time
    })

    // 更新时辰显示
    const hour = parseInt(time.split(':')[0])
    this.updateShichen(hour)
    this.checkCanGenerate()
  },

  /**
   * 更新时辰显示
   */
  updateShichen(hour) {
    const shichenMap = [
      '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
      '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
      '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
      '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
    ]

    const shichenIndex = Math.floor((hour + 1) / 2) % 12
    this.setData({
      shichen: shichenMap[shichenIndex]
    })
  },

  /**
   * 地区选择
   */
  onRegionChange(e) {
    const values = e.detail.value
    const region = this.data.regionData[0][values[0]] + ' ' + this.data.regionData[1][values[1]]

    this.setData({
      'formData.region': values,
      selectedRegion: region
    })
  },

  /**
   * 真太阳时校正开关
   */
  onTrueSolarTimeChange(e) {
    this.setData({
      'formData.useTrueSolarTime': e.detail.value
    })
  },

  /**
   * 检查是否可以生成命盘
   */
  checkCanGenerate() {
    const { date, time } = this.data.formData
    const canGenerate = date && time

    this.setData({
      canGenerate
    })
  },

  /**
   * 生成命盘
   */
  async generateChart() {
    if (!this.data.canGenerate) {
      wx.showToast({
        title: '请完善出生信息',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    try {
      const { formData } = this.data

      // 解析日期时间
      const [year, month, day] = formData.date.split('-').map(Number)
      const [hour, minute] = formData.time.split(':').map(Number)

      // 准备出生信息
      const birthInfo = {
        name: formData.name,
        gender: formData.gender,
        year,
        month,
        day,
        hour,
        minute,
        calendarType: formData.calendarType,
        useTrueSolarTime: formData.useTrueSolarTime,
        longitude: this.getRegionLongitude(formData.region)
      }

      // 如果是农历，需要转换为阳历
      if (formData.calendarType === 'lunar') {
        // 这里应该调用农历转阳历的函数
        // 简化处理，实际需要实现lunar2solar函数
        wx.showToast({
          title: '农历转换功能开发中',
          icon: 'none'
        })
        this.setData({ isLoading: false })
        return
      }

      // 生成命盘
      const chartData = this.baziCalculator.generateChart(birthInfo)

      this.setData({
        chartData,
        isLoading: false
      })

      // 保存到历史记录
      this.saveToHistory(chartData)

      wx.showToast({
        title: '排盘成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('排盘失败：', error)
      this.setData({ isLoading: false })

      wx.showToast({
        title: '排盘失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 获取地区经度（简化处理）
   */
  getRegionLongitude(region) {
    const longitudeMap = {
      '北京': 116.4,
      '上海': 121.5,
      '广州': 113.3,
      '深圳': 114.1,
      '杭州': 120.2,
      '南京': 118.8,
      '武汉': 114.3,
      '成都': 104.1,
      '西安': 108.9,
      '重庆': 106.5
    }

    if (region && region.length > 0) {
      const city = this.data.regionData[0][region[0]]
      return longitudeMap[city] || 116.4
    }

    return 116.4 // 默认北京经度
  },

  /**
   * 显示示例命盘
   */
  showSampleChart() {
    const sampleBirthInfo = {
      name: '张三',
      gender: 'male',
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      calendarType: 'solar',
      useTrueSolarTime: false,
      longitude: 116.4
    }

    const chartData = this.baziCalculator.generateChart(sampleBirthInfo)

    this.setData({
      chartData
    })

    wx.showToast({
      title: '示例命盘已生成',
      icon: 'success'
    })
  },

  /**
   * AI智能解读
   */
  getAIAnalysis() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    // 通过 globalData 传递数据，避免 URL 参数大小限制
    app.globalData.currentChart = this.data.chartData
    wx.navigateTo({
      url: '/pages/analysis/analysis'
    })
  },

  /**
   * 保存命盘
   */
  async saveChart() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const loggedIn = await ensureLogin()
    if (loggedIn) {
      try {
        await request('/api/charts', 'POST', {
          name: this.data.chartData.birthInfo.name || `命盘_${new Date().toLocaleDateString()}`,
          birthInfo: this.data.chartData.birthInfo,
          chartData: this.data.chartData
        })
        wx.hideLoading()
        wx.showToast({ title: '保存成功', icon: 'success' })
        this.loadHistoryCharts()
        return
      } catch (error) {
        console.error('API保存失败，降级到本地存储：', error)
        wx.hideLoading()
      }
    } else {
      wx.hideLoading()
    }

    // 降级到本地存储
    try {
      const charts = wx.getStorageSync('savedCharts') || []
      const newChart = {
        id: Date.now(),
        ...this.data.chartData,
        createTime: new Date().toLocaleString()
      }
      charts.unshift(newChart)
      if (charts.length > 50) charts.splice(50)
      wx.setStorageSync('savedCharts', charts)
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.loadHistoryCharts()
    } catch (error) {
      console.error('保存失败：', error)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  /**
   * 分享命盘
   */
  shareChart() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    const { chartData } = this.data
    const shareText = `${chartData.birthInfo.name || '我'}的八字命盘：\n${chartData.baziString}\n\n使用八字排盘小程序查看详细解读`

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    wx.showToast({
      title: '可以分享给好友了',
      icon: 'success'
    })
  },

  /**
   * 加载历史记录
   */
  async loadHistoryCharts() {
    const token = wx.getStorageSync('token')
    if (token) {
      try {
        const data = await request('/api/charts?limit=5')
        this.setData({ historyCharts: data.charts || [] })
        return
      } catch (error) {
        console.error('从API加载历史失败，降级本地存储：', error)
      }
    }
    // 降级到本地存储
    try {
      const charts = wx.getStorageSync('savedCharts') || []
      this.setData({ historyCharts: charts.slice(0, 5) })
    } catch (error) {
      console.error('加载历史记录失败：', error)
    }
  },

  /**
   * 保存到历史记录
   */
  saveToHistory(chartData) {
    try {
      const charts = wx.getStorageSync('historyCharts') || []
      const newChart = {
        id: Date.now(),
        ...chartData,
        createTime: new Date().toLocaleString()
      }

      // 检查是否已存在相同命盘
      const existIndex = charts.findIndex(chart => chart.baziString === chartData.baziString)
      if (existIndex !== -1) {
        charts.splice(existIndex, 1)
      }

      charts.unshift(newChart)

      // 最多保存20个历史记录
      if (charts.length > 20) {
        charts.splice(20)
      }

      wx.setStorageSync('historyCharts', charts)
      this.loadHistoryCharts()

    } catch (error) {
      console.error('保存历史记录失败：', error)
    }
  },

  /**
   * 加载历史命盘
   */
  loadHistoryChart(e) {
    const chart = e.currentTarget.dataset.chart

    this.setData({
      chartData: chart,
      'formData.name': chart.birthInfo.name || '',
      'formData.gender': chart.birthInfo.gender || 'male'
    })

    wx.showToast({
      title: '已加载历史命盘',
      icon: 'success'
    })
  },

  /**
   * 删除命盘记录
   */
  deleteChart(e) {
    const chartId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个命盘记录吗？',
      success: async (res) => {
        if (res.confirm) {
          // MongoDB ObjectId 是24位十六进制字符串
          const isApiChart = typeof chartId === 'string' && /^[0-9a-f]{24}$/i.test(chartId)
          if (isApiChart) {
            try {
              await request(`/api/charts/${chartId}`, 'DELETE')
            } catch (error) {
              console.error('API删除失败：', error)
            }
          } else {
            // 本地存储删除
            try {
              let charts = wx.getStorageSync('savedCharts') || []
              charts = charts.filter(chart => chart.id !== chartId)
              wx.setStorageSync('savedCharts', charts)
              let history = wx.getStorageSync('historyCharts') || []
              history = history.filter(chart => chart.id !== chartId)
              wx.setStorageSync('historyCharts', history)
            } catch (err) {
              console.error('本地删除失败：', err)
            }
          }
          this.loadHistoryCharts()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  /**
   * 对比命盘
   */
  compareChart(e) {
    const chart = e.currentTarget.dataset.chart

    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成一个命盘',
        icon: 'none'
      })
      return
    }

    app.globalData.compareCharts = {
      chart1: this.data.chartData,
      chart2: chart
    }
    wx.navigateTo({ url: '/pages/compare/compare' })
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '八字排盘 - 专业命理服务',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-banner.png'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '八字排盘小程序',
      query: 'from=timeline',
      imageUrl: '/assets/images/share-banner.png'
    }
  }
})