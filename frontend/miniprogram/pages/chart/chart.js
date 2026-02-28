const { request } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    charts: [],
    isLoading: false
  },

  onShow() {
    this.loadCharts()
  },

  async loadCharts() {
    this.setData({ isLoading: true })
    const token = wx.getStorageSync('token')
    if (token) {
      try {
        const data = await request('/api/charts?limit=20')
        this.setData({ charts: data.charts || [], isLoading: false })
        return
      } catch (e) {
        console.error('API加载命盘失败，降级本地存储：', e)
      }
    }
    // 降级到本地存储
    const local = wx.getStorageSync('savedCharts') || []
    this.setData({ charts: local.slice(0, 20), isLoading: false })
  },

  goToNewChart() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  viewChart(e) {
    const chart = e.currentTarget.dataset.chart
    // 优先从 chartData 字段读取，兼容 API 返回格式和本地格式
    app.globalData.currentChart = chart.chartData || chart
    wx.navigateTo({ url: '/pages/analysis/analysis' })
  },

  async deleteChart(e) {
    const chartId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个命盘记录吗？',
      success: async (res) => {
        if (!res.confirm) return
        const isApiChart = typeof chartId === 'string' && /^[0-9a-f]{24}$/i.test(chartId)
        if (isApiChart) {
          try { await request(`/api/charts/${chartId}`, 'DELETE') } catch (e) {}
        } else {
          let local = wx.getStorageSync('savedCharts') || []
          local = local.filter(c => c.id !== chartId)
          wx.setStorageSync('savedCharts', local)
        }
        this.loadCharts()
        wx.showToast({ title: '删除成功', icon: 'success' })
      }
    })
  }
})
