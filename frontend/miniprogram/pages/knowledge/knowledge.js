Page({
  data: {
    activeCategory: 'tiangan',
    categories: [
      { id: 'tiangan', name: '天干' },
      { id: 'dizhi', name: '地支' },
      { id: 'wuxing', name: '五行' },
      { id: 'shishen', name: '十神' },
      { id: 'dayun', name: '大运流年' },
      { id: 'shensha', name: '神煞' }
    ],
    content: {
      tiangan: {
        title: '天干详解',
        desc: '天干共十个，分别代表不同的阴阳五行属性，是八字排盘的核心元素之一。',
        items: [
          { name: '甲', wuxing: '木', yin_yang: '阳', desc: '参天大树，代表生长、开拓、进取，性格刚直，领导力强。', color: '#228B22' },
          { name: '乙', wuxing: '木', yin_yang: '阴', desc: '藤蔓花草，代表柔韧、适应、美丽，性格温柔，擅长变通。', color: '#228B22' },
          { name: '丙', wuxing: '火', yin_yang: '阳', desc: '太阳烈火，代表热情、光明、外向，性格开朗，感染力强。', color: '#DC143C' },
          { name: '丁', wuxing: '火', yin_yang: '阴', desc: '烛火灯焰，代表温暖、细腻、艺术，性格温婉，内心丰富。', color: '#DC143C' },
          { name: '戊', wuxing: '土', yin_yang: '阳', desc: '高山厚土，代表稳重、包容、信义，性格踏实，可靠厚道。', color: '#8B4513' },
          { name: '己', wuxing: '土', yin_yang: '阴', desc: '田园沃土，代表孕育、细心、务实，性格内敛，善于经营。', color: '#8B4513' },
          { name: '庚', wuxing: '金', yin_yang: '阳', desc: '刀剑金属，代表刚强、果断、正义，性格耿直，执行力强。', color: '#B8860B' },
          { name: '辛', wuxing: '金', yin_yang: '阴', desc: '珠宝首饰，代表精致、洁净、敏感，性格追求完美，审美高。', color: '#B8860B' },
          { name: '壬', wuxing: '水', yin_yang: '阳', desc: '江河大海，代表智慧、流动、包容，性格聪明，适应力强。', color: '#4169E1' },
          { name: '癸', wuxing: '水', yin_yang: '阴', desc: '雨露甘泉，代表滋润、灵动、内敛，性格体贴，直觉敏锐。', color: '#4169E1' }
        ]
      },
      dizhi: {
        title: '地支详解',
        desc: '地支共十二个，对应十二生肖与月份，包含丰富的藏干信息。',
        items: [
          { name: '子', shengxiao: '鼠', month: '十一月', time: '23-01时', wuxing: '水', desc: '智慧机敏，好奇心强，善于应变。藏干：癸水。', color: '#4169E1' },
          { name: '丑', shengxiao: '牛', month: '十二月', time: '01-03时', wuxing: '土', desc: '踏实勤奋，意志坚定，耐力极强。藏干：己土、癸水、辛金。', color: '#8B4513' },
          { name: '寅', shengxiao: '虎', month: '正月', time: '03-05时', wuxing: '木', desc: '勇猛进取，魄力过人，领导力强。藏干：甲木、丙火、戊土。', color: '#228B22' },
          { name: '卯', shengxiao: '兔', month: '二月', time: '05-07时', wuxing: '木', desc: '温柔机敏，文艺气质，人缘极好。藏干：乙木。', color: '#228B22' },
          { name: '辰', shengxiao: '龙', month: '三月', time: '07-09时', wuxing: '土', desc: '才华横溢，理想远大，个性鲜明。藏干：戊土、乙木、癸水。', color: '#8B4513' },
          { name: '巳', shengxiao: '蛇', month: '四月', time: '09-11时', wuxing: '火', desc: '深沉睿智，洞察力强，神秘气质。藏干：丙火、庚金、戊土。', color: '#DC143C' },
          { name: '午', shengxiao: '马', month: '五月', time: '11-13时', wuxing: '火', desc: '热情奔放，自由独立，行动力强。藏干：丁火、己土。', color: '#DC143C' },
          { name: '未', shengxiao: '羊', month: '六月', time: '13-15时', wuxing: '土', desc: '温和善良，富有同情心，艺术气质。藏干：己土、丁火、乙木。', color: '#8B4513' },
          { name: '申', shengxiao: '猴', month: '七月', time: '15-17时', wuxing: '金', desc: '聪明伶俐，创新思维，多才多艺。藏干：庚金、壬水、戊土。', color: '#B8860B' },
          { name: '酉', shengxiao: '鸡', month: '八月', time: '17-19时', wuxing: '金', desc: '精明能干，完美主义，审美超群。藏干：辛金。', color: '#B8860B' },
          { name: '戌', shengxiao: '狗', month: '九月', time: '19-21时', wuxing: '土', desc: '忠诚可靠，责任心强，正义感强。藏干：戊土、辛金、丁火。', color: '#8B4513' },
          { name: '亥', shengxiao: '猪', month: '十月', time: '21-23时', wuxing: '水', desc: '温厚善良，宽容大度，享乐主义。藏干：壬水、甲木。', color: '#4169E1' }
        ]
      },
      wuxing: {
        title: '五行详解',
        desc: '金木水火土五行相生相克，构成宇宙万物运行的基本规律。',
        items: [
          { name: '木', symbol: '🌿', color: '#228B22', sheng: '火', ke: '土', desc: '代表生长、仁慈、东方、春季。性格：仁爱、进取、条理清晰。职业宜：教育、文化、农业、设计。', tiangan: '甲、乙', dizhi: '寅、卯' },
          { name: '火', symbol: '🔥', color: '#DC143C', sheng: '土', ke: '金', desc: '代表热情、礼仪、南方、夏季。性格：热情、光明、表达强烈。职业宜：演艺、餐饮、能源、销售。', tiangan: '丙、丁', dizhi: '巳、午' },
          { name: '土', symbol: '⛰️', color: '#8B4513', sheng: '金', ke: '水', desc: '代表稳重、信义、中央、四季末。性格：踏实、包容、有责任感。职业宜：房地产、农业、建筑、金融。', tiangan: '戊、己', dizhi: '辰戌丑未' },
          { name: '金', symbol: '✨', color: '#B8860B', sheng: '水', ke: '木', desc: '代表刚强、义气、西方、秋季。性格：果断、正义、执行力强。职业宜：法律、军警、金融、冶炼。', tiangan: '庚、辛', dizhi: '申、酉' },
          { name: '水', symbol: '💧', color: '#4169E1', sheng: '木', ke: '火', desc: '代表智慧、灵活、北方、冬季。性格：聪慧、灵动、适应力强。职业宜：科研、哲学、航海、贸易。', tiangan: '壬、癸', dizhi: '亥、子' }
        ]
      },
      shishen: {
        title: '十神详解',
        desc: '十神是八字分析的核心，反映命主的性格、六亲关系和各方面运势。',
        items: [
          { name: '比肩', abbr: '比', type: 'sibling', desc: '与日主同五行同阴阳。代表兄弟朋友、竞争对手。影响：独立自主，竞争意识强，有固执倾向。' },
          { name: '劫财', abbr: '劫', type: 'sibling', desc: '与日主同五行异阴阳。代表兄弟竞争、财帛流失。影响：个性强势，善于竞争，有争夺之象。' },
          { name: '食神', abbr: '食', type: 'output', desc: '日主所生同阴阳。代表才华、口福、子女。影响：温和享乐，有才艺，善于表达美食与艺术。' },
          { name: '伤官', abbr: '伤', type: 'output', desc: '日主所生异阴阳。代表才华外露、克官。影响：聪明叛逆，才华横溢，不服管束。' },
          { name: '偏财', abbr: '偏财', type: 'wealth', desc: '日主所克异阴阳。代表偏财运、父亲。影响：财运灵活，善于投机，社交广泛。' },
          { name: '正财', abbr: '正财', type: 'wealth', desc: '日主所克同阴阳。代表正当财富、妻子（男）。影响：踏实勤奋，理财有道，正当求财。' },
          { name: '七杀', abbr: '七杀', type: 'power', desc: '克日主异阴阳。代表权力压力、挑战。影响：魄力过人，有领导才能，性格刚强。' },
          { name: '正官', abbr: '正官', type: 'power', desc: '克日主同阴阳。代表官职、丈夫（女）。影响：守法重礼，责任心强，仕途顺遂。' },
          { name: '偏印', abbr: '枭', type: 'resource', desc: '生日主异阴阳。代表智慧、偏门技艺。影响：思维独特，有孤独感，研究能力强。' },
          { name: '正印', abbr: '印', type: 'resource', desc: '生日主同阴阳。代表学问、母亲。影响：温文儒雅，学习能力强，慈悲心重。' }
        ]
      },
      dayun: {
        title: '大运流年基础',
        desc: '大运是每10年一换的运势主题，流年是当年运势，两者配合命局分析吉凶。',
        items: [
          { name: '起运年龄', desc: '男命阳年生顺数、阴年生逆数；女命阳年生逆数、阴年生顺数。从出生日到最近的节气天数除以3，即为起运年龄。' },
          { name: '大运顺序', desc: '男阳女阴从月柱天干顺序排，男阴女阳逆排。每步大运管10年，细分上半5年看天干，下半5年看地支。' },
          { name: '流年分析', desc: '流年天干克制大运或日元为凶年，流年与大运相合相生为吉年。重大事件需命局、大运、流年三者同看。' },
          { name: '岁运并临', desc: '流年与大运天干地支形成三合、六合、三会时，该年运势特别旺盛，往往是人生重要转折点。' },
          { name: '太岁', desc: '流年地支即太岁。犯太岁（与年支相冲）需注意健康、家庭、事业变动；值太岁（与年支相同）也需谨慎。' },
          { name: '神煞与大运', desc: '大运逢驿马星主迁移变动，逢桃花星主感情，逢将星主权力地位，逢华盖星主学术宗教缘分。' }
        ]
      },
      shensha: {
        title: '常见神煞',
        desc: '神煞是根据命局各柱推算出的特殊星曜，影响命主的特定方面。',
        items: [
          { name: '天乙贵人', symbol: '贵', desc: '最吉祥的贵人星。逢天乙贵人年月日，常遇贵人相助，化险为夷，仕途顺利。甲戊见丑未，乙己见子申，庚辛见寅午，壬癸见巳卯，丙丁见酉亥。' },
          { name: '文昌贵人', symbol: '文', desc: '主聪明才学。逢文昌贵人利于考试、学业、著书立说，多出文人学士。甲巳乙午，丙戊申，丁己酉，庚亥辛子，壬寅癸卯。' },
          { name: '驿马', symbol: '马', desc: '主迁移变动奔波。命中有驿马，一生多外出机会，适合从事旅游、运输、外贸等行业。逢驿马年容易迁居、出行。' },
          { name: '桃花', symbol: '桃', desc: '又称咸池，主感情魅力。命中有桃花者异性缘好，魅力十足。子年生午卯酉，丑年生戌未辰，寅年生亥申巳，卯年生子酉午。' },
          { name: '将星', symbol: '将', desc: '主权力领导。命中有将星者，有统御能力，适合担任领导职务。子午卯酉日见，辰戌丑未日见，寅申巳亥日见。' },
          { name: '华盖', symbol: '华', desc: '主孤独与才艺。命中有华盖者，聪明有才艺，但也有孤独倾向，宜从事学术、艺术、宗教方面工作。' },
          { name: '空亡', symbol: '空', desc: '又称"旬空"，被空亡的天干无力。命中六亲被空亡，该六亲缘分较薄；用神被空亡，需特别注意相关方面。' },
          { name: '羊刃', symbol: '刃', desc: '强旺有力之象，也主刀伤血光。命带羊刃者性格刚烈，意志坚强，宜从事医、军、法等职业，可化刃为用。' }
        ]
      }
    }
  },

  onLoad() {
    console.log('学习页面加载')
  },

  switchCategory(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ activeCategory: id })
  }
})
