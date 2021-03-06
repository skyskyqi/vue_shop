import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Orders from '../components/orders/Orders.vue'
import Report from '../components/report/Report.vue'
import Cart from '../components/goods/Cart.vue'
import Params from '../components/goods/Params.vue'
import Glist from '../components/goods/Glist.vue'
import Add from '../components/goods/AddG.vue'
import Edit from '../components/goods/EditG.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', 
    component: Home, 
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Report },
      { path: '/categories', component: Cart },
      { path: '/params', component: Params },
      { path: '/goods',  component: Glist},
      { path: '/goods/add',  component: Add},
      { path: '/goods/edit',  component: Edit}
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //to 表示要到哪个页面
  // from 表示从哪个页面跳转
  // next 是一个函数，表示放行， next()为直接放行， next('/login')为强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
