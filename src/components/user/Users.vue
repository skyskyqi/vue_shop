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
          <el-button type="primary" @click="addUserDialog = true">添加用户</el-button>
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
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showExitDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
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
    <!-- 添加用户表单 -->
    <el-dialog title="提示" :visible.sync="addUserDialog" width="50%" @close="addDialogClosed">
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="exitDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exitDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) return callback()
      callback(new Error("请输入合法邮箱"))
    }
    // 验证手机规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/
      if (regMobile.test(value)) return callback()
      callback(new Error("请输入合法的手机号"))
    }
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
      total: 0,
      // 控制对话框显示与否
      addUserDialog: false,
      // 显示修改用户对话框与否
      exitDialogVisible: false,
      // 添加用户表单数据
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 表单验证规则
      addUserFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3~10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度在6到15之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 获取用户的信息
      editForm: {},
      // 表单验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
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
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error("更新用户状态失败!")
      }
      this.$message.success("更新用户数据成功！")
    },
    // 监听对话框关闭事件
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 添加用户表单预验证
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        console.log(valid)
        // 成功则发起网络请求
        const { data: res } = await this.$http.post("users", this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！")
        }
        this.$message.success("添加用户成功！")
        // 把对话框关闭
        this.addUserDialog = false
        // 更新用户表
        this.getUserList()
      })
    },
    // 显示修改用户对话框
    async showExitDialog(id) {
      console.log(id)
      // 获取用户id
      const { data: res } = await this.$http.get("users/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败")
      }
      this.editForm = res.data
      this.exitDialogVisible = true
    },
    // 表单关闭重置监听
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改表单预验证
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起用户信息的数据请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error("修改用户信息失败！")
        }
        // 成功的话更新列表，重新传信息，关闭对话框
        this.exitDialogVisible = false
        this.getUserList()
        this.$message.success("修改用户信息成功！")
      })
    },
    // 删除数据
    async deleteUser(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      ).catch(err => err)
      // 如果返回的是confirm则确认删除
      // 否则则取消用户删除
      console.log(confirmResult)
      if (confirmResult == "confirm") {
        const { data: res} = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message.error("删除用户失败！")
        }
        this.$message.success("成功删除该用户！")
        this.getUserList()
      } else if (confirmResult == "cancel") {
        this.$message.info("已取消删除!")
      }
    }
  }
}
</script>
<style lang="less" scoped>
</style>