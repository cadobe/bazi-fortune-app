const { request, ensureLogin } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    activeTab: 'hot',
    tabs: [
      { id: 'hot', name: '热门' },
      { id: 'latest', name: '最新' },
      { id: 'question', name: '问命' },
      { id: 'experience', name: '分享' }
    ],
    posts: [],
    isLoading: false,
    page: 1,
    hasMore: true,
    showPostModal: false,
    postForm: { title: '', content: '', category: 'experience' },
    // 模拟数据（后端未接社区接口时使用）
    mockPosts: [
      {
        id: 1, avatar: '👨', username: '命理爱好者',
        title: '八字中食神旺的人，一生口福和财运如何？',
        content: '最近研究了下食神，发现命中食神旺的朋友不仅口福好，偏财运也不错，大家有类似经历吗？',
        category: 'question', likes: 58, comments: 23, time: '2小时前', tags: ['食神', '财运']
      },
      {
        id: 2, avatar: '👩', username: '紫微斗数学员',
        title: '分享：我的八字大运转折点，真实经历记录',
        content: '壬水日元，今年走庚申大运，事业上感觉到了明显的变化，来和大家分享下我的实际体验...',
        category: 'experience', likes: 142, comments: 67, time: '5小时前', tags: ['大运', '壬水', '实例']
      },
      {
        id: 3, avatar: '🧙', username: '玄学老师',
        title: '【科普】为什么同八字的人命运会不同？',
        content: '经常有人问：双胞胎八字相同，命运为何不同？今天来系统解释下八字只是先天基础，后天环境、努力同样重要...',
        category: 'experience', likes: 389, comments: 156, time: '1天前', tags: ['入门', '科普']
      },
      {
        id: 4, avatar: '👴', username: '民间算命先生',
        title: '求帮看：日柱壬午，今年本命年需要注意什么？',
        content: '我是壬午日柱，今年马年，听说日柱逢流年相同会有较大变动，具体需要注意哪些方面？',
        category: 'question', likes: 34, comments: 18, time: '2天前', tags: ['日柱', '本命年']
      },
      {
        id: 5, avatar: '👩‍💻', username: '八字小白',
        title: '学了三个月八字，总结了几个容易搞错的知识点',
        content: '1. 日主强弱判断不能只看天干；2. 神煞不是越多越好；3. 大运比流年影响更持久...',
        category: 'experience', likes: 276, comments: 89, time: '3天前', tags: ['学习', '总结', '入门']
      },
      {
        id: 6, avatar: '🎓', username: '命理研究者',
        title: '官杀混杂的八字，真的一定不好吗？',
        content: '传统说法官杀混杂不吉，但我研究了大量案例发现，官杀混杂配合好的格局反而多出社会精英...',
        category: 'question', likes: 195, comments: 74, time: '4天前', tags: ['官杀', '格局']
      }
    ]
  },

  onLoad() {
    this.loadPosts()
  },

  onShow() {
    // 刷新帖子列表
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, posts: [], page: 1, hasMore: true })
    this.loadPosts()
  },

  loadPosts() {
    const { activeTab, page, mockPosts } = this.data
    this.setData({ isLoading: true })

    // 尝试从后端加载，失败则用模拟数据
    // 当前后端暂未实现社区接口，直接用模拟数据
    setTimeout(() => {
      let filtered = mockPosts
      if (activeTab === 'question') filtered = mockPosts.filter(p => p.category === 'question')
      else if (activeTab === 'experience') filtered = mockPosts.filter(p => p.category === 'experience')
      else if (activeTab === 'latest') filtered = [...mockPosts].sort((a, b) => b.id - a.id)

      this.setData({
        posts: filtered,
        isLoading: false,
        hasMore: false
      })
    }, 300)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 })
      this.loadPosts()
    }
  },

  likePost(e) {
    const id = e.currentTarget.dataset.id
    const posts = this.data.posts.map(p => {
      if (p.id === id) return { ...p, likes: p.likes + 1, liked: true }
      return p
    })
    this.setData({ posts })
  },

  openPostDetail(e) {
    const post = e.currentTarget.dataset.post
    wx.showModal({
      title: post.title,
      content: post.content + '\n\n点赞：' + post.likes + ' | 评论：' + post.comments,
      showCancel: false,
      confirmText: '关闭'
    })
  },

  showCreatePost() {
    ensureLogin().then(loggedIn => {
      if (!loggedIn) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.setData({ showPostModal: true })
    })
  },

  closePostModal() {
    this.setData({ showPostModal: false, postForm: { title: '', content: '', category: 'experience' } })
  },

  onPostTitleInput(e) {
    this.setData({ 'postForm.title': e.detail.value })
  },

  onPostContentInput(e) {
    this.setData({ 'postForm.content': e.detail.value })
  },

  onCategoryChange(e) {
    const categories = ['experience', 'question']
    this.setData({ 'postForm.category': categories[e.detail.value] })
  },

  submitPost() {
    const { postForm, mockPosts } = this.data
    if (!postForm.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' }); return
    }
    if (!postForm.content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' }); return
    }

    const userInfo = app.globalData.userInfo
    const newPost = {
      id: Date.now(),
      avatar: '👤',
      username: userInfo ? (userInfo.wechat?.nickname || userInfo.username || '匿名') : '匿名',
      title: postForm.title,
      content: postForm.content,
      category: postForm.category,
      likes: 0,
      comments: 0,
      time: '刚刚',
      tags: []
    }

    this.setData({
      mockPosts: [newPost, ...mockPosts],
      showPostModal: false,
      postForm: { title: '', content: '', category: 'experience' }
    })
    this.loadPosts()
    wx.showToast({ title: '发布成功', icon: 'success' })
  }
})
