<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="man" />
      </div>
      <!-- 表单区 -->
      <el-form ref="loginFormRef" class="login-form" :model="loginForm" :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      // 验证规则
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      }
    }
  },
  methods: {
    // 重置方法
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    },
    // 登录验证
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post("login", this.loginForm)
        // console.log(res);
        if (res.meta.status != 200) return this.$message.error("登录失败！")
        this.$message.success("登录成功！")
        // 验证通过后配置axios然后发起请求，若状态是200则登录成功
        // 将登录成功的token保存在sessionStorage中
        // console.log( res );
        window.sessionStorage.setItem("token", res.data.token)
        // 跳转到主页/home中
        this.$router.push("/home")
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  height: 300px;
  width: 450px;
  background-color: #fff;
  border-radius: 5px;
  margin: 0 auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);

  .avatar-box {
    height: 130px;
    width: 130px;
    border: 1px #eee solid;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    // 移到中间
    position: relative;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login-form {
    margin-top: -40px;
    margin-right: 25px;
    margin-inline-start: 25px;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
