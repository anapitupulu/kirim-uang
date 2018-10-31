import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: { name: 'rate' },
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'rate',
          name: 'rate',
          component: () => import(/* webpackChunkName: "about" */ './views/Rate.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import(/* webpackChunkName: "about" */ './views/Login.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import(/* webpackChunkName: "about" */ './views/Dashboard.vue'),
          children: [
            {
              path: 'transactions',
              name: 'transactions',
              component: () => import(/* webpackChunkName: "about" */ './views/Transactions.vue'),
            },
            {
              path: 'accounts',
              name: 'accounts',
              component: () => import(/* webpackChunkName: "about" */ './views/Accounts.vue'),
            },
          ],
        },
      ],
    },
  ],
});
