<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- alert -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeStatus - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧栏渲染 -->
      <!-- el-tab-pane只能做l-tabs的孩子 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeStatus"
          :before-leave="leaveOld"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expandTrigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyDataTab" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item1.attr_name"
              v-for="item1 in onlyDataTab"
              :key="item1.attr_id"
            >
              <el-input v-model="item1.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 指定上传的后台api -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addbtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->

    <el-dialog title="图片预览" :visible.sync="imgVisible" width="50%">
      <img :src="previewPath" alt="图片" class="img-w" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash"

export default {
  data() {
    return {
      activeStatus: "0",
      // 表单对象
      addForm: {
        goods_name: "",
        goods_price: 1,
        goods_number: 1,
        goods_weight: 1,
        // 商品分类数组
        goods_cat: [],
        // 图片上传的对象数组
        pics: [],
        // 商品介绍
        goods_introduce: "",
        attrs: []
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      manyDataTab: [],
      // 属性
      onlyDataTab: [],
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload/",
      // 请求头（请求token）
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      imgVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories")
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类失败")
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器的触发函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    leaveOld(activePage, oldLeavePage) {
      // console.log("即将离开的标签页名字" + oldLeavePage)
      // console.log("即将进入的标签页名字" + activePage)
      if (oldLeavePage === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请输入数据！")
        return false
      }
    },
    async tabClicked() {
      if (this.activeStatus === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.getId}/attributes`,
          {
            params: { sel: "many" }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败！")
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ")
        })
        this.manyDataTab = res.data
        console.log(this.manyDataTab)
      } else if (this.activeStatus === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.getId}/attributes`,
          {
            params: { sel: "only" }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error("获取属性失败！")
        }
        console.log(res.data)
        this.onlyDataTab = res.data
      }
    },
    // 缩略框浏览
    handlePreview(file) {
      // 预览窗口
      console.log(file)
      this.previewPath = file.response.data.url
      this.imgVisible = true
      console.log(this.previewPath)
    },
    // 移除图片
    handleRemove(file) {
      // 1、获得图片的路径
      const filePath = file.response.data.tmp_path
      // 2、在pic中找出要删除图片的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3、在addform中的pic中删除图片对象
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //监听图像上传对象
    handleSuccess(response) {
      console.log(response)
      // 1、拼接一个图片上传对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、将对象push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 提交表单
    add() {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要表单对象！")
        }

        // 直接讲good_cat转换成字符串会导致分类那个级联选择其出错
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(",")
        // 处理动态参数
        this.manyDataTab.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyDataTab.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        console.log(this.addForm)
        // 添加商品
        const { data: res } = await this.$http.post('goods', form)
        // console.log(res.data)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    getId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-steps {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-checkbox {
  margin: 0 8px 0 0 !important;
}
.img-w {
  width: 100%;
}
.addbtn {
  margin-top: 10px;
}
</style>