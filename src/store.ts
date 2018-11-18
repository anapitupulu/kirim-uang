import Vue from 'vue';
import Vuex from 'vuex';
import transaction from './store/transaction';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {

  },
  modules: {
    transaction,
  },
});
