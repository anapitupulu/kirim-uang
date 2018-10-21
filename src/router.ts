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
      ],
    },
  ],
});
