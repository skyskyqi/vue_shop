<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/s-logo.png" alt />
        <span class="h-span">电商管理平台</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 菜单折叠 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 菜单栏 -->
        <el-menu
          background-color="#364b60"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">   
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主页 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    // 左侧菜单数据
    return {
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠，默认不折叠
      isCollapse: false
    }
  },
  // 创建生命周期
  created() {
    this.getMenuList();
  },
  methods: {
    logout() {
      // 清除token并重定向到登录页
      window.sessionStorage.clear()
      this.$router.push("/push")
    },
    // 获取所有菜单
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      // 不是200则打印错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 菜单折叠
    toggleCollapse() {
      this.isCollapse = ! this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #364b60;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 16px;
  > div {
    display: flex;
    align-items: center;
  }
}
.el-aside {
  background-color: #364b60;
}
.el-menu {
  border-right: 0px;
}
.el-main {
  background-color: #e9edf1;
}
.h-span {
  margin-left: 5px;
}
.iconfont {
  margin-right: 8px;
}

.toggle-button {
  font-size: 12px;
  color: #fff;
  background-color: #364b60;
  text-align: center;
  letter-spacing: 0.2em;
  line-height: 24px;
  cursor: pointer;
}
</style>