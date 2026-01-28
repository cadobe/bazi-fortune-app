/**
 * 八字排盘核心算法模块
 * 包含农历转换、干支计算、排盘等核心功能
 */

// 天干地支数据
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const SHICHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']

// 五行对应
const WUXING_TIANGAN = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

const WUXING_DIZHI = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

// 纳音表
const NAYIN_TABLE = {
  '甲子乙丑': '海中金', '丙寅丁卯': '炉中火', '戊辰己巳': '大林木',
  '庚午辛未': '路旁土', '壬申癸酉': '剑锋金', '甲戌乙亥': '山头火',
  '丙子丁丑': '涧下水', '戊寅己卯': '城头土', '庚辰辛巳': '白蜡金',
  '壬午癸未': '杨柳木', '甲申乙酉': '泉中水', '丙戌丁亥': '屋上土',
  '戊子己丑': '霹雳火', '庚寅辛卯': '松柏木', '壬辰癸巳': '长流水',
  '甲午乙未': '砂中金', '丙申丁酉': '山下火', '戊戌己亥': '平地木',
  '庚子辛丑': '壁上土', '壬寅癸卯': '金箔金', '甲辰乙巳': '覆灯火',
  '丙午丁未': '天河水', '戊申己酉': '大驿土', '庚戌辛亥': '钗钏金',
  '壬子癸丑': '桑柘木', '甲寅乙卯': '大溪水', '丙辰丁巳': '沙中土',
  '戊午己未': '天上火', '庚申辛酉': '石榴木', '壬戌癸亥': '大海水'
}

// 十神对应表（以日干为主）
const SHISHEN_MAP = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
}

// 地支藏干表
const DIZHI_CANGGAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
}

class BaziCalculator {
  constructor() {
    this.solarTerms = this.initSolarTerms()
  }

  /**
   * 初始化节气数据
   */
  initSolarTerms() {
    // 24节气的近似日期（平年）
    return [
      { name: '立春', date: [2, 4] },
      { name: '雨水', date: [2, 19] },
      { name: '惊蛰', date: [3, 6] },
      { name: '春分', date: [3, 21] },
      { name: '清明', date: [4, 5] },
      { name: '谷雨', date: [4, 20] },
      { name: '立夏', date: [5, 6] },
      { name: '小满', date: [5, 21] },
      { name: '芒种', date: [6, 6] },
      { name: '夏至', date: [6, 22] },
      { name: '小暑', date: [7, 7] },
      { name: '大暑', date: [7, 23] },
      { name: '立秋', date: [8, 8] },
      { name: '处暑', date: [8, 23] },
      { name: '白露', date: [9, 8] },
      { name: '秋分', date: [9, 23] },
      { name: '寒露', date: [10, 8] },
      { name: '霜降', date: [10, 24] },
      { name: '立冬', date: [11, 8] },
      { name: '小雪', date: [11, 22] },
      { name: '大雪', date: [12, 7] },
      { name: '冬至', date: [12, 22] },
      { name: '小寒', date: [1, 6] },
      { name: '大寒', date: [1, 20] }
    ]
  }

  /**
   * 计算年柱
   * @param {number} year 年份
   * @param {number} month 月份
   * @param {number} day 日期
   * @returns {object} 年柱信息
   */
  getYearPillar(year, month, day) {
    // 立春前算上一年
    const lichunDate = this.getSolarTermDate(year, '立春')
    const currentDate = new Date(year, month - 1, day)

    let actualYear = year
    if (currentDate < lichunDate) {
      actualYear = year - 1
    }

    const tianganIndex = (actualYear - 4) % 10
    const dizhiIndex = (actualYear - 4) % 12

    return {
      tiangan: TIANGAN[tianganIndex],
      dizhi: DIZHI[dizhiIndex],
      wuxing: WUXING_TIANGAN[TIANGAN[tianganIndex]] + WUXING_DIZHI[DIZHI[dizhiIndex]]
    }
  }

  /**
   * 计算月柱
   * @param {number} year 年份
   * @param {number} month 月份
   * @param {number} day 日期
   * @returns {object} 月柱信息
   */
  getMonthPillar(year, month, day) {
    // 获取当前日期对应的农历月份
    const solarMonth = this.getSolarMonth(year, month, day)
    const yearTiangan = this.getYearPillar(year, month, day).tiangan

    // 月干公式：甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚上，丁壬壬寅顺水流，若问戊癸何处起，甲寅之上好追求
    const monthTianganMap = {
      '甲': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
      '己': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
      '乙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
      '庚': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
      '丙': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
      '辛': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
      '丁': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
      '壬': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
      '戊': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
      '癸': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙']
    }

    const monthDizhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
    const tiangan = monthTianganMap[yearTiangan][solarMonth - 1]
    const dizhi = monthDizhi[solarMonth - 1]

    return {
      tiangan,
      dizhi,
      wuxing: WUXING_TIANGAN[tiangan] + WUXING_DIZHI[dizhi]
    }
  }

  /**
   * 计算日柱
   * @param {number} year 年份
   * @param {number} month 月份
   * @param {number} day 日期
   * @returns {object} 日柱信息
   */
  getDayPillar(year, month, day) {
    // 使用公历积日法计算
    const baseDate = new Date(1900, 0, 1) // 1900年1月1日为甲戌日
    const currentDate = new Date(year, month - 1, day)
    const daysDiff = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24))

    // 1900年1月1日对应甲戌日，甲为0，戌为10
    const baseTianganIndex = 0 // 甲
    const baseDizhiIndex = 10 // 戌

    const tianganIndex = (baseTianganIndex + daysDiff) % 10
    const dizhiIndex = (baseDizhiIndex + daysDiff) % 12

    return {
      tiangan: TIANGAN[tianganIndex],
      dizhi: DIZHI[dizhiIndex],
      wuxing: WUXING_TIANGAN[TIANGAN[tianganIndex]] + WUXING_DIZHI[DIZHI[dizhiIndex]]
    }
  }

  /**
   * 计算时柱
   * @param {number} hour 小时
   * @param {string} dayTiangan 日干
   * @returns {object} 时柱信息
   */
  getHourPillar(hour, dayTiangan) {
    // 时辰对应
    const shiIndex = Math.floor((hour + 1) / 2) % 12

    // 时干公式：甲己还是甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
    const hourTianganMap = {
      '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
      '己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
      '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
      '庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
      '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
      '辛': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
      '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
      '壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
      '戊': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
      '癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    }

    const tiangan = hourTianganMap[dayTiangan][shiIndex]
    const dizhi = DIZHI[shiIndex]

    return {
      tiangan,
      dizhi,
      wuxing: WUXING_TIANGAN[tiangan] + WUXING_DIZHI[dizhi],
      shichen: SHICHEN[shiIndex]
    }
  }

  /**
   * 获取节气日期
   * @param {number} year 年份
   * @param {string} termName 节气名称
   * @returns {Date} 节气日期
   */
  getSolarTermDate(year, termName) {
    const term = this.solarTerms.find(t => t.name === termName)
    if (!term) return null

    // 简化计算，实际应该使用更精确的天文算法
    return new Date(year, term.date[0] - 1, term.date[1])
  }

  /**
   * 获取节气月份
   * @param {number} year 年份
   * @param {number} month 月份
   * @param {number} day 日期
   * @returns {number} 节气月份
   */
  getSolarMonth(year, month, day) {
    const currentDate = new Date(year, month - 1, day)

    // 根据节气确定月份
    const solarMonths = [
      { start: [1, 6], end: [2, 4], month: 12 }, // 小寒到立春前为十二月
      { start: [2, 4], end: [3, 6], month: 1 },  // 立春到惊蛰前为一月
      { start: [3, 6], end: [4, 5], month: 2 },  // 惊蛰到清明前为二月
      { start: [4, 5], end: [5, 6], month: 3 },  // 清明到立夏前为三月
      { start: [5, 6], end: [6, 6], month: 4 },  // 立夏到芒种前为四月
      { start: [6, 6], end: [7, 7], month: 5 },  // 芒种到小暑前为五月
      { start: [7, 7], end: [8, 8], month: 6 },  // 小暑到立秋前为六月
      { start: [8, 8], end: [9, 8], month: 7 },  // 立秋到白露前为七月
      { start: [9, 8], end: [10, 8], month: 8 }, // 白露到寒露前为八月
      { start: [10, 8], end: [11, 8], month: 9 }, // 寒露到立冬前为九月
      { start: [11, 8], end: [12, 7], month: 10 }, // 立冬到大雪前为十月
      { start: [12, 7], end: [1, 6], month: 11 }   // 大雪到小寒前为十一月
    ]

    for (const solarMonth of solarMonths) {
      const startDate = new Date(year, solarMonth.start[0] - 1, solarMonth.start[1])
      let endDate = new Date(year, solarMonth.end[0] - 1, solarMonth.end[1])

      // 处理跨年情况
      if (solarMonth.month === 11 || solarMonth.month === 12) {
        if (solarMonth.end[0] === 1) {
          endDate = new Date(year + 1, solarMonth.end[0] - 1, solarMonth.end[1])
        }
      }

      if (currentDate >= startDate && currentDate < endDate) {
        return solarMonth.month
      }
    }

    return 1 // 默认返回1月
  }

  /**
   * 计算纳音
   * @param {string} tiangan 天干
   * @param {string} dizhi 地支
   * @returns {string} 纳音
   */
  getNayin(tiangan, dizhi) {
    const key = tiangan + dizhi
    for (const [pair, nayin] of Object.entries(NAYIN_TABLE)) {
      if (pair.includes(key)) {
        return nayin
      }
    }
    return '未知'
  }

  /**
   * 计算十神
   * @param {string} dayTiangan 日干
   * @param {string} targetTiangan 目标天干
   * @returns {string} 十神
   */
  getShishen(dayTiangan, targetTiangan) {
    return SHISHEN_MAP[dayTiangan]?.[targetTiangan] || '未知'
  }

  /**
   * 统计五行分布
   * @param {Array} pillars 四柱
   * @returns {Array} 五行统计
   */
  getWuxingStats(pillars) {
    const stats = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }

    pillars.forEach(pillar => {
      const tianganWuxing = WUXING_TIANGAN[pillar.tiangan]
      const dizhiWuxing = WUXING_DIZHI[pillar.dizhi]

      if (tianganWuxing) stats[tianganWuxing]++
      if (dizhiWuxing) stats[dizhiWuxing]++

      // 计算地支藏干的五行
      const canggan = DIZHI_CANGGAN[pillar.dizhi]
      if (canggan) {
        canggan.forEach(gan => {
          const wuxing = WUXING_TIANGAN[gan]
          if (wuxing) stats[wuxing] += 0.3 // 藏干权重较小
        })
      }
    })

    return Object.entries(stats).map(([element, count]) => ({
      name: element,
      element: element.toLowerCase(),
      count: Math.round(count * 10) / 10,
      strength: this.getWuxingStrength(count)
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * 获取五行强度描述
   * @param {number} count 数量
   * @returns {string} 强度描述
   */
  getWuxingStrength(count) {
    if (count >= 3) return '极旺'
    if (count >= 2.5) return '很旺'
    if (count >= 2) return '旺'
    if (count >= 1.5) return '平'
    if (count >= 1) return '弱'
    if (count >= 0.5) return '很弱'
    return '极弱'
  }

  /**
   * 真太阳时校正
   * @param {Date} date 原始时间
   * @param {number} longitude 经度
   * @returns {Date} 校正后时间
   */
  correctTrueSolarTime(date, longitude = 116.4) {
    // 简化的真太阳时校正算法
    const correction = (longitude - 120) * 4 // 每度经度4分钟时差
    return new Date(date.getTime() + correction * 60 * 1000)
  }

  /**
   * 主排盘函数
   * @param {object} birthInfo 出生信息
   * @returns {object} 命盘数据
   */
  generateChart(birthInfo) {
    const { year, month, day, hour, minute = 0, longitude = 116.4, useTrueSolarTime = false } = birthInfo

    let actualDate = new Date(year, month - 1, day, hour, minute)

    // 真太阳时校正
    if (useTrueSolarTime) {
      actualDate = this.correctTrueSolarTime(actualDate, longitude)
    }

    const correctedYear = actualDate.getFullYear()
    const correctedMonth = actualDate.getMonth() + 1
    const correctedDay = actualDate.getDate()
    const correctedHour = actualDate.getHours()

    // 计算四柱
    const yearPillar = this.getYearPillar(correctedYear, correctedMonth, correctedDay)
    const monthPillar = this.getMonthPillar(correctedYear, correctedMonth, correctedDay)
    const dayPillar = this.getDayPillar(correctedYear, correctedMonth, correctedDay)
    const hourPillar = this.getHourPillar(correctedHour, dayPillar.tiangan)

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]

    // 计算纳音
    const nayin = pillars.map((pillar, index) => ({
      pillar: ['年柱', '月柱', '日柱', '时柱'][index],
      value: this.getNayin(pillar.tiangan, pillar.dizhi)
    }))

    // 计算十神
    const dayTiangan = dayPillar.tiangan
    const shishen = pillars.map((pillar, index) => ({
      name: this.getShishen(dayTiangan, pillar.tiangan),
      position: ['年干', '月干', '日干', '时干'][index],
      element: pillar.tiangan
    }))

    // 五行统计
    const wuxingStats = this.getWuxingStats(pillars)

    // 生成八字字符串
    const baziString = pillars.map(p => p.tiangan + p.dizhi).join(' ')

    return {
      pillars,
      nayin,
      shishen,
      wuxingStats,
      baziString,
      dayTiangan,
      birthInfo: {
        ...birthInfo,
        actualDate: actualDate.toISOString(),
        shichen: hourPillar.shichen
      }
    }
  }
}

// 导出
module.exports = BaziCalculator

// 小程序环境导出
if (typeof module === 'undefined') {
  // 小程序环境
  const baziCalculator = new BaziCalculator()

  global.BaziCalculator = BaziCalculator
  global.baziCalculator = baziCalculator
}