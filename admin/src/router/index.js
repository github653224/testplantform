import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading

/* layout */
import Layout from '../views/layout/Layout'

const _import = require('./_import_' + process.env.NODE_ENV)

Vue.use(Router)

/**
 * icon : the icon show in the sidebar
 * hidden : if `hidden:true` will not show in the sidebar
 * redirect : if `redirect:noRedirect` will not redirect in the levelBar
 * noDropDown : if `noDropDown:true` will not has submenu in the sidebar
 * meta : `{ permission: ['a:xx'] }`  will control the page permission
 **/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   children: [
  //     {
  //       path: 'dashboard', component: () => import('dashboard/index'),
  //       name: 'Dashboard',
  //       meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
  //     }
  //   ]
  // }
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    icon: 'dashboard',
    noDropDown: true,
    children: [{
      path: 'dashboard',
      name: '控制台',
      component: _import('dashboard/index'),
      meta: { title: 'dashboard', noCache: true }
    }]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/assets',
    component: Layout,
    name: '资产管理',
    icon: 'asset',
    children: [
      { path: 'machine/list', name: '服务器管理', component: _import('assets/machine/index'), meta: { permission: ['machine:list'] }},
      //  { path: 'role/list', name: '测试点', component: _import('system/role/list'), meta: { permission: ['role:detail'] }},
      { path: 'cases/apicases/list', name: '用例库', component: _import('assets/cases/apicases/index'), meta: { permission: ['apicases:list'] }},
      { path: 'cases/casecondition/list', name: '前后置条件', component: _import('assets/cases/casecondition/index'), meta: { permission: ['apicases_condition:list'] }}
    ]
  },

  {
    path: '/enviroment',
    component: Layout,
    name: '环境管理',
    icon: 'enviroment',
    children: [
      { path: 'testenviroment/list', name: '环境管理', component: _import('enviroment/testenviroment/index'), meta: { permission: ['enviroment:list'] }},
      { path: 'envmachine/list', name: '环境服务器', component: _import('enviroment/envmachine/index'), meta: { permission: ['envmachine:list'] }},
      { path: 'enviromentassemble/list', name: '环境组件', component: _import('enviroment/enviromentassemble/index'), meta: { permission: ['enviroment_assemble:list'] }},
      { path: 'macdepunit/list', name: '环境部署', component: _import('enviroment/macdepunit/index'), meta: { permission: ['macdepunit:list'] }
      }
    ]
  },

  {
    path: '/deployunit',
    component: Layout,
    name: '发布单元',
    icon: 'deploy',
    children: [
      { path: 'depunit/list', name: '发布单元', component: _import('deployunit/depunit/index'), meta: { permission: ['depunit:list'] }},
      { path: 'api/list', name: 'API管理', component: _import('deployunit/api/index'), meta: { permission: ['api:list'] }},
      { path: 'apiparams/list', name: 'API参数', component: _import('deployunit/apiparams/index'), meta: { permission: ['apiparams:list'] }}
    ]
  },

  {
    path: '/dispatch',
    component: Layout,
    name: '调度中心',
    icon: 'dispatch',
    children: [
      { path: 'slaver/list', name: '执行节点', component: _import('dispatch/slaver/index'), meta: { permission: ['slaver:list'] }},
      { path: 'dispatch/list', name: '调度管理', component: _import('dispatch/dispatch/index'), meta: { permission: ['dispatch:list'] }}
    ]
  },

  {
    path: '/executecenter',
    component: Layout,
    name: '执行中心',
    icon: 'execute',
    children: [
      { path: 'executeplan/list', name: '执行计划', component: _import('executecenter/executeplan/index'), meta: { permission: ['executeplan:list'] }}
      //  { path: 'apiparams/list', name: '执行监控', component: _import('deployunit/apiparams/index'), meta: { permission: ['apiparams:list'] }}
    ]
  },

  {
    path: '/reportcenter',
    component: Layout,
    name: '报告中心',
    icon: 'report',
    children: [
      { path: 'apireport/list', name: '功能测试报告', component: _import('reportcenter/apireport/index'), meta: { permission: ['apireport:list'] }},
      //  { path: 'apireport/list', name: '功能报告分析', component: _import('reportcenter/apireport/index'), meta: { permission: ['apireport:list'] }},
      { path: 'apiperformancereport/list', name: '性能测试明细', component: _import('reportcenter/apiperformancereport/index'), meta: { permission: ['apiperformancereport:list'] }},
      { path: 'apiperformancestatistics/list', name: '性能测试统计', component: _import('reportcenter/apiperformancestatistics/index'), meta: { permission: ['apiperformancestatistics:list'] }}

    ]
  },

  // {
  //   path: '/test',
  //   component: Layout,
  //   name: '测试工作管理',
  //   icon: 'dashboard',
  //   children: [
  //     { path: 'account/list', name: '测试项目任务管理', component: _import('system/account/list'), meta: { permission: ['account:list'] }},
  //     { path: 'role/list', name: '测试排期管理', component: _import('system/role/list'), meta: { permission: ['role:detail'] }},
  //     { path: 'role/list', name: '测试文档库CF', component: _import('system/role/list'), meta: { permission: ['role:detail'] }},
  //     { path: 'role/list', name: '测试经验分享', component: _import('system/role/list'), meta: { permission: ['role:detail'] }},
  //     { path: 'role/list', name: '测试资金管理', component: _import('system/role/list'), meta: { permission: ['role:detail'] }}
  //   ]
  // },

  //
  // {
  //   path: '/test',
  //   component: Layout,
  //   name: '数据统计',
  //   icon: 'dashboard',
  //   children: [
  //     { path: 'account/list', name: 'API测试分析', component: _import('system/account/list'), meta: { permission: ['account:list'] }},
  //     { path: 'role/list', name: '提测发布分析', component: _import('system/role/list'), meta: { permission: ['role:detail'] }}
  //   ]
  // },
  //
  {
    path: '/test',
    component: Layout,
    name: '测试',
    icon: 'dashboard',
    children: [
      { path: 'testdynamicinput', name: '测试', component: _import('test/testdynamicinput') }
    ]
  },

  {
    path: '/system',
    component: Layout,
    name: '系统管理',
    icon: 'sys',
    children: [
      { path: 'account/list', name: '账户管理', component: _import('system/account/list'), meta: { permission: ['account:detail'] }},
      { path: 'role/list', name: '角色管理', component: _import('system/role/list'), meta: { permission: ['role:detail'] }},
      // { path: 'deploytestcase/list', name: '发布用例', component: _import('system/deploytestcase/index'), meta: { permission: ['deploytestcase:list'] }},
      { path: 'dictionary/list', name: '字典管理', component: _import('system/dictionary/index'), meta: { permission: ['dictionary:list'] }}
    ]
  },

  // {
  //   path: '/account',
  //   component: Layout,
  //   redirect: '/account/list',
  //   icon: 'name',
  //   noDropDown: true,
  //   children: [{
  //     path: 'list',
  //     name: '账户管理',
  //     component: _import('account/list'),
  //     meta: { permission: ['account:list'] }
  //   }]
  // },

  {
    path: '/account',
    component: Layout,
    redirect: '/account/detail',
    hidden: true,
    children: [{
      path: 'detail',
      name: '账户中心',
      component: _import('system/account/detail')
    }]
  }

  // {
  //   path: '/role',
  //   component: Layout,
  //   redirect: '/role/list',
  //   icon: 'role',
  //   noDropDown: true,
  //   children: [{
  //     path: 'list',
  //     name: '角色管理',
  //     component: _import('role/list'),
  //     meta: { permission: ['role:list'] }
  //   }]
  // }
]
