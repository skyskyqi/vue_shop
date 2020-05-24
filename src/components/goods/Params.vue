<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告區 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 渲染级联 -->
      <el-row class="row">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <!-- option 选定的绑定对象
               props将要配置的级联选择器
          -->
          <el-cascader
            expandTrigger="hover"
            v-model="selectCateList"
            :options="cateList"
            :props="cateListProp"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs页标签区 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态参数 -->
          <el-button
            type="primary"
            size="middle"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
          >添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyCateList" border stripe>
            <el-table-column type="expand">
              <!-- 展开的标签列 -->
              <template slot-scope="scope">
                <!-- 循环显示文本 -->
                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close="handleChangeClosed(i, scope.row)">{{item}}</el-tag>
                <!-- 添加文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加文本按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteData(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 静态属性 -->
          <el-button
            type="primary"
            size="middle"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
          >添加属性</el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyCateList" border stripe>
            <el-table-column type="expand">
              <!-- 展开的标签列 -->
              <template slot-scope="scope">
                <!-- 循环显示文本 -->
                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close="handleChangeClosed(i, scope.row)">{{item}}</el-tag>
                <!-- 添加文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加文本按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteData(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 分页 -->
    </el-card>

    <!-- 添加动态参数和静态属性的对话框 -->
    <el-dialog
      :title="'添加' + dialogText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addRuleForm"
        :rules="addRuleFormRules"
        ref="addRuleFormRef"
        label-width="100px"
      >
        <el-form-item :label="dialogText" prop="attr_name">
          <el-input v-model="addRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateInf">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="'编辑' + dialogText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editRuleForm"
        :rules="editRuleFormRules"
        ref="editRuleFormRef"
        label-width="100px"
      >
        <el-form-item :label="dialogText" prop="attr_name">
          <el-input v-model="editRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      // 配置级联选择器
      cateListProp: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择器双向绑定到数组
      selectCateList: [],
      // 激活的标签区
      activeName: "many",
      // 动态参数数组
      manyCateList: [],
      // 静态属性数组
      onlyCateList: [],
      // 显示对话框
      addDialogVisible: false,
      addRuleForm: {
        attr_name: ""
      },
      // 规则
      addRuleFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 显示编辑对话框
      editDialogVisible: false,
      // 显示编辑数据对话框
      editRuleForm: {
        attr_name: ""
      },
      // 显示编辑规则
      editRuleFormRules: {
        attr_name: [{ required: true, message: "请输入名称", trigger: "blur" }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories")
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类信息失败！")
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器会出发这个函数
    handleChange() {
      this.getParamsData()
    },

    // tabs点击事件
    handleClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 点击重新获取数据
    async getParamsData() {
      if (this.selectCateList.length !== 3) {
        this.selectCateList = []
        // 清除many和only数据
        this.manyCateList = []
        this.onlyCateList = []
        return
      }

      // 看点击的是那个tab然后获取对应分类的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []

        // 防止联动，给每个属性一个自己的显示添加文本框
        item.inputVisible = false
        item.inputValue = ''
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！")
      }

      if (this.activeName === "many") {
        this.manyCateList = res.data
      } else {
        this.onlyCateList = res.data
      }
    },
    // 显示对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 重置对话框
    addDialogClosed() {
      this.$refs.addRuleFormRef.resetFields()
    },
    // 确认添加参数或者属性
    addCateInf() {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addRuleForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res.data)
        if (res.meta.status !== 201) {
          return this.$message.error("添加数据失败！")
        }
        this.$message.success("添加数据成功！")
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      // console.log(this.editRuleForm)
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败")
      }
      console.log(res.data)
      this.editRuleForm = res.data
      this.editDialogVisible = true
    },
    // 提交修改信息
    editParams() {
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editRuleForm.attr_id}`,
          {
            attr_name: this.editRuleForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error("编辑提交失败！")
        }
        this.$message.success("编辑提交成功")
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 关闭时重置
    editDialogClosed() {
      this.$refs.editRuleFormRef.resetFields()
    },
    // 删除数据
    async deleteData(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      ).catch(err => err)
      if (confirmResult == "confirm") {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${id}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error("删除失败！")
        }
        this.$message.success("删除成功！")
        this.getParamsData()
      } else {
        this.$message.success("取消删除成功！")
      }
    },
    // 不管文本框触发与否都是这个函数
    handleInputConfirm(row) {
      // 验证input中的数据是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return 
      }
      // 如果没有return出去，则做其他操作, trim()用来去除多余的空格
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.pushData(row)
    },
    // 文本添加按钮
    showInput(row) {
      row.inputVisible = true
      // 自动获得焦点
      // $nextTick是渲染完毕之后再调用其函数
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 关闭属性标签
    handleChangeClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.pushData(row)
    },
    // 提交数据
    async pushData(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, 
      {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error("添加参数属性值失败！")
      }
      this.$message.success("添加参数的属性值成功！")
    }
  },
  computed: {
    // true为禁用btn，false为不禁用btn
    isBtnDisabled() {
      if (this.selectCateList.length !== 3) {
        return true
      }
      return false
    },
    // 获取选取的分类的id值
    cateId() {
      if (this.selectCateList.length === 3) {
        return this.selectCateList[2]
      }
      return null
    },
    // 控制对话框的动态还是静态
    dialogText() {
      if (this.activeName === "many") {
        return "动态参数"
      } else {
        return "静态参数"
      }
    }
  }
}
</script>
<style lang="less" scoped>
.row {
  margin-top: 10px;
}
.el-tabs {
  margin-top: 10px;
}
.el-tag {
  margin-right: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>