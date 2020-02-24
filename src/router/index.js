import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Login from '../components/Login.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Home from '../components/Home.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')
// import Welcome from '../components/Welcome.vue'
const Users = () => import(/* webpackChunkName:"user" */ '../components/Users.vue')
// import Users from '../components/Users.vue'
const Rights = () => import(/* webpackChunkName:"power" */ '../components/Power/Roles.vue')
// import Rights from '../components/Power/Right.vue'
const Roles = () => import(/* webpackChunkName:"power" */ '../components/Power/Roles.vue')
// import Roles from '../components/Power/Roles.vue'
const Cate = () => import(/* webpackChunkName:"goods" */ '../components/Goods/Cate.vue')
// import Cate from '../components/Goods/Cate.vue'
const Params = () => import(/* webpackChunkName:"goods" */ '../components/Goods/Params.vue')
// import Params from '../components/Goods/Params.vue'
const GoodsList = () => import(/* webpackChunkName:"goods" */ '../components/Goods/List.vue')
// import GoodsList from '../components/Goods/List.vue'
const AddGoods = () => import(/* webpackChunkName:"goods" */ '../components/Goods/Add.vue')
// import AddGoods from '../components/Goods/Add.vue'
const Order = () => import(/* webpackChunkName:"order" */ '../components/Order/Order.vue')
// import Order from '../components/Order/Order.vue'
const Report = () => import(/* webpackChunkName:"report" */ '../components/Report/Report.vue')
// import Report from '../components/Report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '*', component:home },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from表示从哪里来
  // next()是一个函数，表示放行;next('/login)强制跳转到登录页面
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
