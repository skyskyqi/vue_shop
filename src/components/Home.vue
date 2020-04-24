<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清除token并重定向到登录页
      window.sessionStorage.clear()
      this.$router.push("/push")
    }
  }
}
</script>

<style lang="less" scoped>
</style>