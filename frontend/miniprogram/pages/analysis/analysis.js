const app = getApp()

Page({
  data: {
    chartData: null,
    analysisResult: null,
    chatMessages: [],
    inputText: '',
    isSending: false,
    isAnalyzing: false,

    // 快速问题
    quickQuestions: [
      '我的性格特点是什么？',
      '今年的运势如何？',
      '适合从事什么职业？',
      '什么时候会有桃花运？',
      '需要注意哪些健康问题？',
      '如何提升财运？'
    ],

    // 命理师列表
    masters: [
      {
        id: 1,
        name: '张玄机',
        title: '资深命理师',
        avatar: '/assets/images/master1.png',
        rating: 4.9,
        price: 299,
        experience: '30年经验'
      },
      {
        id: 2,
        name: '李慧眼',
        title: '易学专家',
        avatar: '/assets/images/master2.png',
        rating: 4.8,
        price: 199,
        experience: '25年经验'
      },
      {
        id: 3,
        name: '王善缘',
        title: '八字大师',
        avatar: '/assets/images/master3.png',
        rating: 4.7,
        price: 399,
        experience: '35年经验'
      }
    ]
  },

  onLoad(options) {
    console.log('AI解读页面加载')

    // 获取传入的命盘数据
    if (options.chartData) {
      try {
        const chartData = JSON.parse(decodeURIComponent(options.chartData))
        this.setData({ chartData })

        // 自动开始AI分析
        this.startAIAnalysis()
      } catch (error) {
        console.error('解析命盘数据失败：', error)
        wx.showToast({
          title: '数据格式错误',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '缺少命盘数据',
        icon: 'none'
      })
    }
  },

  /**
   * 开始AI分析
   */
  async startAIAnalysis() {
    if (!this.data.chartData) return

    this.setData({ isAnalyzing: true })

    try {
      // 调用AI分析接口
      const analysisResult = await this.callAIAnalysis(this.data.chartData)

      this.setData({
        analysisResult,
        isAnalyzing: false
      })

      wx.showToast({
        title: '分析完成',
        icon: 'success'
      })

    } catch (error) {
      console.error('AI分析失败：', error)

      // 使用本地模拟分析
      const mockResult = this.generateMockAnalysis(this.data.chartData)

      this.setData({
        analysisResult: mockResult,
        isAnalyzing: false
      })

      wx.showToast({
        title: '分析完成（离线模式）',
        icon: 'success'
      })
    }
  },

  /**
   * 调用AI分析接口
   */
  async callAIAnalysis(chartData) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/ai/analyze`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: {
          chartData,
          analysisType: 'comprehensive' // 综合分析
        },
        timeout: 30000,
        success: (res) => {
          if (res.data.success) {
            resolve(res.data.data)
          } else {
            reject(new Error(res.data.message || '分析失败'))
          }
        },
        fail: reject
      })
    })
  },

  /**
   * 生成模拟分析结果（离线模式）
   */
  generateMockAnalysis(chartData) {
    const { dayTiangan, wuxingStats, pillars } = chartData

    // 根据日干分析性格
    const personalityMap = {
      '甲': '您性格坚韧不拔，如大树般挺拔向上，具有强烈的领导欲望和开拓精神。为人正直，不喜欢弯弯绕绕，做事光明磊落。',
      '乙': '您性格温和柔韧，如花草般清雅秀美，具有很强的适应能力和包容心。善于与人合作，人缘关系较好。',
      '丙': '您性格热情开朗，如太阳般光明磊落，具有很强的感染力和创造力。为人慷慨大方，喜欢帮助他人。',
      '丁': '您性格细腻敏感，如烛火般温暖人心，具有很强的洞察力和艺术天赋。心思缜密，做事认真负责。',
      '戊': '您性格稳重踏实，如大山般厚德载物，具有很强的责任心和包容力。为人诚恳，值得信赖。',
      '己': '您性格温和谦逊，如沃土般滋养万物，具有很强的服务精神和奉献意识。善于倾听，人际关系和谐。',
      '庚': '您性格刚强果断，如利剑般锋芒毕露，具有很强的执行力和决断力。为人直接，不喜欢拖泥带水。',
      '辛': '您性格精致细腻，如珠宝般珍贵美丽，具有很强的审美能力和品味。追求完美，注重细节。',
      '壬': '您性格包容大度，如江河般奔流不息，具有很强的智慧和变通能力。思维活跃，善于创新。',
      '癸': '您性格内敛深沉，如露水般润物无声，具有很强的感知力和直觉。心思细密，善于观察。'
    }

    // 分析五行强弱确定运势
    const strongestElement = wuxingStats[0]
    const weakestElement = wuxingStats[wuxingStats.length - 1]

    return {
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100的随机数
      personality: personalityMap[dayTiangan] || '您的性格特征需要进一步分析。',

      career: this.generateCareerAnalysis(dayTiangan, strongestElement),
      careerTags: this.getCareerTags(dayTiangan),

      wealth: this.generateWealthAnalysis(strongestElement, weakestElement),
      wealthScore: this.calculateWealthScore(wuxingStats),

      relationship: this.generateRelationshipAnalysis(dayTiangan, chartData.birthInfo.gender),
      loveScore: this.calculateLoveScore(wuxingStats),

      health: this.generateHealthAnalysis(weakestElement),
      healthTips: this.getHealthTips(weakestElement),

      luckPeriods: this.generateLuckPeriods(),
      suggestions: this.generateSuggestions(dayTiangan, strongestElement)
    }
  },

  /**
   * 生成事业分析
   */
  generateCareerAnalysis(dayTiangan, strongestElement) {
    const careerMap = {
      '甲': '适合从事管理、领导类工作，在企业管理、政府部门或自主创业方面有很好的发展潜力。',
      '乙': '适合从事艺术、文化、教育类工作，在设计、写作、咨询等创意性行业表现突出。',
      '丙': '适合从事销售、公关、娱乐类工作，在市场营销、媒体传播、表演艺术等领域发展良好。',
      '丁': '适合从事技术、研发、医疗类工作，在科研、工程、医学等专业领域有所建树。',
      '戊': '适合从事建筑、房地产、农业类工作，在基础建设、土地开发等实业方面发展稳定。',
      '己': '适合从事服务、护理、农业类工作，在餐饮、护理、农林等服务性行业表现出色。',
      '庚': '适合从事金融、制造、军警类工作，在银行、工厂、执法等刚性行业发展良好。',
      '辛': '适合从事珠宝、美容、精密制造类工作，在奢侈品、美容、精密仪器等精致行业有所发展。',
      '壬': '适合从事贸易、运输、信息类工作，在物流、电商、IT等流动性行业表现突出。',
      '癸': '适合从事研究、策划、顾问类工作，在智库、咨询、学术等智慧性行业发展良好。'
    }

    return careerMap[dayTiangan] || '您的职业发展需要结合具体情况进一步分析。'
  },

  /**
   * 获取职业标签
   */
  getCareerTags(dayTiangan) {
    const tagMap = {
      '甲': ['管理者', '领导者', '创业家'],
      '乙': ['艺术家', '教育者', '设计师'],
      '丙': ['销售员', '主持人', '营销专家'],
      '丁': ['工程师', '研究员', '医生'],
      '戊': ['建筑师', '实业家', '管理者'],
      '己': ['服务员', '护理师', '农业专家'],
      '庚': ['金融家', '制造商', '执法者'],
      '辛': ['设计师', '美容师', '工匠'],
      '壬': ['贸易商', '物流专家', 'IT人员'],
      '癸': ['研究员', '策划师', '顾问']
    }

    return tagMap[dayTiangan] || ['多元发展']
  },

  /**
   * 生成财运分析
   */
  generateWealthAnalysis(strongestElement, weakestElement) {
    const wealthTexts = [
      '您的财运整体较为平稳，通过勤奋努力可以获得稳定的收入。',
      '您具有一定的投资眼光，适合进行稳健的理财规划。',
      '您的偏财运不错，可能会有意外的收入来源。',
      '您适合通过合作或合伙的方式来增加财富。',
      '您的财运与人际关系密切相关，善待他人对财运有帮助。'
    ]

    return wealthTexts[Math.floor(Math.random() * wealthTexts.length)]
  },

  /**
   * 计算财运分数
   */
  calculateWealthScore(wuxingStats) {
    // 根据五行平衡度计算财运分数
    const balance = this.calculateElementBalance(wuxingStats)
    return Math.floor(balance * 20) + 60 // 60-100分
  },

  /**
   * 生成感情分析
   */
  generateRelationshipAnalysis(dayTiangan, gender) {
    const maleTexts = [
      '您在感情中比较主动，容易吸引异性的注意。',
      '您对感情比较专一，一旦确定关系就会全心投入。',
      '您的桃花运不错，容易遇到心仪的对象。'
    ]

    const femaleTexts = [
      '您在感情中比较温柔体贴，是很好的伴侣人选。',
      '您对感情有自己的标准，不会轻易妥协。',
      '您的魅力指数较高，容易获得异性的青睐。'
    ]

    const texts = gender === 'female' ? femaleTexts : maleTexts
    return texts[Math.floor(Math.random() * texts.length)]
  },

  /**
   * 计算爱情分数
   */
  calculateLoveScore(wuxingStats) {
    return Math.floor(Math.random() * 30) + 70 // 70-100分
  },

  /**
   * 生成健康分析
   */
  generateHealthAnalysis(weakestElement) {
    const healthMap = {
      '金': '需要注意呼吸系统和皮肤方面的健康问题，多进行有氧运动。',
      '木': '需要注意肝胆和神经系统的健康，保持良好的作息规律。',
      '水': '需要注意肾脏和泌尿系统的健康，多喝水，少熬夜。',
      '火': '需要注意心血管和精神方面的健康，控制情绪波动。',
      '土': '需要注意脾胃消化系统的健康，饮食要规律均衡。'
    }

    return healthMap[weakestElement.name] || '整体健康状况良好，注意劳逸结合即可。'
  },

  /**
   * 获取健康建议
   */
  getHealthTips(weakestElement) {
    const tipsMap = {
      '金': ['多吃白色食物', '进行呼吸练习', '保持皮肤清洁'],
      '木': ['早睡早起', '多吃绿色蔬菜', '适当运动放松'],
      '水': ['多喝温开水', '避免过度劳累', '保护肾脏功能'],
      '火': ['保持心情愉快', '避免过度兴奋', '适当静坐冥想'],
      '土': ['规律饮食', '细嚼慢咽', '避免暴饮暴食']
    }

    return tipsMap[weakestElement.name] || ['保持良好作息', '均衡饮食', '适量运动']
  },

  /**
   * 生成运势时期
   */
  generateLuckPeriods() {
    const currentYear = new Date().getFullYear()
    const birthYear = this.data.chartData.birthInfo.year
    const currentAge = currentYear - birthYear

    return [
      {
        age: Math.max(currentAge, 25),
        description: '事业起步期，需要积累经验',
        type: 'normal'
      },
      {
        age: Math.max(currentAge + 5, 30),
        description: '运势上升期，适合发展',
        type: 'good'
      },
      {
        age: Math.max(currentAge + 10, 35),
        description: '人生巅峰期，大展宏图',
        type: 'excellent'
      },
      {
        age: Math.max(currentAge + 15, 40),
        description: '稳定发展期，守成为主',
        type: 'stable'
      }
    ]
  },

  /**
   * 生成开运建议
   */
  generateSuggestions(dayTiangan, strongestElement) {
    return [
      {
        category: '颜色开运',
        items: [
          '多穿绿色或蓝色衣服',
          '使用木质或水晶饰品',
          '办公环境多用暖色调'
        ]
      },
      {
        category: '方位开运',
        items: [
          '办公桌面向东方或南方',
          '居住环境选择向阳的房间',
          '出行多往吉利方向'
        ]
      },
      {
        category: '数字开运',
        items: [
          '手机号码尾数选择3、8',
          '车牌号选择吉利数字',
          '重要日期多选择吉日'
        ]
      }
    ]
  },

  /**
   * 计算五行平衡度
   */
  calculateElementBalance(wuxingStats) {
    const total = wuxingStats.reduce((sum, item) => sum + item.count, 0)
    const average = total / 5
    const variance = wuxingStats.reduce((sum, item) => sum + Math.pow(item.count - average, 2), 0) / 5

    // 平衡度越高分数越高
    return Math.max(0, 5 - Math.sqrt(variance))
  },

  /**
   * 快速提问
   */
  askQuickQuestion(e) {
    const question = e.currentTarget.dataset.question
    this.setData({ inputText: question })
    this.sendMessage()
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  /**
   * 发送消息
   */
  async sendMessage() {
    const message = this.data.inputText.trim()
    if (!message || this.data.isSending) return

    this.setData({ isSending: true })

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      time: new Date().toLocaleTimeString()
    }

    this.setData({
      chatMessages: [...this.data.chatMessages, userMessage],
      inputText: ''
    })

    try {
      // 调用AI问答接口
      const response = await this.callAIChat(message, this.data.chartData)

      // 添加AI回复
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        time: new Date().toLocaleTimeString()
      }

      this.setData({
        chatMessages: [...this.data.chatMessages, aiMessage],
        isSending: false
      })

    } catch (error) {
      console.error('AI问答失败：', error)

      // 使用模拟回复
      const mockResponse = this.generateMockChatResponse(message)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: mockResponse,
        time: new Date().toLocaleTimeString()
      }

      this.setData({
        chatMessages: [...this.data.chatMessages, aiMessage],
        isSending: false
      })
    }
  },

  /**
   * 调用AI问答接口
   */
  async callAIChat(message, chartData) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/ai/chat`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: {
          message,
          chartData,
          sessionId: wx.getStorageSync('chatSessionId') || Date.now()
        },
        timeout: 15000,
        success: (res) => {
          if (res.data.success) {
            resolve(res.data.data.response)
          } else {
            reject(new Error(res.data.message || '问答失败'))
          }
        },
        fail: reject
      })
    })
  },

  /**
   * 生成模拟聊天回复
   */
  generateMockChatResponse(message) {
    const responses = {
      '性格': '根据您的八字分析，您具有坚韧不拔的性格特质，做事有始有终，但有时可能过于固执己见。建议在人际交往中多倾听他人意见。',
      '运势': '您今年的整体运势呈上升趋势，特别是在事业方面会有不错的发展机会。建议把握机遇，积极进取。',
      '职业': '从命盘来看，您适合从事需要耐心和细致的工作，如教育、咨询、技术研发等领域都很适合您的性格特点。',
      '桃花': '您的桃花运在下半年会有所提升，可能会遇到心仪的对象。建议多参加社交活动，扩大交际圈。',
      '健康': '需要特别注意肠胃方面的健康，建议规律饮食，避免暴饮暴食。适当进行有氧运动有助于身体健康。',
      '财运': '您的财运与人际关系密切相关，通过合作或人脉介绍可能会有不错的收入机会。建议善待他人，广结善缘。'
    }

    // 根据关键词匹配回复
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response
      }
    }

    return '感谢您的提问。根据您的八字信息，我建议您保持积极的心态，相信自己的能力。如果您有更具体的问题，我可以为您提供更详细的解答。'
  },

  /**
   * 预约命理师咨询
   */
  consultMaster(e) {
    const master = e.currentTarget.dataset.master

    wx.showModal({
      title: '预约咨询',
      content: `确定预约${master.name}老师的咨询服务吗？费用为¥${master.price}/次`,
      success: (res) => {
        if (res.confirm) {
          // 跳转到预约页面或支付页面
          wx.navigateTo({
            url: `/pages/consult/consult?masterId=${master.id}&price=${master.price}`
          })
        }
      }
    })
  },

  /**
   * 分享分析结果
   */
  shareAnalysis() {
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
   * 保存分析报告
   */
  async saveAnalysis() {
    if (!this.data.analysisResult) {
      wx.showToast({
        title: '暂无分析结果',
        icon: 'none'
      })
      return
    }

    try {
      const reports = wx.getStorageSync('analysisReports') || []
      const newReport = {
        id: Date.now(),
        chartData: this.data.chartData,
        analysisResult: this.data.analysisResult,
        chatMessages: this.data.chatMessages,
        createTime: new Date().toLocaleString()
      }

      reports.unshift(newReport)

      // 最多保存20个报告
      if (reports.length > 20) {
        reports.splice(20)
      }

      wx.setStorageSync('analysisReports', reports)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('保存失败：', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: 'AI智能八字解读报告',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-analysis.png'
    }
  }
})