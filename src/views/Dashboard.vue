<template>
  <v-card>
    <router-view height="600px"></router-view>
    <v-bottom-nav
          @update:active="switchPage"
          :active.sync="selectedPage"
          :value="true">
      <v-btn
          flat
          value="transactions">
        <span>Transactions</span>
        <v-icon></v-icon>
      </v-btn>
      <v-btn
          flat
          value="accounts">
        <span>Accounts</span>
        <v-icon></v-icon>
      </v-btn>
    </v-bottom-nav>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
import Transactions from './Transactions.vue';
import Accounts from './Accounts.vue';

@Component({
  components: {
    Transactions,
    Accounts,
  },
})
export default class Dashboard extends Vue {
  private selectedPage = 'transactions';

  private switchPage(newPage: string) {
    this.$router.push({ name: newPage });
  }
}
</script>
