<template>
  <v-container fill-height>
    <v-layout justify-center align-start column>
      <v-flex>
        <div>Rate as of: {{currentTime}} ({{currentLocale}})</div>
      </v-flex>
      <v-flex align-center>
        <div class="title">Kirim USD ke Indonesia:</div>
        <div class="headline">Rp {{usdToIdr.toLocaleString()}}</div>
      </v-flex>
      <v-flex align-content-center>
        <div class="title">Kirim Rupiah ke USA:</div>
        <div class="headline">Rp {{idrToUsd.toLocaleString()}}</div>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import moment from 'moment';
import axios from 'axios';

@Component({})
export default class Home extends Vue {
  private drawer: boolean = false;
  private source: string = '';
  private usdToIdr: number = 0;
  private idrToUsd: number = 0;
  private currentTime: string = '';
  private currentLocale: string = '';

  public created() {
    this.currentLocale = moment.locale();
    this.currentTime = moment().format('LLL');
    axios.get('/service/rate/latest')
      .then((response) => {
        const data = response.data[0];
        this.usdToIdr = data.usdToIdrRounded;
        this.idrToUsd = data.idrToUsdRounded;
      });
  }
}
</script>
