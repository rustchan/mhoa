import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import cookie from "vue-cookies";
import axios from "axios";
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";

Vue.use(cookie);
Vue.use(ViewUI);
Vue.prototype.$http = axios;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
