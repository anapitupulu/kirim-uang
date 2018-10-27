<template>
  <v-container>
    <v-layout column>
      <v-flex>
        <v-tabs
          centered
          color="cyan"
          dark
          grow
          icons-and-text>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab
            href="#tab-transactions">
            Transactions
            <v-icon>reorder</v-icon>
          </v-tab>
          <v-tab
            href="#tab-accounts">
            Accounts
            <v-icon>account_circle</v-icon>
          </v-tab>

          <v-tab-item
            value="tab-transactions">
            <transactions></transactions>
          </v-tab-item>

          <v-tab-item
            value="tab-accounts">
            <accounts></accounts>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
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
}
</script>
