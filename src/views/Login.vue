<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex>
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            required
            ></v-text-field>
          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            :rules="passwordRules"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            required
            @click:append="showPassword = !showPassword"
            ></v-text-field>
            <v-btn
              :disabled="!valid"
              @click="login">
              Login
            </v-btn>
        </v-form>
        <span class="title red--text text--darken-1" v-show="failedLogin">Invalid login</span>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
@Component({})
export default class Login extends Vue {
  private valid: boolean = true;
  private failedLogin: boolean = false;
  private email: string = '';
  private password: string = '';
  private showPassword: boolean = false;

  private emailRules: any = [
    (v: string) => !!v || 'Email is required',
  ];

  private passwordRules: any = [
    (v: string) => !!v || 'Password is required',
  ];

  private async login() {
    if ((this.$refs.loginForm as any).validate()) {
      await axios.post('/services/authenticate', {
        email: this.email,
        password: this.password,
      }).catch((err: Error) => {
        this.failedLogin = true;
      });
      this.$router.push({
        name: 'dashboard',
      });
    }
  }
}
</script>
