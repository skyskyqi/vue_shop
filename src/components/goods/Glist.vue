<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框和搜索列表 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"  @clear="getList"
          clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="totalList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="110px"></el-table-column>
        <el-table-column label="商品创建时间" prop="add_time" width="170px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- <el-button type="primary" icon="el-icon-edit" size="mini" @click="EditPage"></el-button> -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGood(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: "",
        // 固定页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      // 所以数据数组
      totalList: [],
      // 所有数据条数
      total: 0,
      // 修改
      editDialogVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取商品列表数据
    async getList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！")
      }
      this.$message.success("获取商品列表数据成功！")
      console.log(res.data)
      this.totalList = res.data.goods
      this.total = res.data.total
    },
    // 显示添加商品对话框
    addPage() {
      this.$router.push('/goods/add')
    },
    // 显示编辑dialog
    showEdit() {
      this.editDialogVisible = true
    },
    // 管理页面条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getList()
    },
    // 当前页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getList()
    },
    // 删除商品
    async removeGood(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      ).catch(err => err)

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！")
      }

      const {data : res} = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败！")
      }
      this.$message.success("删除商品成功！")
      this.getList()
    }
  }
}
</script>