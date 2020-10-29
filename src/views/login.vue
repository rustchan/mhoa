<template>
  <div id="loginform">
    <Card class="form">
      <div class="logo"></div>
      <Form ref="loginform" :model="loginform" :rules="rules" :label-width="0">
        <FormItem prop="user">
          <label>
            <Input
              type="text"
              v-model="loginform.user"
              placeholder="工号/手机号/邮箱"
            >
              <Icon type="md-person" slot="prepend" size="16"></Icon>
            </Input>
          </label>
        </FormItem>
        <FormItem prop="pass">
          <label>
            <Input
              type="password"
              v-model="loginform.pass"
              placeholder="登录密码"
              @on-enter="login"
            >
              <Icon type="md-lock" slot="prepend" size="16"></Icon>
            </Input>
          </label>
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="login"
            size="large"
            :loading="logining"
            style="min-width: 40%;"
            >登录
          </Button>
          <Button
            type="info"
            @click="wxlogin"
            size="large"
            :loading="wxlogining"
            style="float: right;"
            >企业微信登录
          </Button>
        </FormItem>
      </Form>
    </Card>
    <Modal v-model="iswxlogin" :footer-hide="true" :mask="false" width="400">
      <div id="wxlogin"></div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginform: {
        user: "",
        pass: ""
      },
      rules: {
        user: [
          {
            required: true,
            min: 4,
            message: "请输入正确的账号",
            trigger: "blur"
          }
        ],
        pass: [
          {
            required: true,
            min: 8,
            message: "请输入正确的密码",
            trigger: "blur"
          }
        ]
      },
      iswxlogin: false,
      logining: false,
      wxlogining: false
    };
  },
  methods: {
    login() {
      this.$refs.loginform.validate(valid => {
        if (valid) {
          this.logining = true;
          this.$http
            .post(
              "/login",
              this.$qs.stringify({
                user: this.loginform.user,
                pass: this.loginform.pass
              })
            )
            .then(data => {
              if (data.token) {
                this.$cookies.set("token", data.token, 0);
              }
              this.$Message.success("登录成功");
              this.logining = false;
              this.$router.push("/");
            })
            .catch(() => {
              this.logining = false;
            });
        }
      });
    },
    wxlogin() {
      this.wxlogining = true;
      this.$http
        .get("/wxinfo")
        .then(data => {
          this.wxlogining = false;
          window.WwLogin({
            id: "wxlogin",
            appid: data.appid,
            agentid: data.agentid,
            redirect_uri:
              location.protocol + "//" + location.hostname + "/wxlogin",
            state: "wxlogin"
          });
          this.iswxlogin = true;
        })
        .catch(() => {
          this.wxlogining = false;
        });
    }
  }
};
</script>

<style scoped>
#loginform {
  background-image: url("../assets/login.jpg");
  background-size: contain;
  height: 100%;
  padding-top: 150px;
}
.logo {
  margin: 20px auto;
  width: 100px;
  height: 100px;
  background-image: url("../assets/logo.png");
}
.form {
  width: 400px;
  margin: 0 auto;
  padding: 20px;
}
#wxlogin {
  text-align: center;
}
</style>
