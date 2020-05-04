<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="adressDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="adressRuleForm"
          :rules="adressRuleFormRules"
          ref="adressRuleFormRef"
          label-width="100px"
        >
          <el-form-item label="省区/县" prop="address1">
            <el-cascader :options="citydata" v-model="adressRuleForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="adressRuleForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 显示物流信息 -->
      <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import citydata from "./citydata.js"

export default {
  data() {
    return {
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 当前页面条数
        pagesize: 5
      },
      total: 0,
      // 订单列表
      orderList: [],
      adressDialogVisible: false,
      adressRuleForm: {
        address1: "",
        address2: ""
      },
      adressRuleFormRules: {
        address1: [
          { required: true, message: "请选择省县区", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请填写具体地址", trigger: "blur" }
        ]
      },
      citydata,
      progressDialogVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！")
      }
      console.log(res.data)
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showBox() {
      this.adressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.adressRuleFormRef.resetFields()
    },
    // 显示物流信息
    async showProgress() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662")
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败！")
      }
      this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>