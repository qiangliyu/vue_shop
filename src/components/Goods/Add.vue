<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <!-- 步骤条 -->
      <!-- activeIndex是字符串，-0可以变成number -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧的tab标签页 -->
      <!-- 给left加上单引号代表是字符串 -->
      <!-- v-model绑定选项卡的 name值 -->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-position="top">
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="TabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <!-- 这里的prop是绑定的校验规则 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addFrom.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_number">
              <el-input v-model="addFrom.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- props是绑定级联选择器的配置对象,在data中设置配置对象 -->
              <el-cascader
                v-model="addFrom.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 请求到的attr_vals是字符串，要变成数组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item"
                  v-for="(item,index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headersObj"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addFrom.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="AddGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      // 选项卡和步骤条共用这一个数据，实现数据联动
      activeIndex: 0,
      // 表单绑定数据
      addFrom: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        // 商品所属的分类数组,放到addFrom中
        goods_cat: [],
        // 上传图片的数组,放在这里定义的原因是要一起提交服务器
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品的动态参数和静态属性
        attrs: []
      },
      // 添加表单数据验证规则对象
      addFromRules: {
        goods_name: [
          { required: true, message: '请添加商品', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请添加商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请添加商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请添加商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据对象
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      // 图片上传路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件添加请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对象
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败!')
      }
      this.$message.success('获取商品分类列表成功！')
      this.catelist = res.data
    },
    // 选中项发生改变触发这个函数
    handleChange () {
      console.log(this.addFrom.goods_cat)
      // 控制只能选择三级分类
      if (this.addFrom.goods_cat.length !== 3) {
        this.addFrom.goods_cat = []
      }
    },
    // 阻止切换标签事件
    beforeTabLeave (activeName, oldActiveName) {
      if (this.addFrom.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    // 切换tab标签时，发送商品参数请求
    async TabClick () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 请求到的attr_vals是字符串，要变成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表失败')
        }

        this.onlyTableData = res.data
      }
    },
    // 上传图片到服务器
    handleSuccess (response) {
      this.addFrom.pics.push({ pic: response.data.tmp_path })
      // 查看有无图片地址，验证是否已经上传
      console.log(this.addFrom.pics)
    },
    // 图片移出处理函数
    handleRemove (file) {
      // 形参file就是点击删除的图片
      console.log(file)
      // 获取用户点击的图片的路径
      const filePath = file.response.data.tmp_path
      // 使用findIndex来查找符合条件的索引
      const index = this.addFrom.pics.findIndex(item => item.pic === filePath)
      // 在图片数组中移出这个对象
      this.addFrom.pics.splice(index, 1)
      // 查看有无图片地址，验证是否已经上传
      console.log(this.addFrom.pics)
    },
    // 图片预览处理函数
    handlePreview (file) {
      console.log(file)
      this.previewVisible = true
      this.previewPath = file.response.data.url
    },
    // 添加商品
    AddGoods () {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加的业务逻辑
        // 首先处理数据格式
        // 因为goods_cat在级联选择器上要求是数组，提交格式上要求是字符串，两者冲突，所以需要拷贝一份addForm
        const form = _.cloneDeep(this.addFrom)
        console.log(this.addFrom)
        // 首先把goods_cat从数组变为字符串
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数的数据格式 attr_id attr_vals
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addFrom.attrs.push(newInfo)
        })
        // 处理静态属性的数据格式
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addFrom.attrs.push(newInfo)
        })
        form.attrs = this.addFrom.attrs

        // 发起商品添加请求
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取三级分类的id
    cateId () {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}

.el-checkbox {
  margin: 0 5px 0 0;
}

.previewImg {
  width: 100%
}

.btnAdd {
  margin-top: 15px;
}
</style>
