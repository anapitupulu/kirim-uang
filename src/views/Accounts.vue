<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title>Accounts</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Account</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.bank" label="Bank"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.accountNumber" label="Account #"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.branch" label="Branch"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <span class="subheading">Location:</span>
                  <v-radio-group v-model="editedItem.location" row>
                    <v-radio label="Indonesia" value="Indonesia"></v-radio>
                    <v-radio label="USA" value="USA"></v-radio>
                  </v-radio-group>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.phone" label="Phone"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <span class="body-2 red--text" v-show="failedToSave">Failure saving account!</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="accounts"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.bank }}</td>
        <td class="text-xs-right">{{ props.item.accountNumber }}</td>
        <td class="text-xs-right">{{ props.item.branch }}</td>
        <td class="text-xs-right">{{ props.item.location }}</td>
        <td class="text-xs-right">{{ props.item.phone }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import {Account} from '../store/account';

@Component({})
export default class Accounts extends Vue {
  private failedToSave: boolean = false;
  private dialog: boolean = false;
  private headers: any[] = [
    {
      text: 'Name',
      align: 'left',
      sortable: true,
      value: 'name',
    },
    { text: 'Bank', value: 'bank', sortable: true },
    { text: 'Account #', value: 'accountNumber' },
    { text: 'Branch', value: 'branch' },
    { text: 'Location', value: 'location', sortable: true },
    { text: 'Phone', value: 'phone' },
  ];
  private accounts: Account[] = [];
  private editedIndex: number = -1;
  private editedItem: Account =
    { id: '', name: '', bank: '', accountNumber: '', branch: '', location: 'Indonesia', phone: '' };
  private defaultItem: Account =
    { id: '', name: '', bank: '', accountNumber: '', branch: '', location: 'Indonesia', phone: '' };

  get formTitle() {
    return this.editedIndex === -1 ? 'New Account' : 'Edit Account';
  }

  @Watch('dialog')
  private onDialogChanged(val: boolean) {
    if (!val) {
      this.close();
    }
  }

  private created() {
    this.initialize();
  }

  private async initialize() {
    this.accounts = (await axios.get('/services/account')).data;
  }

  private editItem(item: Account) {
    this.editedIndex = this.accounts.indexOf(item);
    this.editedItem = Object.assign({}, item);
    this.dialog = true;
  }

  private deleteItem(item: any) {
    const index = this.accounts.indexOf(item);
    if (confirm('Are you sure you want to delete this item?')) {
      this.accounts.splice(index, 1);
    }
  }

  private close() {
    this.dialog = false;
    this.failedToSave = false;
    setTimeout(() => {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    }, 300);
  }

  private async save() {
    try {
      if (this.editedIndex > -1) {
        const res: any = await axios.put('/services/account', this.editedItem);
        Object.assign(this.accounts[this.editedIndex], this.editedItem);
      } else {
        const res: any = await axios.post('/services/account', this.editedItem);
        this.accounts.push(this.editedItem);
      }
      this.close();
    } catch (err) {
      this.failedToSave = true;
    }
  }
}
</script>
