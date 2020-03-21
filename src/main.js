import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import cookie from "vue-cookies";
import axios from "axios";
import qs from "qs";
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";

Vue.use(cookie);
Vue.use(ViewUI);
Vue.prototype.$http = axios;
Vue.prototype.$qs = qs;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

axios.interceptors.request.use(
  config => {
    config.baseURL = process.env.VUE_APP_API;
    config.timeout = 5000;
    config.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    const token = cookie.get("token");
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    let data = response.data;
    if (data.code > 0) {
      ViewUI.LoadingBar.destroy();
      if (data.msg) ViewUI.Message.error(data.msg);
      if (data.code === 104) {
        router.push({ path: "/login" });
      }
      return Promise.reject(data);
    } else {
      if (data.msg) ViewUI.Message.success(data.msg);
      return data;
    }
  },
  error => {
    ViewUI.LoadingBar.error();
    ViewUI.Message.error("网络错误，请重试");
    return Promise.reject(error);
  }
);
