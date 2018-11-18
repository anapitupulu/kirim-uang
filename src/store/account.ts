export interface Account {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  branch: string;
  location: string;
  phone: string;
}

export function getDefaultAccount(): Account {
  return {
    id: '',
    name: '',
    bank: '',
    accountNumber: '',
    branch: '',
    location: '',
    phone: '',
  };
}
