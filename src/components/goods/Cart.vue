<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        :show-index="true"
        index-text="#"
        :border="true"
      >
        <!-- 插槽 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template slot="level" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="set" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!--分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addCateClosed">
      <el-form
        :model="addRuleForm"
        :rules="addRuleFormRules"
        ref="addRuleFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options用类选择绑定的数据对象
               props中用来指定几连选择的配置对象
          -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editRuleForm"
        :rules="editRuleFormRules"
        ref="editRuleFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editRuleForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除分类 -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询的数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 保存数据的数组
      cateList: [],
      // 总的数据条数
      total: 0,
      // 指定表格的列
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示当前列定义的模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "isOk"
        },
        // 排序
        {
          label: "排序",
          // 表示当前列定义的模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "level"
        },
        // 操作
        {
          label: "操作",
          type: "template",
          template: "set"
        }
      ],
      addDialogVisible: false,
      // 添加分类的表单数据对象
      addRuleForm: {
        // 分类父id
        cat_pid: 0,
        // 分类层级
        cat_level: 0,
        cat_name: ""
      },
      addRuleFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur"
          }
        ]
      },
      // 父级分类
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 显示编辑对话框
      editDialogVisible: false,
      // 编辑数组
      editRuleForm: [],
      // 编辑规则
      editRuleFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur"
          }
        ]
      }
    }
  },
  created() {
    this.getCataList()
  },
  methods: {
    // 获取数据
    async getCataList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！")
      }
      console.log(res)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听分类
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getCataList()
    },
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getCataList()
    },
    showAddDialog() {
      this.getParamSet()
      this.addDialogVisible = true
    },
    // 获取父级分类
    async getParamSet() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！")
      }

      // console.log(res.data)
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果没有选中父级菜单则权重是0
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addRuleForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类等级赋值
        this.addRuleForm.cat_level = this.selectedKeys.length
      } else {
        this.addRuleForm.cat_pid = 0
        this.addRuleForm.cat_level = 0
      }
    },
    // 点击按钮添加分类
    addCate() {
      console.log(this.addRuleForm)
      this.$refs.addRuleFormRef.validate(async valid => {
        const { data: res } = await this.$http.post(
          "categories",
          this.addRuleForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！")
        }

        this.$message.success("添加分类成功！")
        this.getCataList()
        this.addDialogVisible = false
      })
      this.$http.post("categories")
    },
    // 重置对话框数组
    addCateClosed() {
      this.$refs.addRuleFormRef.resetFields()
      this.selectedKeys = []
      this.addRuleForm.cat_pid = 0
      this.addRuleForm.cat_level = 0
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("categories/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类失败！")
      }
      this.editRuleForm = res.data
      console.log(this.editRuleForm)
      this.editDialogVisible = true
    },
    // 编辑分类
    editCate() {
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) return
        // console.log("1")
        const { data: res } = await this.$http.put(
          "categories/" + this.editRuleForm.cat_id,
          {
            cat_name: this.editRuleForm.cat_name
          }
        )
        // console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error("编辑失败！")
        }
        this.$message.success("编辑程功！")
        this.getCataList()
        this.editDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      ).catch(err => err)
      console.log(confirmResult)
      if (confirmResult == "confirm") {
        const {data : res} = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.$message.success('删除分类成功！')
        this.getCataList()
      } else {
        this.$message.success('已取消刪除！')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>