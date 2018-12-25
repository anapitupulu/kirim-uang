import Vue from 'vue';
import Vuex from 'vuex';
import transaction from './store/transaction';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loggedIn: null,
  },
  mutations: {
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn;
    },
  },
  actions: {
  },
  modules: {
    transaction,
  },
});
