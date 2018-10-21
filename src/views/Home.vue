<template>
  <v-app id="inspire">
    <v-navigation-drawer
         fixed
         v-model="drawer"
         app
         >
         <v-list dense>
           <v-list-tile @click="">
             <v-list-tile-action>
               <v-icon>home</v-icon>
             </v-list-tile-action>
             <v-list-tile-content>
               <v-list-tile-title>Rate</v-list-tile-title>
             </v-list-tile-content>
           </v-list-tile>
         </v-list>
    </v-navigation-drawer>
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer color="indigo" app inset>
      <span class="white--text">&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  private drawer: boolean = false;
  private source: string = '';
}
</script>
