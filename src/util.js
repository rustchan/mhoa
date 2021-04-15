const util = {
  //是否在微信中
  isWx() {
    if (navigator.userAgent.indexOf("MicroMessenger") > 0) return true;
    else return false;
  },

  //是否在企业微信中
  isWxWork() {
    if (navigator.userAgent.indexOf("wxwork") > 0) return true;
    else return false;
  },

  //是否是手机
  isMobile() {
    if (navigator.userAgent.indexOf("iPhone") > 0) return true;
    if (navigator.userAgent.indexOf("Android") > 0) return true;
    return false;
  },

  //企业微信授权
  wxAuth() {
    let wxcorpid = process.env.VUE_APP_WXCORPID;
    let url =
      "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
      wxcorpid +
      "&redirect_uri=" +
      encodeURI(location.href) +
      "&response_type=code&scope=snsapi_base&state=wxlogin#wechat_redirect";
    location.href = url;
  },

  //获取查询变量
  getVar(name) {
    let query = location.search;
    query = query.substring(1, query.length);
    let querys = query.split("&");
    for (let i = 0; i < querys.length; i++) {
      if (querys[i].indexOf(name + "=") !== -1) {
        return querys[i].substring(name.length + 1, querys[i].length);
      }
    }
    return "";
  },

  //获取月份
  getMonth() {
    let month = new Date().getMonth() + 1;
    if (month < 10) month = "0" + month;
    return month;
  }
};

export default util;
