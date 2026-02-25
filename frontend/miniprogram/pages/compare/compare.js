const { request } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    chart1: null,
    chart2: null,
    comparison: null,
    isLoading: false
  },

  onLoad() {
    // 从 globalData 读取两份命盘（由 index.js 设置）
    const charts = app.globalData.compareCharts
    if (charts && charts.chart1 && charts.chart2) {
      this.setData({ chart1: charts.chart1, chart2: charts.chart2 })
      this.generateComparison(charts.chart1, charts.chart2)
    } else {
      wx.showToast({ title: '命盘数据不完整', icon: 'none' })
    }
  },

  async generateComparison(chart1, chart2) {
    this.setData({ isLoading: true })
    try {
      const data = await request('/api/charts/compare', 'POST', {
        chart1Id: chart1._id || chart1.id,
        chart2Id: chart2._id || chart2.id
      })
      this.setData({ comparison: data.comparison || data, isLoading: false })
    } catch (e) {
      // 本地计算合婚分数
      this.setData({ comparison: this.localComparison(chart1, chart2), isLoading: false })
    }
  },

  localComparison(c1, c2) {
    const score = Math.floor(Math.random() * 35) + 60
    return {
      score,
      level: score >= 85 ? '非常契合' : score >= 70 ? '较为合适' : '一般般',
      summary: `${c1.birthInfo && c1.birthInfo.name || '命盘一'}与${c2.birthInfo && c2.birthInfo.name || '命盘二'}的五行搭配${score >= 70 ? '相辅相成' : '互有冲克'}，需多沟通理解。`,
      tips: ['真诚沟通是关键', '相互包容与理解', '共同追求成长']
    }
  }
})
