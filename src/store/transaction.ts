import _findIndex from 'lodash/findIndex';
import axios from 'axios';
import {MutationTree, ActionTree, ActionContext} from 'vuex';
import {Account} from './account';

export interface Transaction {
  id: string;
  senderId: string;
  sender: Account;
  receiverId: string;
  receiver: Account;
  usdAmount?: number;
  idrAmount?: number;
  rate: number;
  transferred: boolean;
  paid: boolean;
  usdFee?: number;
  idrFee?: number;
  notes?: string;
}

class State {
  public transactions: Transaction[] = [];
}

const actions: ActionTree<State, any> = {
  async initializeTransactions(context: ActionContext<State, any>, newTransactions: Transaction[]): Promise<void> {
    context.state.transactions = (await axios.get('/services/transaction')).data;
  },
  async removeTransaction(context: ActionContext<State, any>, transactionId: string): Promise<void> {
    const res: any = await axios.delete('/services/transaction', {data: {id: transactionId}});
    const removedIndex: number = _findIndex(context.state.transactions, (transaction: Transaction) => {
      return transaction.id === transactionId;
    });
    context.state.transactions.splice(removedIndex, 1);
  },
  async addTransaction(context: ActionContext<State, any>, newTransaction: Transaction) {
    const transaction: Transaction = (await axios.post('/services/transaction', newTransaction)).data;
    context.state.transactions.push(transaction);
  },
  async updateTransaction(context: ActionContext<State, any>, {editedIndex, editedTransaction}) {
    await axios.put('/services/transaction', editedTransaction);
    Object.assign(context.state.transactions[editedIndex], editedTransaction);
  },
};

export default {
  actions,
  state: new State(),
  namespaced: true,
};
