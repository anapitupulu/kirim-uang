import axios, {AxiosInstance} from 'axios';
import store from '../store';

const axiosInstance: AxiosInstance = axios.create();
axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response.status === 401) {
    store.commit('setLoggedIn', false);
  }
});

export default axiosInstance;
