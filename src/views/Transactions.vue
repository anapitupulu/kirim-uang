<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title>Transactions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Transaction</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-autocomplete
                    :loading="senderTypeahead.loading"
                    :items="senderTypeahead.items"
                    :search-input.sync="senderTypeahead.searchQuery"
                    v-model="editedItem.senderId"
                    @input="onSenderSelected"
                    item-text="name"
                    item-value="id"
                    cache-items
                    class="mx-3"
                    flat
                    hide-no-data
                    hide-details
                    label="Enter sender name"
                    solo-inverted></v-autocomplete>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-autocomplete
                    :loading="receiverTypeahead.loading"
                    :items="receiverTypeahead.items"
                    :search-input.sync="receiverTypeahead.searchQuery"
                    v-model="editedItem.receiverId"
                    @input="onReceiverSelected"
                    item-text="name"
                    item-value="id"
                    cache-items
                    class="mx-3"
                    flat
                    hide-no-data
                    hide-details
                    label="Enter receiver name"
                    solo-inverted></v-autocomplete>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.rate" label="Rate"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-layout row>
                      <v-flex>
                        <v-text-field v-model="editedItem.usdAmount" type="number" pattern="[0-9]*" label="Enter US$ amount" @input="adjustIdrAmount"></v-text-field>
                      </v-flex>
                        <v-flex>
                          <v-text-field v-model="editedItem.idrAmount" type="number" pattern="[0-9]*" label="Enter Rupiah amount" @input="adjustUsdAmount"></v-text-field>
                        </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs12 sm6 md4 v-show="usdToIdr">
                    <v-text-field v-model="editedItem.usdFee" type="number" pattern="[0-9]*" label="Enter US$ fee"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4 v-show="!usdToIdr">
                    <v-text-field v-model="editedItem.idrFee" type="number" pattern="[0-9]*" label="Enter Rupiah fee"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-layout row>
                      <v-flex>
                        <v-checkbox label="Paid" v-model="editedItem.paid"></v-checkbox>
                      </v-flex>
                      <v-flex>
                        <v-checkbox label="Transferred" v-model="editedItem.transferred"></v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-textarea
                      label="Notes"
                      v-model="editedItem.notes"
                      :row-height="4"
                      auto-grow
                      ></v-textarea>
                  </v-flex>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="copy">Copy</v-btn>
            <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="transactions"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="justify-center layout px-0">
          <v-icon
            medium
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            medium
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
        <td class="text-xs-right">{{ props.item.sender.name }}</td>
        <td class="text-xs-right">{{ props.item.receiver.name }}</td>
        <td class="text-xs-right">{{ props.item.usdAmount }}</td>
        <td class="text-xs-right">{{ props.item.idrAmount }}</td>
        <td class="text-xs-right">{{ props.item.transferred }}</td>
        <td class="text-xs-right">{{ props.item.paid }}</td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reload</v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import _map from 'lodash/map';
import _find from 'lodash/find';
import _keyBy from 'lodash/keyBy';
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from '../core/axios-instance';
import clipboard from 'clipboard-polyfill';
import {Transaction} from '../store/transaction';
import {Account, getDefaultAccount} from '../store/account';

interface TypeaheadStates {
  loading: boolean;
  searchQuery: string;
  items: any[];
  selected: string;
}


@Component({})
export default class Transactions extends Vue {
  public $refs!: {
    clipboardElement: HTMLFormElement;
  };

  private accounts: {[id: string]: Account} = {};

  private failedToSave: boolean = false;
  private dialog: boolean = false;
  private headers: any[] = [
    { text: 'Sender', value: 'senderId', sortable: true },
    { text: 'Receiver', value: 'receiverId', sortable: true },
    { text: 'US $', value: 'usdAmount', sortable: true },
    { text: 'Rupiah', value: 'idrAmount', sortable: true },
    { text: 'Transferred', value: 'transferred', sortable: true },
    { text: 'Paid', value: 'paid', sortable: true },
    { text: 'Notes', value: 'notes', sortable: true },
  ];
  private editedIndex: number = -1;
  private editedItem: Transaction =
    { id: '',
      senderId: '',
      sender: getDefaultAccount(),
      receiverId: '',
      receiver: getDefaultAccount(),
      rate: 0,
      transferred: false,
      paid: false,
    };
  private defaultItem: Transaction =
    { id: '',
      senderId: '',
      sender: getDefaultAccount(),
      receiverId: '',
      receiver: getDefaultAccount(),
      rate: 0,
      transferred: false,
      paid: false,
    };

  private usdToIdr: boolean = true;

  private currentRate: any = 0;

  private senderTypeahead: TypeaheadStates = {
    loading: false,
    searchQuery: '',
    items: [],
    selected: '',
  };

  private receiverTypeahead: TypeaheadStates = {
    loading: false,
    searchQuery: '',
    items: [],
    selected: '',
  };

  get formTitle() {
    return this.editedIndex === -1 ? 'New Transaction' : 'Edit Transaction';
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

  @Watch('senderTypeahead.searchQuery')
  private async onSenderSeachQueryChanged(query: string) {
    if (query && query !== this.senderTypeahead.selected) {
      this.senderTypeahead.loading = true;
      this.senderTypeahead.items = (await axios.get('/services/account', {
        params: {name: query},
      })).data;
      this.accounts = {...this.accounts, ...(_keyBy(this.senderTypeahead.items, 'id'))};
      this.senderTypeahead.loading = false;
    }
  }

  private onSenderSelected(senderId: string) {
    if (senderId.length < 1) {
      return;
    }
    const sender: Account | undefined = _find(this.accounts, (senderObj) => senderObj.id === senderId);

    if (!sender) {
      return;
    }
    this.editedItem.sender = sender;

    this.usdToIdr = sender.location === 'USA';
    this.editedItem.rate = this.usdToIdr ? this.currentRate.usdToIdrRounded : this.currentRate.idrToUsdRounded;
  }

  private onReceiverSelected(receiverId: string) {
    if (receiverId.length < 1) {
     return;
    }

    const receiver: Account | undefined = _find(this.accounts, (receiverObj) => receiverObj.id === receiverId);

    if (!receiver) {
      return;
    }
    this.editedItem.receiver = receiver;
  }

  @Watch('receiverTypeahead.searchQuery')
  private async onReceiverSeachQueryChanged(query: string) {
    if (query && query !== this.receiverTypeahead.selected) {
      this.receiverTypeahead.loading = true;
      this.receiverTypeahead.items = (await axios.get('/services/account', {
        params: {name: query},
      })).data;
      this.accounts = {...this.accounts, ...(_keyBy(this.senderTypeahead.items, 'id'))};
      this.receiverTypeahead.loading = false;
    }
  }

  private get transactions(): Transaction[] {
    return this.$store.state.transaction.transactions;
  }

  private async initialize() {
    this.$store.dispatch('transaction/initializeTransactions');
    this.currentRate = (await axios.get('/services/rate/latest')).data[0];
  }

  private editItem(item: Transaction) {
    this.editedIndex = this.transactions.indexOf(item);
    this.editedItem = Object.assign({}, item);
    this.senderTypeahead.items = [
      { name: item.sender.name, id: item.senderId },
    ];
    this.receiverTypeahead.items = [
      { name: item.receiver.name, id: item.receiverId },
    ];
    this.dialog = true;
  }

  private async deleteItem(item: any) {
    const index = this.transactions.indexOf(item);
    if (confirm('Are you sure you want to delete this item?')) {
      this.$store.dispatch('transaction/removeTransaction', item.id).catch((error: Error) => {
        alert('Failed to delete transaction');
      });
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
        this.$store.dispatch('transaction/updateTransaction',
          {editedIndex: this.editedIndex, editedTransaction: this.editedItem});
      } else {
        this.$store.dispatch('transaction/addTransaction', this.editedItem);
      }
      this.close();
    } catch (err) {
      this.failedToSave = true;
    }
  }

  private async copy() {
    const usdAmount: string = this.editedItem.usdAmount!.toLocaleString();
    const idrAmount: string = this.editedItem.idrAmount!.toLocaleString();
    const msg =
`${this.editedItem.receiver.name}
${this.editedItem.receiver.bank || ''} ${this.editedItem.receiver.branch || ''} \
    ${this.editedItem.receiver.accountNumber}
Kirim \$${usdAmount} x Rp ${this!.editedItem.rate.toLocaleString()} = Rp ${idrAmount}
dari ${this.editedItem.sender.name}`;

    clipboard.writeText(msg);
  }

  private adjustIdrAmount(usdAmount: number): void {
    this.editedItem.idrAmount = usdAmount * this.editedItem.rate;
  }

  private adjustUsdAmount(idrAmount: number) {
    this.editedItem.usdAmount = idrAmount / this.editedItem.rate;
  }
}
</script>
