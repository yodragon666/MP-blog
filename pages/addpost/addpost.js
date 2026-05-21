import { request, upload } from '../../utils/request';
import { requireLogin } from '../../utils/authGuard';

Page({
  data: {
    id: null,
    status: null,

    title: '',
    desc: '',
    content: '',

    categoryList: [],
    tagList: [],

    categoryIndex: null,
    selectedCategoryId: null,
    selectedCategoryName: '',

    selectedTags: [],
    imageList: [],

    isSubmitting: false
  },

  async onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
    }

    await this.initData();

    if (this.data.id) {
      this.loadDetail();
    }
  },

  async initData() {
    try {
      const [catRes, tagRes] = await Promise.all([
        request({ url: '/api_blog/categories/' }),
        request({ url: '/api_blog/tags/' })
      ]);

      this.setData({
        categoryList: (catRes.data || []).filter(item => item.id !== 0),
        tagList: (tagRes.data || []).map(item => ({ ...item, active: false }))
      });
    } catch (err) {
      wx.showToast({ title: '初始化失败', icon: 'none' });
    }
  },

  // ✅ 核心修复：解析 content 里的图片
  async loadDetail() {
    try {
      const res = await request({
        url: `/api_blog/posts/detail/${this.data.id}/`
      });

      const data = res.data;
      console.log('aaaaaaa')
      const categoryIndex = this.data.categoryList.findIndex(
        c => c.id == data.category_id
      );

      const tagList = this.data.tagList.map(t => ({
        ...t,
        active: (data.tags || []).includes(t.id)
      }));

      // =========================
      // 🔥 核心：解析 content
      // =========================

      let rawContent = data.content || '';

      // 1️⃣ 提取图片
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      let imageList = [];

      while ((match = imgRegex.exec(rawContent)) !== null) {
        imageList.push(match[1]);
      }

      // 2️⃣ 去掉 img 标签，只保留文本
      let textContent = rawContent.replace(/<img[^>]*>/g, '').trim();

      // =========================

      this.setData({
        title: data.title,
        desc: data.desc,

        content: textContent,   // ✅ 纯文本
        imageList: imageList,   // ✅ 图片列表

        selectedCategoryId: data.category_id,
        selectedCategoryName: this.data.categoryList[categoryIndex]?.name || '',
        categoryIndex: categoryIndex,
        selectedTags: data.tags || [],
        tagList: tagList,
        status: data.status
      });

    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    const { id, name } = this.data.categoryList[index];
    this.setData({
      categoryIndex: index,
      selectedCategoryId: id,
      selectedCategoryName: name
    });
  },

  toggleTag(e) {
    const { id } = e.currentTarget.dataset;
    let selected = [...this.data.selectedTags];
    const idx = selected.indexOf(id);

    idx > -1 ? selected.splice(idx, 1) : selected.push(id);

    const tagList = this.data.tagList.map(t => ({
      ...t,
      active: selected.includes(t.id)
    }));

    this.setData({ selectedTags: selected, tagList });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 6,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        for (let file of res.tempFiles) {
          await this.uploadImage(file.tempFilePath);
        }
      }
    });
  },

  async uploadImage(filePath) {
    try {
      wx.showLoading({ title: '处理图片...' });
      const res = await upload({
        url: '/api_blog/upload_post_image/',
        filePath: filePath,
        name: 'image'
      });

      this.setData({
        imageList: [...this.data.imageList, res.data.url]
      });

    } catch (err) {
      wx.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  deleteImage(e) {
    const list = [...this.data.imageList];
    list.splice(e.currentTarget.dataset.index, 1);
    this.setData({ imageList: list });
  },

  saveDraft() {
    requireLogin(() => {
      this.doSubmit('draft');
    });
  },
  
  submitPost() {
    requireLogin(() => {
      this.doSubmit('submit');
    });
  },

  async doSubmit(action) {
    const {
      id, title, content,
      selectedCategoryId,
      selectedTags,
      desc,
      imageList,
      isSubmitting
    } = this.data;

    if (isSubmitting) return;

    if (!title.trim() || !selectedCategoryId) {
      return wx.showToast({ title: '标题和分类必填', icon: 'none' });
    }

    this.setData({ isSubmitting: true });

    // ✅ 拼接图片（保留你的逻辑）
    let finalContent = content.trim();
    if (imageList.length > 0) {
      const imgTags = imageList
        .map(url => `<img src="${url}" style="max-width:100%;display:block;margin:10px 0;" />`)
        .join('\n');

      finalContent += '\n' + imgTags;
    }

    wx.showLoading({
      title: action === 'draft' ? '保存中...' : '处理中...'
    });

    try {
      const res = await request({
        url: '/api_blog/posts/edit/',
        method: 'POST',
        data: {
          id: id,
          action: action,
          title: title.trim(),
          desc: desc.trim(),
          content: finalContent,
          category_id: selectedCategoryId,
          tags: selectedTags
        }
      });

      wx.showToast({
        title: res.msg || '操作成功',
        icon: 'success'
      });

      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];

      if (prevPage) {
        prevPage.setData({ page: 1 });
        prevPage.getPosts();
      }

      setTimeout(() => wx.navigateBack(), 1000);

    } catch (err) {
      wx.showToast({
        title: err.msg || '提交失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isSubmitting: false });
      wx.hideLoading();
    }
  },
  previewImage(e){
    const current = e.currentTarget.dataset.url; // 当前点击的图片

    wx.previewImage({
      current: current,          // 当前显示哪张
      urls: this.data.imageList  // 所有图片（可左右滑）
    });
  }
});