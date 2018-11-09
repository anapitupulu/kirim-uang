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
                        <v-text-field v-model="editedItem.usdAmount" label="Enter US$ amount" @input="adjustIdrAmount"></v-text-field>
                      </v-flex>
                        <v-flex>
                          <v-text-field v-model="editedItem.idrAmount" label="Enter Rupiah amount" @input="adjustUsdAmount"></v-text-field>
                        </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs12 sm6 md4 v-show="usdToIdr">
                    <v-text-field v-model="editedItem.usdFee" label="Enter US$ fee"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4 v-show="!usdToIdr">
                    <v-text-field v-model="editedItem.idrFee" label="Enter Rupiah fee"></v-text-field>
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
                  <!-- hidden textarea just for copying text to ios clipboard -->
                  <textarea ref="clipboardElement" style="width: 0px">{{clipboardMessage}}</textarea>
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
        <td class="text-xs-right">{{ props.item.senderName }}</td>
        <td class="text-xs-right">{{ props.item.receiverName }}</td>
        <td class="text-xs-right">{{ props.item.usdAmount }}</td>
        <td class="text-xs-right">{{ props.item.idrAmount }}</td>
        <td class="text-xs-right">{{ props.item.rate }}</td>
        <td class="text-xs-right">{{ props.item.transferred }}</td>
        <td class="text-xs-right">{{ props.item.paid }}</td>
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
        <v-btn color="primary" @click="initialize">Reload</v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import _map from 'lodash/map';
import _find from 'lodash/find';
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import {Clipboard} from 'ts-clipboard';
import {Account} from './Accounts.vue';

interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  receiverBranch: string;
  receiverBank: string;
  receiverAccountNumber: string;
  usdAmount?: number;
  idrAmount?: number;
  rate: number;
  transferred: boolean;
  paid: boolean;
  usdFee?: number;
  idrFee?: number;
  notes?: string;
}

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

  private clipboardMessage: string = '';
  private failedToSave: boolean = false;
  private dialog: boolean = false;
  private headers: any[] = [
    { text: 'Sender', value: 'senderId', sortable: true },
    { text: 'Receiver', value: 'receiverId', sortable: true },
    { text: 'US $', value: 'usdAmount', sortable: true },
    { text: 'Rupiah', value: 'idrAmount', sortable: true },
    { text: 'Rate', value: 'rate', sortable: true },
    { text: 'Transferred', value: 'transferred', sortable: true },
    { text: 'Paid', value: 'paid', sortable: true },
    { text: 'Notes', value: 'notes', sortable: true },
  ];
  private transactions: Transaction[] = [];
  private editedIndex: number = -1;
  private editedItem: Transaction =
    { id: '',
      senderId: '',
      receiverId: '',
      senderName: '',
      receiverName: '',
      receiverBranch: '',
      receiverBank: '',
      receiverAccountNumber: '',
      rate: 0,
      transferred: false,
      paid: false,
    };
  private defaultItem: Transaction =
    { id: '',
      senderId: '',
      receiverId: '',
      senderName: '',
      receiverName: '',
      receiverBranch: '',
      receiverBank: '',
      receiverAccountNumber: '',
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
      this.senderTypeahead.loading = false;
    }
  }

  private onSenderSelected(senderId: string) {
    if (senderId.length < 1) {
      return;
    }
    const sender: any = _find(this.senderTypeahead.items, (senderObj) => senderObj.id === senderId);
    this.usdToIdr = sender.location === 'USA';
    this.editedItem.rate = this.usdToIdr ? this.currentRate.usdToIdrRounded : this.currentRate.idrToUsdRounded;
  }

  @Watch('receiverTypeahead.searchQuery')
  private async onReceiverSeachQueryChanged(query: string) {
    if (query && query !== this.receiverTypeahead.selected) {
      this.receiverTypeahead.loading = true;
      this.receiverTypeahead.items = (await axios.get('/services/account', {
        params: {name: query},
      })).data;
      this.receiverTypeahead.loading = false;
    }
  }

  private async initialize() {
    this.transactions = (await axios.get('/services/transaction')).data;
    this.currentRate = (await axios.get('/services/rate/latest')).data[0];
  }

  private editItem(item: Transaction) {
    this.editedIndex = this.transactions.indexOf(item);
    this.editedItem = Object.assign({}, item);
    this.senderTypeahead.items = [
      { name: item.senderName, id: item.senderId },
    ];
    this.receiverTypeahead.items = [
      { name: item.receiverName, id: item.receiverId },
    ];
    this.dialog = true;
  }

  private deleteItem(item: any) {
    const index = this.transactions.indexOf(item);
    if (confirm('Are you sure you want to delete this item?')) {
      this.transactions.splice(index, 1);
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
        const res: any = await axios.put('/services/transaction', this.editedItem);
        Object.assign(this.transactions[this.editedIndex], this.editedItem);
      } else {
        const res: any = await axios.post('/services/transaction', this.editedItem);
        this.transactions.push(this.editedItem);
      }
      this.close();
    } catch (err) {
      this.failedToSave = true;
    }
  }

  private copy() {
    const usdAmount: string = this.editedItem.usdAmount!.toLocaleString();
    const idrAmount: string = this.editedItem.idrAmount!.toLocaleString();
    const msg =
`${this.editedItem.receiverName}
${this.editedItem.receiverBank} ${this.editedItem.receiverBranch || ''} ${this.editedItem.receiverAccountNumber}
Kirim \$${usdAmount} x Rp ${this!.editedItem.rate.toLocaleString()} = Rp ${idrAmount}
dari ${this.editedItem.senderName}`;

    this.clipboardMessage = msg;

    this.iosCopyToClipboard(this.$refs.clipboardElement);
    Clipboard.copy(msg);

  }

  private iosCopyToClipboard(el: HTMLFormElement) {
    const oldContentEditable = el.contentEditable;
    const oldReadOnly = el.readOnly;
    const range = document.createRange();

    el.contentEditable = 'true';
    el.readOnly = false;
    range.selectNodeContents(el);

    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;

    document.execCommand('copy');
  }

  private adjustIdrAmount(usdAmount: number): void {
    this.editedItem.idrAmount = usdAmount * this.editedItem.rate;
  }

  private adjustUsdAmount(idrAmount: number) {
    this.editedItem.usdAmount = idrAmount / this.editedItem.rate;
  }
}
</script>
