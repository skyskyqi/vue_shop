<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索和添加按钮 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户表格,表格渲染 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话号码" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="用户角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 作用域插槽相当于prop -->
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#dcdfe6" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 页面页码
        pagenum: 1,
        // 当前页面显示条数
        pagesize: 2
      },
      userList: [],
      // 总共多少条数据
      total: 0
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表，通过api获取用户数据，并保存在一个数组中
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败")
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    //监听显示页面条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新发起请求
      this.getUserList()

      console.log(newSize)
    },
    // 监听分页值改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
      console.log(newPage)
    },
    // 将修改了的状态保存在数据库中
    async userStateChanged(userInfo) {
      console.log(userInfo)
      const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户数据成功！')
    }
  }
}
</script>
<style lang="less" scoped>
</style>