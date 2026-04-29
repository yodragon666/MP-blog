Component({
  properties: {
    value: String,
    placeholder: { type: String, value: '请输入密码' }
  },
  data: {
    isPasswordVisible: false
  },
  methods: {
    togglePasswordVisible() {
      this.setData({ isPasswordVisible: !this.data.isPasswordVisible });
    },
    onInput(e) {
      // 将输入的值传回父页面
      this.triggerEvent('input', e.detail);
    }
  }
})