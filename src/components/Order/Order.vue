<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderData" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="450"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="primary" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
          <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressInfo"></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querfInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="querfInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form
        :model="addressForm"
        ref="addressFormRef"
        :rules="addressFormRule"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流进度 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data () {
    return {
      // 订单列表的绑定数据
      orderData: [],
      // 查询参数
      querfInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      addressVisible: false,
      addressForm: {
        // 级联选择器的绑定数据，必须是数组
        address1: [],
        // 输入框的绑定数据
        address2: ''
      },
      // 修改地址对话框的校验规则
      addressFormRule: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区的数据源
      cityData,
      // 控制物流进度对话框显示与否
      progressVisible: false,
      // 绑定物流进度数据
      progressInfo: []
    }
  },
  created () {
    this.getOrderData()
  },
  methods: {
    // 获取订单列表
    async getOrderData () {
      const { data: res } = await this.$http.get('orders', {
        params: this.querfInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      console.log(res.data)
      this.$message.success('获取订单列表成功!')
      this.orderData = res.data.goods
      this.total = res.data.total
    },
    // 分页改变触发函数
    handleSizeChange (newSize) {
      this.querfInfo.pagesize = newSize
      this.getOrderData()
    },
    // 当前页改变触发函数
    handleCurrentChange (newSize) {
      this.querfInfo.pagenum = newSize
      this.getOrderData()
    },
    // 修改地址的按钮事件
    showBox () {
      this.addressVisible = true
    },
    // 对话框关闭重置
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流信息
    async showProgressInfo () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      console.log(res.data)

      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-cascader {
  width: 100%;
}
</style>
