const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    // Support multiple LLM providers
    this.provider = process.env.LLM_PROVIDER || 'zhipu'; // 'openai', 'zhipu', or 'nim_minimax'
    this.apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    this.model = process.env.LLM_MODEL || 'glm-4-flash';

    // Set base URL based on provider
    if (this.provider === 'zhipu') {
      this.baseURL = 'https://open.bigmodel.cn/api/paas/v4';
    } else if (this.provider === 'nim_minimax') {
      this.baseURL = 'https://integrate.api.nvidia.com/v1';
    } else {
      this.baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    }
  }

  /**
   * Generate comprehensive analysis for a BaZi chart
   */
  async generateAnalysis(chartData, options = {}) {
    try {
      const { analysisType = 'comprehensive', focusAreas = [], userPreferences = {} } = options;

      logger.info('[AI Service] generateAnalysis started', {
        analysisType,
        baziString: chartData.baziString || 'N/A',
        dayTiangan: chartData.dayTiangan || 'N/A',
        focusAreas
      });

      // Build analysis prompt
      const prompt = this.buildAnalysisPrompt(chartData, analysisType, focusAreas);

      // Call OpenAI API
      const startTime = Date.now();
      const response = await this.callOpenAI(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });
      const elapsed = Date.now() - startTime;

      logger.info('[AI Service] generateAnalysis LLM call completed', {
        analysisType,
        elapsedMs: elapsed
      });

      // Parse and structure the response
      return this.parseAnalysisResponse(response, chartData);

    } catch (error) {
      logger.error('[AI Service] generateAnalysis failed, falling back to mock', {
        errorMessage: error.message,
        errorStack: error.stack
      });

      // Fallback to local mock analysis
      return this.generateMockAnalysis(chartData, options);
    }
  }

  /**
   * Generate chat response for interactive analysis
   */
  async generateChatResponse(message, chartData, options = {}) {
    const messageSummary = message && message.length > 50 ? message.substring(0, 50) + '...' : message;
    logger.info('[AI Service] generateChatResponse started', {
      messageSummary,
      baziString: chartData.baziString || 'N/A'
    });

    try {
      const { sessionHistory = [], userPreferences = {} } = options;

      const prompt = this.buildChatPrompt(message, chartData, sessionHistory);

      const startTime = Date.now();
      const response = await this.callOpenAI(prompt, {
        temperature: 0.8,
        maxTokens: 800
      });
      const elapsed = Date.now() - startTime;

      logger.info('[AI Service] generateChatResponse succeeded', {
        elapsedMs: elapsed,
        responseLength: response.content ? response.content.length : 0,
        tokens: response.usage?.total_tokens || 0
      });

      return {
        content: response.content,
        tokens: response.usage?.total_tokens || 0,
        model: this.model,
        confidence: 0.8
      };

    } catch (error) {
      logger.error('[AI Service] generateChatResponse failed, falling back to mock', {
        messageSummary,
        errorMessage: error.message
      });

      // Fallback to mock response
      return {
        content: this.generateMockChatResponse(message),
        tokens: 0,
        model: 'mock',
        confidence: 0.6
      };
    }
  }

  /**
   * Call LLM API (supports OpenAI, Zhipu GLM, and other providers)
   */
  async callOpenAI(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error(`${this.provider} API key not configured`);
    }

    logger.info('[AI Service] callOpenAI request', {
      provider: this.provider,
      model: this.model,
      baseURL: this.baseURL,
      promptLength: prompt ? prompt.length : 0,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000
    });

    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: '你是一位资深的八字命理师，拥有深厚的传统命理学知识和现代心理学理解。请用专业、准确、易懂的语言为用户提供八字分析。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      top_p: this.provider === 'nim_minimax' ? 0.95 : 1
    };

    // Add max_tokens for OpenAI and NIM providers, not needed for Zhipu GLM
    if (this.provider !== 'zhipu') {
      requestBody.max_tokens = options.maxTokens || (this.provider === 'nim_minimax' ? 8192 : 1000);
      if (this.provider !== 'nim_minimax') {
        requestBody.frequency_penalty = 0;
        requestBody.presence_penalty = 0;
      }
    }

    const startTime = Date.now();
    let response;
    try {
      response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const status = error.response ? error.response.status : 'N/A';
      const errorData = error.response ? error.response.data : null;
      logger.error('[AI Service] callOpenAI request failed', {
        provider: this.provider,
        model: this.model,
        elapsedMs: elapsed,
        httpStatus: status,
        errorMessage: error.message,
        errorData: errorData
      });
      throw error;
    }

    const elapsed = Date.now() - startTime;
    const usage = response.data.usage || {};
    logger.info('[AI Service] callOpenAI response received', {
      provider: this.provider,
      model: this.model,
      elapsedMs: elapsed,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      responseContentLength: (response.data.choices[0].message.content || '').length
    });

    let content = response.data.choices[0].message.content || '';
    // Strip <think>...</think> blocks from reasoning models (e.g. MiniMAX-m2.1)
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return {
      content,
      usage: response.data.usage
    };
  }

  /**
   * Build analysis prompt for OpenAI
   */
  buildAnalysisPrompt(chartData, analysisType, focusAreas) {
    const { pillars, dayTiangan, wuxingStats, shishen, baziString, birthInfo } = chartData;

    const basePrompt = `
请分析以下八字命盘：

基本信息：
- 姓名：${birthInfo.name || '匿名'}
- 性别：${birthInfo.gender === 'male' ? '男' : '女'}
- 出生时间：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${birthInfo.hour}时
- 八字：${baziString}
- 日干：${dayTiangan}

四柱详情：
年柱：${pillars[0]?.tiangan}${pillars[0]?.dizhi}
月柱：${pillars[1]?.tiangan}${pillars[1]?.dizhi}
日柱：${pillars[2]?.tiangan}${pillars[2]?.dizhi}
时柱：${pillars[3]?.tiangan}${pillars[3]?.dizhi}

五行分布：
${wuxingStats.map(stat => `${stat.name}：${stat.count} (${stat.strength})`).join('\n')}

十神关系：
${shishen.map(s => `${s.position}：${s.name}`).join('\n')}
`;

    let specificPrompt = '';

    switch (analysisType) {
      case 'comprehensive':
        specificPrompt = `
请提供全面的命理分析，包括：
1. 性格特征分析（至少100字）
2. 事业发展方向（至少80字）
3. 财运状况（至少80字）
4. 感情婚姻（至少80字）
5. 健康状况（至少60字）
6. 开运建议

【重要】你必须严格按照以下JSON格式返回，不要添加任何其他文字说明，直接输出JSON：
{"personality":"性格分析文本","career":"事业分析文本","careerTags":["职业1","职业2","职业3"],"wealth":"财运分析文本","wealthScore":85,"relationship":"感情分析文本","loveScore":78,"health":"健康分析文本","healthTips":["健康建议1","健康建议2"],"suggestions":[{"category":"颜色开运","items":["建议1","建议2"]},{"category":"方位开运","items":["建议1","建议2"]}],"confidence":88}`;
        break;

      case 'career':
        specificPrompt = `
请重点分析事业发展方向，包括：
1. 适合的行业和职业
2. 事业发展的关键时期
3. 职业发展建议
4. 创业适合性分析
`;
        break;

      default:
        specificPrompt = basePrompt;
    }

    return basePrompt + specificPrompt;
  }

  /**
   * Build chat prompt for interactive analysis
   */
  buildChatPrompt(message, chartData, sessionHistory) {
    const { baziString, dayTiangan } = chartData;

    const historyContext = sessionHistory.slice(-5).map(msg =>
      `${msg.type === 'user' ? '用户' : 'AI'}：${msg.content}`
    ).join('\n');

    return `
基于用户的八字：${baziString}（日干：${dayTiangan}）

对话历史：
${historyContext}

用户问题：${message}

请基于八字命理知识，结合对话上下文，给出专业、准确、有针对性的回答。回答要简洁明了，不超过200字。
`;
  }

  /**
   * Parse AI analysis response
   */
  parseAnalysisResponse(response, chartData) {
    const content = response.content || '';

    // Step 1: Remove markdown code fences
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Step 2: Try direct parse
    let parsed = this.tryParseJSON(cleaned);

    if (parsed) {
      logger.info('[AI Service] parseAnalysisResponse: JSON direct parse succeeded', {
        contentLength: content.length
      });
    }

    // Step 3: Extract JSON object from mixed text
    if (!parsed) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = this.tryParseJSON(match[0]);
        if (parsed) {
          logger.info('[AI Service] parseAnalysisResponse: JSON extracted via regex', {
            contentLength: content.length
          });
        }
      }
    }

    // Step 4: If JSON parsed successfully, merge with defaults and return
    if (parsed && typeof parsed === 'object') {
      return {
        personality: parsed.personality || '',
        career: parsed.career || '',
        careerTags: Array.isArray(parsed.careerTags) ? parsed.careerTags : [],
        wealth: parsed.wealth || '',
        wealthScore: Number(parsed.wealthScore) || 75,
        relationship: parsed.relationship || '',
        loveScore: Number(parsed.loveScore) || 75,
        health: parsed.health || '',
        healthTips: Array.isArray(parsed.healthTips) ? parsed.healthTips : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        confidence: Number(parsed.confidence) || 85,
        model: this.model,
        timestamp: new Date()
      };
    }

    // Step 5: LLM returned plain text — wrap it as the analysis content
    if (content.length > 50) {
      logger.warn('[AI Service] parseAnalysisResponse: JSON parse failed, wrapping plain text as analysis', {
        contentLength: content.length
      });
      return {
        personality: content,
        career: '',
        careerTags: [],
        wealth: '',
        wealthScore: 75,
        relationship: '',
        loveScore: 75,
        health: '',
        healthTips: [],
        suggestions: [],
        confidence: 80,
        model: this.model,
        timestamp: new Date()
      };
    }

    // Step 6: Fallback to mock
    logger.warn('[AI Service] parseAnalysisResponse: all parsing strategies failed, falling back to mock', {
      contentLength: content.length
    });
    return this.generateMockAnalysis(chartData);
  }

  tryParseJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate mock analysis (fallback)
   */
  generateMockAnalysis(chartData, options = {}) {
    logger.warn('[AI Service] generateMockAnalysis: using mock fallback for analysis', {
      dayTiangan: chartData.dayTiangan || 'N/A',
      baziString: chartData.baziString || 'N/A'
    });

    const { dayTiangan, wuxingStats, birthInfo } = chartData;

    const personalityMap = {
      '甲': '您性格坚韧不拔，如大树般挺拔向上，具有强烈的领导欲望和开拓精神。',
      '乙': '您性格温和柔韧，如花草般清雅秀美，具有很强的适应能力和包容心。',
      '丙': '您性格热情开朗，如太阳般光明磊落，具有很强的感染力和创造力。',
      '丁': '您性格细腻敏感，如烛火般温暖人心，具有很强的洞察力和艺术天赋。',
      '戊': '您性格稳重踏实，如大山般厚德载物，具有很强的责任心和包容力。',
      '己': '您性格温和谦逊，如沃土般滋养万物，具有很强的服务精神和奉献意识。',
      '庚': '您性格刚强果断，如利剑般锋芒毕露，具有很强的执行力和决断力。',
      '辛': '您性格精致细腻，如珠宝般珍贵美丽，具有很强的审美能力和品味。',
      '壬': '您性格包容大度，如江河般奔流不息，具有很强的智慧和变通能力。',
      '癸': '您性格内敛深沉，如露水般润物无声，具有很强的感知力和直觉。'
    };

    const strongestElement = wuxingStats[0];
    const weakestElement = wuxingStats[wuxingStats.length - 1];

    return {
      confidence: Math.floor(Math.random() * 15) + 75,
      personality: personalityMap[dayTiangan] || '您的性格特征需要进一步分析。',
      career: this.getCareerAnalysis(dayTiangan),
      careerTags: this.getCareerTags(dayTiangan),
      wealth: this.getWealthAnalysis(strongestElement),
      wealthScore: Math.floor(Math.random() * 30) + 60,
      relationship: this.getRelationshipAnalysis(dayTiangan, birthInfo.gender),
      loveScore: Math.floor(Math.random() * 30) + 65,
      health: this.getHealthAnalysis(weakestElement),
      healthTips: this.getHealthTips(weakestElement),
      suggestions: this.getSuggestions(dayTiangan),
      timestamp: new Date()
    };
  }

  /**
   * Generate mock chat response
   */
  generateMockChatResponse(message) {
    const responses = {
      '性格': '根据您的八字分析，您具有坚韧不拔的性格特质，做事有始有终，但有时可能过于固执己见。',
      '运势': '您今年的整体运势呈上升趋势，特别是在事业方面会有不错的发展机会。',
      '职业': '从命盘来看，您适合从事需要耐心和细致的工作，如教育、咨询、技术研发等领域。',
      '桃花': '您的桃花运在下半年会有所提升，可能会遇到心仪的对象。建议多参加社交活动。',
      '健康': '需要特别注意肠胃方面的健康，建议规律饮食，避免暴饮暴食。',
      '财运': '您的财运与人际关系密切相关，通过合作或人脉介绍可能会有不错的收入机会。'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response;
      }
    }

    return '感谢您的提问。根据您的八字信息，我建议您保持积极的心态，相信自己的能力。如果您有更具体的问题，我可以为您提供更详细的解答。';
  }

  // Helper methods for mock analysis
  getCareerAnalysis(dayTiangan) {
    const careerMap = {
      '甲': '适合从事管理、领导类工作，在企业管理、政府部门或自主创业方面有很好的发展潜力。',
      '乙': '适合从事艺术、文化、教育类工作，在设计、写作、咨询等创意性行业表现突出。',
      '丙': '适合从事销售、公关、娱乐类工作，在市场营销、媒体传播、表演艺术等领域发展良好。'
    };
    return careerMap[dayTiangan] || '您的职业发展需要结合具体情况进一步分析。';
  }

  getCareerTags(dayTiangan) {
    const tagMap = {
      '甲': ['管理者', '领导者', '创业家'],
      '乙': ['艺术家', '教育者', '设计师'],
      '丙': ['销售员', '主持人', '营销专家']
    };
    return tagMap[dayTiangan] || ['多元发展'];
  }

  getWealthAnalysis(strongestElement) {
    return '您的财运整体较为平稳，通过勤奋努力可以获得稳定的收入。适合进行稳健的理财规划。';
  }

  getRelationshipAnalysis(dayTiangan, gender) {
    return gender === 'male' ?
      '您在感情中比较主动，容易吸引异性的注意，对感情比较专一。' :
      '您在感情中比较温柔体贴，是很好的伴侣人选，对感情有自己的标准。';
  }

  getHealthAnalysis(weakestElement) {
    const healthMap = {
      '金': '需要注意呼吸系统和皮肤方面的健康问题。',
      '木': '需要注意肝胆和神经系统的健康。',
      '水': '需要注意肾脏和泌尿系统的健康。',
      '火': '需要注意心血管和精神方面的健康。',
      '土': '需要注意脾胃消化系统的健康。'
    };
    return healthMap[weakestElement.name] || '整体健康状况良好，注意劳逸结合即可。';
  }

  getHealthTips(weakestElement) {
    const tipsMap = {
      '金': ['多吃白色食物', '进行呼吸练习'],
      '木': ['早睡早起', '多吃绿色蔬菜'],
      '水': ['多喝温开水', '避免过度劳累'],
      '火': ['保持心情愉快', '适当静坐冥想'],
      '土': ['规律饮食', '细嚼慢咽']
    };
    return tipsMap[weakestElement.name] || ['保持良好作息', '均衡饮食'];
  }

  getSuggestions(dayTiangan) {
    return [
      {
        category: '颜色开运',
        items: ['多穿绿色或蓝色衣服', '使用木质或水晶饰品']
      },
      {
        category: '方位开运',
        items: ['办公桌面向东方或南方', '居住环境选择向阳的房间']
      }
    ];
  }
}

module.exports = new AIService();