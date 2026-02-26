// 黄历页面
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月']
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

// ── 农历查表数据（1900-2050）──
// 每项：[闰月序号(0=无), 月1..月N天数(1=30天,0=29天), 春节公历月, 春节公历日]
// 月份数量：无闰月=12项，有闰月=13项
const _LUNAR_DATA = [
  [8,1,0,1,0,1,0,1,1,0,0,1,0,1, 1,31],[0,0,1,0,1,0,1,0,1,1,0,1,0, 2,19],
  [5,0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 8],[0,1,0,1,0,0,1,0,1,0,1,1,0, 1,29],
  [2,1,0,1,1,0,0,1,0,1,0,1,0,1, 2,16],[0,1,0,1,0,1,0,0,1,0,1,0,1, 2, 4],
  [4,1,0,1,1,0,1,0,0,1,0,1,0,1, 1,25],[0,0,1,0,1,1,0,1,0,1,0,1,0, 2,13],
  [0,1,0,0,1,0,1,1,0,1,0,1,1, 2, 2],[2,0,1,0,0,1,0,1,0,1,0,1,1,0, 1,22],
  [0,1,0,1,0,0,1,0,1,0,1,0,1, 2,10],[6,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,30],
  [0,1,0,1,0,1,0,1,0,1,0,0,1, 2,18],[0,1,1,0,1,0,1,1,0,1,0,0,1, 2, 6],
  [5,0,1,0,1,0,1,1,0,1,1,0,0,1, 1,26],[0,0,1,0,1,0,1,0,1,1,0,1,0, 2,14],
  [0,1,0,0,1,0,1,0,1,1,0,1,1, 2, 3],[2,0,1,0,0,1,0,0,1,0,1,1,0,1, 1,23],
  [0,1,0,1,0,0,1,0,0,1,0,1,0, 2,11],[7,1,0,1,1,0,1,0,0,1,0,1,0,1, 2, 1],
  [0,0,1,0,1,1,0,1,0,0,1,0,1, 2,20],[0,0,1,0,1,0,1,1,0,1,0,1,0, 2, 8],
  [5,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,28],[0,0,1,0,0,1,0,1,0,1,1,0,1, 2,16],
  [0,0,1,1,0,0,1,0,1,0,1,1,0, 2, 5],[4,1,0,1,0,1,0,0,1,0,1,0,1,1, 1,24],
  [0,0,1,0,1,0,1,0,0,1,0,1,0, 2,13],[0,1,1,0,1,0,1,0,0,1,0,1,0, 2, 2],
  [2,1,1,0,1,0,1,1,0,0,1,0,0,1, 1,23],[0,1,0,1,1,0,1,0,1,0,1,0,0, 2,10],
  [6,1,0,1,0,1,1,0,1,0,1,0,1,0, 1,30],[0,0,1,0,1,0,1,1,0,1,0,1,0, 2,17],
  [0,1,0,0,1,0,1,0,1,1,0,1,1, 2, 6],[5,0,1,0,0,1,0,1,0,1,0,1,1,0, 1,26],
  [0,1,0,1,0,0,1,0,1,0,0,1,1, 2,14],[0,0,1,1,0,1,0,0,1,0,1,0,1, 2, 4],
  [3,1,0,1,0,1,1,0,0,1,0,1,0,1, 1,24],[0,0,1,0,1,0,1,1,0,1,0,1,0, 2,11],
  [7,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,31],[0,0,1,0,0,1,0,1,0,1,1,0,1, 2,19],
  [0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 8],[6,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,27],
  [0,1,0,1,0,1,0,1,0,0,1,0,1, 2,15],[0,0,1,0,1,1,0,1,0,0,1,0,1, 2, 5],
  [4,1,0,1,0,1,0,1,1,0,0,1,0,0, 1,25],[0,1,0,1,0,1,0,1,1,0,1,0,1, 2,13],
  [0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 2],[2,1,0,1,0,0,1,0,1,0,1,0,1,0, 1,22],
  [0,1,1,0,1,0,0,1,0,0,1,0,1, 2,10],[7,0,1,1,0,1,0,0,1,0,1,0,1,0, 1,29],
  [0,1,0,1,1,0,1,0,1,0,1,0,1, 2,17],[0,0,1,0,1,0,1,1,0,1,0,1,0, 2, 6],
  [5,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,27],[0,0,1,0,0,1,0,1,0,1,1,0,1, 2,14],
  [0,0,1,1,0,0,1,0,1,0,1,1,0, 2, 3],[3,1,0,1,0,1,0,0,1,0,1,0,1,0, 1,24],
  [0,1,0,1,1,0,1,0,0,1,0,1,0, 2,12],[8,0,1,0,1,1,0,1,0,1,0,1,0,0, 1,31],
  [0,1,0,1,0,1,1,0,1,0,1,0,1, 2,18],[0,0,1,0,1,0,1,0,1,1,0,1,0, 2, 8],
  [6,1,0,0,1,0,1,0,1,0,1,1,0,1, 1,28],[0,0,1,0,0,1,0,1,0,1,0,1,1, 2,15],
  [0,0,1,1,0,0,1,0,0,1,0,1,1, 2, 5],[4,1,0,1,0,1,0,1,0,0,1,0,1,0, 1,25],
  [0,1,1,0,1,0,1,0,1,0,0,1,0, 2,13],[0,1,1,0,1,1,0,1,0,1,0,0,1, 2, 2],
  [3,0,1,0,1,1,0,1,0,1,0,1,0,0, 1,21],[0,1,0,1,0,1,0,1,1,0,1,0,1, 2, 9],
  [7,0,1,0,0,1,0,1,0,1,1,0,1,1, 1,30],[0,0,1,0,0,1,0,0,1,0,1,1,0, 2,17],
  [0,1,0,1,0,0,1,0,0,1,0,1,0, 2, 6],[5,1,1,0,1,0,0,1,0,1,0,1,0,1, 1,27],
  [0,0,1,1,0,1,0,1,0,1,0,1,0, 2,15],[0,1,0,1,0,1,0,1,0,1,0,1,0, 2, 3],
  [4,1,0,1,1,0,1,0,1,0,1,0,1,0, 1,23],[0,0,1,0,1,1,0,1,0,1,0,0,1, 2,11],
  [8,0,1,0,1,0,1,1,0,1,0,1,0,0, 1,31],[0,1,0,1,0,1,0,1,1,0,1,0,1, 2,18],
  [0,0,1,0,1,0,0,1,1,0,1,0,1, 2, 7],[6,1,0,1,0,1,0,0,1,0,1,1,0,1, 1,28],
  [0,0,1,0,1,0,1,0,0,1,0,1,1, 2,16],[0,0,1,0,1,0,1,0,0,1,0,1,0, 2, 5],
  [4,1,0,1,1,0,0,1,0,0,1,0,1,0, 1,25],[0,1,1,0,1,0,1,0,1,0,0,1,0, 2,13],
  [10,1,1,0,1,0,1,1,0,1,0,1,0,1, 2, 2],[0,0,1,0,1,0,1,0,1,1,0,1,0, 2,20],
  [0,1,0,0,1,0,0,1,0,1,1,0,1, 2, 9],[6,1,0,1,0,1,0,0,1,0,1,0,1,1, 1,29],
  [0,0,1,0,1,0,1,0,0,1,0,1,0, 2,17],[0,0,1,1,0,1,0,1,0,0,1,0,1, 2, 6],
  [5,0,1,0,1,1,0,1,0,1,0,0,1,0, 1,27],[0,1,0,1,0,1,1,0,1,0,1,0,1, 2,15],
  [0,0,1,0,0,1,1,0,1,0,1,0,1, 2, 4],[3,1,0,1,0,0,1,0,1,1,0,1,0,1, 1,23],
  [0,0,1,0,1,0,0,1,0,1,1,0,1, 2,10],[8,0,1,0,1,1,0,0,1,0,1,0,1,1, 1,31],
  [0,0,0,1,0,1,0,1,0,1,0,1,0, 2,19],[0,1,0,0,1,0,1,0,1,0,1,0,1, 2, 7],
  [5,1,0,1,0,1,0,1,0,1,0,1,0,0, 1,28],[0,1,1,0,1,0,1,0,1,0,1,0,1, 2,16],
  [0,0,1,1,0,1,0,1,0,1,0,0,1, 2, 5],[4,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,24],
  [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,12],[0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 1],
  [2,1,0,1,0,0,1,0,1,0,1,1,0,1, 1,22],[0,0,1,0,1,0,0,1,0,1,0,1,1, 2, 9],
  [7,0,1,0,1,0,1,0,0,1,0,1,0,1, 1,29],[0,1,0,1,0,1,0,1,0,0,1,0,1, 2,18],
  [0,0,1,0,1,1,0,1,0,1,0,0,1, 2, 7],[5,1,0,0,1,0,1,1,0,1,0,1,0,1, 1,26],
  [0,0,1,0,0,1,0,1,1,0,1,0,1, 2,14],[0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 3],
  [4,1,0,1,0,0,1,0,0,1,0,1,1,0, 1,23],[0,1,1,0,1,0,0,1,0,0,1,0,1, 2,10],
  [9,0,1,1,0,1,0,1,0,0,1,0,0,1, 1,31],[0,1,0,1,1,0,1,0,1,0,0,1,0, 2,19],
  [0,0,1,0,1,1,0,1,0,1,0,1,0, 2, 8],[6,1,0,0,1,0,1,1,0,1,0,1,0,1, 1,28],
  [0,0,1,0,0,1,0,1,1,0,1,0,1, 2,16],[0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 5],
  [4,1,0,1,0,0,1,0,0,1,0,1,1,0, 1,25],[0,1,1,0,1,0,0,1,0,0,1,0,1, 2,12],
  [0,0,1,1,0,1,0,1,0,1,0,0,1, 2, 1],[2,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,22],
  [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,10],[6,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,29],
  [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,17],[0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 6],
  [5,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,26],[0,1,0,1,0,1,0,1,0,0,1,0,1, 2,13],
  [0,1,0,1,1,0,1,0,1,0,0,1,0, 2, 3],[3,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,23],
  [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,11],[11,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,31],
  [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,19],[0,0,1,1,0,0,1,0,0,1,1,0,1, 2, 8],
  [6,1,0,1,0,1,0,1,0,0,1,0,1,0, 1,28],[0,1,1,0,1,0,1,0,1,0,0,1,0, 2,15],
  [0,1,0,1,1,0,1,0,1,0,1,0,0, 2, 4],[5,1,0,1,0,1,1,0,1,0,1,0,1,0, 1,24],
  [0,1,0,0,1,0,1,1,0,1,0,1,0, 2,12],[0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 1],
  [2,1,1,0,0,1,0,1,0,1,0,1,1,0, 1,22],[0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 9],
  [7,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,30],[0,1,0,1,0,1,0,1,0,0,1,0,1, 2,17],
  [0,0,1,0,1,1,0,1,0,1,0,0,1, 2, 6],[5,1,0,0,1,0,1,1,0,1,0,1,0,0, 1,26],
  [0,1,0,1,0,1,0,1,1,0,1,0,1, 2,14],[0,0,1,0,1,0,0,1,1,0,1,0,1, 2, 2],
  [3,1,0,1,0,1,0,0,1,0,1,1,0,1, 1,23]
]

/**
 * 将公历日期转为农历月日（查表法，覆盖1900-2050年）
 * @param {number} year  公历年
 * @param {number} month 公历月（1-12）
 * @param {number} day   公历日
 * @returns {{month:string, day:string, isLeap:boolean}}
 */
function getLunarDateAccurate(year, month, day) {
  const idx = year - 1900
  if (idx < 0 || idx >= _LUNAR_DATA.length) {
    // 超出范围，回退到简单估算
    return {
      month: LUNAR_MONTHS[(month + 10) % 12],
      day: LUNAR_DAYS[(day - 1) % 30],
      isLeap: false
    }
  }

  const data = _LUNAR_DATA[idx]
  const leapMonth = data[0]
  const sfMonth = data[data.length - 2]
  const sfDay = data[data.length - 1]

  // 春节公历日期
  const springFestival = new Date(year, sfMonth - 1, sfDay)
  const target = new Date(year, month - 1, day)

  // 当前日期在春节之前，属于上一个农历年
  let lunarYear = year
  let offset = Math.floor((target - springFestival) / 86400000)

  if (offset < 0) {
    // 在上一个农历年的春节之后
    lunarYear = year - 1
    const prevIdx = lunarYear - 1900
    if (prevIdx < 0 || prevIdx >= _LUNAR_DATA.length) {
      return {
        month: LUNAR_MONTHS[(month + 10) % 12],
        day: LUNAR_DAYS[(day - 1) % 30],
        isLeap: false
      }
    }
    const prevData = _LUNAR_DATA[prevIdx]
    const prevSfMonth = prevData[prevData.length - 2]
    const prevSfDay = prevData[prevData.length - 1]
    const prevSf = new Date(lunarYear, prevSfMonth - 1, prevSfDay)
    offset = Math.floor((target - prevSf) / 86400000)
    // 重新用上一年数据
    const prevLeap = prevData[0]
    const monthData = prevData.slice(1, prevData.length - 2)
    return _offsetToLunar(offset, prevLeap, monthData)
  }

  const monthData = data.slice(1, data.length - 2)
  return _offsetToLunar(offset, leapMonth, monthData)
}

/**
 * 内部辅助：将距春节的天数偏移转为农历月日
 */
function _offsetToLunar(offset, leapMonth, monthData) {
  let mNum = 1
  let leapInserted = false
  let remaining = offset

  for (let i = 0; i < monthData.length; i++) {
    const days = monthData[i] === 1 ? 30 : 29
    let isLeap = false

    // 检测是否该插入闰月（闰月插在正月 leapMonth 之后）
    if (!leapInserted && leapMonth > 0 && mNum - 1 === leapMonth) {
      isLeap = true
      leapInserted = true
      // 不推进 mNum，这是闰月
    } else {
      if (leapInserted || leapMonth === 0) {
        // 正常月
      }
    }

    if (remaining < days) {
      const mLabel = isLeap
        ? '闰' + LUNAR_MONTHS[leapMonth - 1]
        : LUNAR_MONTHS[mNum - 1]
      return {
        month: mLabel,
        day: LUNAR_DAYS[remaining],
        isLeap
      }
    }
    remaining -= days

    if (!isLeap) mNum++
  }

  // 回退
  return { month: LUNAR_MONTHS[0], day: LUNAR_DAYS[0], isLeap: false }
}

// 节气
const SOLAR_TERMS = {
  '1': { 5: '小寒', 20: '大寒' },
  '2': { 4: '立春', 19: '雨水' },
  '3': { 6: '惊蛰', 21: '春分' },
  '4': { 5: '清明', 20: '谷雨' },
  '5': { 6: '立夏', 21: '小满' },
  '6': { 6: '芒种', 21: '夏至' },
  '7': { 7: '小暑', 23: '大暑' },
  '8': { 7: '立秋', 23: '处暑' },
  '9': { 8: '白露', 23: '秋分' },
  '10': { 8: '寒露', 23: '霜降' },
  '11': { 7: '立冬', 22: '小雪' },
  '12': { 7: '大雪', 22: '冬至' }
}

// 宜忌数据（按黄历传统）
const YIJI_GOOD = ['祭祀', '祈福', '求嗣', '斋醮', '开光', '出行', '嫁娶', '订盟', '纳采', '移徙',
  '解除', '沐浴', '理发', '整手足甲', '入学', '拜师', '上官', '赴任', '经营', '交易',
  '立券', '开市', '纳财', '结网', '牧养', '纳畜', '破土', '安葬', '启攒', '修坟',
  '造庙', '起基', '动土', '上梁', '立柱', '开池', '穿井', '伐木', '栽种', '求医']
const YIJI_BAD = ['嫁娶', '移徙', '出行', '开市', '动土', '破土', '开仓', '安门', '修造',
  '词讼', '乘船', '架马', '行丧', '安葬', '掘井', '伐木', '作灶', '置产', '投资']

// 冲煞
const CHONG_MAP = { '子': '午马', '丑': '未羊', '寅': '申猴', '卯': '酉鸡', '辰': '戌狗', '巳': '亥猪', '午': '子鼠', '未': '丑牛', '申': '寅虎', '酉': '卯兔', '戌': '辰龙', '亥': '巳蛇' }

function getTianGanDiZhi(year, month, day) {
  // 简化天干地支计算
  const baseYear = 1984 // 甲子年
  const yearGanIdx = (year - baseYear + 60 * 100) % 10
  const yearZhiIdx = (year - baseYear + 60 * 100) % 12
  const yearGanzhi = TIAN_GAN[yearGanIdx] + DI_ZHI[yearZhiIdx]
  const shengxiao = SHENGXIAO[yearZhiIdx]

  // 月干支（简化）
  const monthOffset = (year - 1900) * 12 + (month - 1)
  const monthGanIdx = (monthOffset + 4 + 60 * 100) % 10  // 以寅月甲（1900年2月）为基准
  const monthZhiIdx = (month + 1) % 12  // 寅月=正月
  const monthGanzhi = TIAN_GAN[monthGanIdx] + DI_ZHI[monthZhiIdx]

  // 日干支（以2000-1-1为甲子日，距天数）
  const base = new Date(2000, 0, 1)
  const target = new Date(year, month - 1, day)
  const diffDays = Math.round((target - base) / 86400000)
  const dayGanIdx = (diffDays + 60 * 100) % 10
  const dayZhiIdx = (diffDays + 60 * 100) % 12
  const dayGanzhi = TIAN_GAN[dayGanIdx] + DI_ZHI[dayZhiIdx]
  const dayZhi = DI_ZHI[dayZhiIdx]

  return { yearGanzhi, monthGanzhi, dayGanzhi, shengxiao, dayZhi }
}

function getLunarDate(year, month, day) {
  return getLunarDateAccurate(year, month, day)
}

function getSolarTerm(month, day) {
  const terms = SOLAR_TERMS[String(month)]
  if (!terms) return ''
  for (const d in terms) {
    if (Math.abs(parseInt(d) - day) <= 1) return terms[d]
  }
  return ''
}

function getYiJi(dayZhi) {
  // 基于日支随机固定选取宜忌（每日不同）
  const seed = DI_ZHI.indexOf(dayZhi)
  const good = []
  const bad = []
  for (let i = 0; i < 5; i++) good.push(YIJI_GOOD[(seed * 3 + i * 7) % YIJI_GOOD.length])
  for (let i = 0; i < 4; i++) bad.push(YIJI_BAD[(seed * 2 + i * 5) % YIJI_BAD.length])
  // 去重
  return { yi: [...new Set(good)], ji: [...new Set(bad)] }
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const weeks = []
  let week = []

  // 填充空白
  for (let i = 0; i < firstDay; i++) week.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const lunar = getLunarDate(year, month, d)
    const term = getSolarTerm(month, d)
    week.push({
      day: d,
      lunarDay: term || lunar.day,
      isTerm: !!term,
      isToday: false
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

Page({
  data: {
    today: {},
    selectedDate: {},
    currentYear: 0,
    currentMonth: 0,
    calendarWeeks: [],
    ganzhi: {},
    lunarDate: {},
    yi: [],
    ji: [],
    chong: '',
    solarTerm: ''
  },

  onLoad() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      today: { year, month, day },
      currentYear: year,
      currentMonth: month
    })
    this.buildPage(year, month, day)
  },

  buildPage(year, month, day) {
    const ganzhi = getTianGanDiZhi(year, month, day)
    const lunarDate = getLunarDate(year, month, day)
    const { yi, ji } = getYiJi(ganzhi.dayZhi)
    const chong = CHONG_MAP[ganzhi.dayZhi] || ''
    const solarTerm = getSolarTerm(month, day)
    const calendarWeeks = buildCalendar(year, month)

    // 标记今日和选中日
    const { today } = this.data
    calendarWeeks.forEach(week => week.forEach(cell => {
      if (cell) {
        cell.isToday = (cell.day === today.day && month === today.month && year === today.year)
        cell.isSelected = (cell.day === day && month === this.data.currentMonth && year === this.data.currentYear)
      }
    }))

    this.setData({
      selectedDate: { year, month, day, weekDay: WEEK_DAYS[new Date(year, month - 1, day).getDay()] },
      calendarWeeks,
      ganzhi,
      lunarDate,
      yi,
      ji,
      chong,
      solarTerm
    })
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) { currentMonth = 12; currentYear-- }
    this.setData({ currentYear, currentMonth })
    this.buildPage(currentYear, currentMonth, 1)
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) { currentMonth = 1; currentYear++ }
    this.setData({ currentYear, currentMonth })
    this.buildPage(currentYear, currentMonth, 1)
  },

  selectDay(e) {
    const day = e.currentTarget.dataset.day
    if (!day) return
    const { currentYear, currentMonth } = this.data
    this.buildPage(currentYear, currentMonth, day)
  },

  goToday() {
    const { today } = this.data
    this.setData({ currentYear: today.year, currentMonth: today.month })
    this.buildPage(today.year, today.month, today.day)
  }
})
