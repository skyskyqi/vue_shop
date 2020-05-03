<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 拓展列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRightsById(scope.row, item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <!-- 二级权限渲染 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限渲染 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightsById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--序号 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRolesDialog(scope.row.id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="showRightDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- 树形列表 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRolesDialogVisible" width="50%" @close="editRoelsDialogClosed">
      <el-form
        :model="editRolesForm"
        :rules="editRolesRules"
        ref="editRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制显示权限对话框约否
      showRightDialogVisible: false,
      rightList: [],
      // 树形嵌套
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选中的复选框的id数组
      defKeys: [],
      // 管理权限所在的id
      roleId: "",
      // 显示添加角色的对话框与否
      addRolesDialogVisible: false,
      // 显示修改角色的对话框与否
      editRolesDialogVisible: false,
      // 添加角色表单数据
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加角色表单验证规则
      addRolesRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur"
          },
          {
            min: 2,
            max: 10,
            message: "角色名长度在2~10个字符之间",
            trigger: "blur"
          }
        ]
      },
      // 角色列表
      editRolesForm: {},
      // 修改角色信息的沿正规则
      editRolesRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur"
          },
          {
            min: 2,
            max: 10,
            message: "角色名长度在2~10个字符之间",
            trigger: "blur"
          }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },

    async removeRightsById(role, rightId) {
      const removeConfirm = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err)
      if (removeConfirm !== "confirm") {
        return this.$message.info("取消了删除！")
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！")
      }
      // 不用全部都重新刷新，防止其合上，增加用户体验
      role.children = res.data
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get("rights/tree")
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！")
      }
      this.rightList = res.data
      console.log(this.rightList)

      // 递归获取三级结点
      this.getLeafKeys(role, this.defKeys)
      this.showRightDialogVisible = true
    },
    // 获取复选框的id数组，用递归的函数实现，如果没有children属性则是三级权限。
    getLeafKeys(node, arr) {
      // 如果是三级权限则将id保存子啊数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭对话框时重新赋值
    setRightsDialogClosed() {
      this.defKeys = []
    },
    // 给分配权限与后台相关联
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 进行拼接
      const idStr = keys.join(",")
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！")
      }
      this.$message.success("分配权限成功！")
      this.getRolesList()
      this.showRightDialogVisible = false
    },

    // 增加角色
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return
        console.log(valid)

        // 成功则发起数据请求
        const { data: res } = await this.$http.post("roles", this.addRolesForm)
        if (res.meta.status !== 200) {
          this.$message.error("添加角色失败！")
        }
        this.$message.success("添加角色成功！")
        this.addRolesDialogVisible = false
        this.getRolesList()
      })
    },

    // 显示修改角色对话框
    async showEditRolesDialog(id) {
      console.log(id)

      const { data: res } = await this.$http.get("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败")
      }
      this.editRolesForm = res.data
      console.log(this.editRolesForm)
      this.editRolesDialogVisible = true
    },
    // 提交修改角色信息
    editRoles() {
      this.$refs.editRolesFormRef.validate(async valid => 
      {
        if(!valid) return
        console.log(this.editRolesForm.roleName)

        const {data: res} = await this.$http.put(
          "roles/" + this.editRolesForm.roleId, 
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          this.$message.error("修改角色信息失败！")
        }
        this.editRolesDialogVisible = false
        this.getRolesList()
        this.$message.success("修改角色信息成功！")
      })
    },
    // 重置表单信息
    editRoelsDialogClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 删除角色
    async deleteRoles(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      ).catch(err => err)

      if (confirmResult == "cancel") {
        this.$message.info("已取消删除！")
      } 
      else if (confirmResult == "confirm") {
        const {data: res} = await this.$http.delete("roles/" + id)
        if (res.meta.status !== 200) {
          return this.$message.error("删除角色失败！")
        }
        this.$message.success("成功删除该角色！")
        this.getRolesList()
      }
    },
    // 关闭添加角色对话框并重置内容
    addRolesDialogClosed() {
      this.$refs.addRolesFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>