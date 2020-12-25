<template>
  <div class="wxmpmenu">
    <div class="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除菜单吗？'"
          @on-ok="del"
          v-if="limits.indexOf('wxmpmenudel') !== -1"
        >
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <Button
          type="primary"
          icon="md-add"
          v-if="limits.indexOf('wxmpmenuadd') !== -1"
          @click="addShow"
        >
          添加
        </Button>
        <Button
          type="info"
          icon="md-create"
          v-if="limits.indexOf('wxmpmenuedit') !== -1"
          @click="editShow"
        >
          编辑
        </Button>
        <Button
          type="success"
          icon="md-arrow-up"
          v-if="limits.indexOf('wxmpmenuup') !== -1"
          @click="up"
        >
          上传
        </Button>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
    </div>
    <div class="data">
      <Table
        :columns="tabletitle"
        :data="tabledata"
        border
        stripe
        highlight-row
        :height="tableheight"
        @on-current-change="select"
        size="small"
      >
        <template slot-scope="{ row }" slot="name">
          <template v-if="row.pid > 0">
            <Icon type="md-arrow-round-forward" />
          </template>
          {{ row.name }}
        </template>
        <template slot-scope="{ row }" slot="type">
          <template v-if="row.type === 'click'">
            点击功能
          </template>
          <template v-if="row.type === 'view'">
            跳转网页
          </template>
          <template v-if="row.type === 'miniprogram'">
            打开小程序
          </template>
        </template>
        <template slot-scope="{ row }" slot="param">
          <template v-if="row.param === 'service'">
            在线客服
          </template>
          <template v-if="row.param > 0">
            发送消息 ->
            <template v-for="msg in msgs">
              <template v-if="msg.msgid === Number(row.param)">
                {{ msg.title }}
              </template>
            </template>
          </template>
          <template v-if="row.type === 'view'"> {{ row.url }} </template>
          <template v-if="row.type === 'miniprogram'">
            <template v-for="app in apps">
              <template v-if="app.appid === row.param">
                {{ app.name }}
              </template>
            </template>
          </template>
        </template>
      </Table>
    </div>
    <Modal
      v-model="isshowadd"
      :mask-closable="false"
      title="菜单"
      width="500"
      @on-cancel="addClose"
    >
      <Form
        :model="addform"
        :rules="addformrules"
        ref="addform"
        label-position="right"
        :label-width="80"
      >
        <FormItem label="菜单排序" prop="sort" class="formitem">
          <Input v-model="addform.sort" style="width: 200px;"></Input>
        </FormItem>
        <FormItem
          label="上级菜单"
          prop="pid"
          class="formitem"
          v-if="menuid === 0"
        >
          <Select v-model="addform.pid" style="width: 200px;">
            <Option v-if="upmenus.length < 3" value="0">顶级分类</Option>
            <Option
              v-for="upmenu in upmenus"
              :value="upmenu.menuid"
              :key="upmenu.menuid"
            >
              {{ upmenu.name }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="菜单名称" prop="name" class="formitem">
          <Input v-model="addform.name" style="width: 200px;"></Input>
        </FormItem>
        <FormItem label="菜单类型" prop="type" class="formitem">
          <RadioGroup v-model="addform.type" @on-change="typeChange">
            <Radio label="click">点击功能</Radio>
            <Radio label="view">跳转网页</Radio>
            <Radio label="miniprogram">打开小程序</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="点击功能"
          prop="param"
          class="formitem"
          v-if="isshowparam"
        >
          <Select v-model="addform.param">
            <Option value="service">在线客服</Option>
            <Option v-for="msg in msgs" :value="msg.msgid" :key="msg.msgid">
              发送消息 -> {{ msg.title }}
            </Option>
          </Select>
        </FormItem>
        <FormItem
          label="小程序"
          prop="appid"
          class="formitem"
          v-if="isshowappid"
        >
          <Select v-model="addform.appid">
            <Option v-for="app in apps" :value="app.appid" :key="app.appid">
              {{ app.name }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="网页地址" prop="url" class="formitem" v-if="isshowurl">
          <Input v-model="addform.url"></Input>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="addClose">取消</Button>
        <Button type="primary" @click="add" :loading="isadding">
          <template v-if="menuid === 0">添加</template>
          <template v-else>编辑</template>
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
export default {
  name: "wxmpmenu",
  props: ["limits"],
  data() {
    return {
      menuid: 0,
      isshowadd: false,
      isshowparam: true,
      isshowurl: false,
      isshowappid: false,
      isadding: false,
      upmenus: [],
      msgs: [],
      apps: [],
      tableheight: 0,
      tabletitle: [
        {
          title: "排序",
          width: 80,
          align: "center",
          key: "sort"
        },
        {
          title: "菜单名称",
          width: 120,
          slot: "name"
        },
        {
          title: "菜单类型",
          width: 100,
          slot: "type"
        },
        {
          title: "菜单参数",
          minWidth: 200,
          slot: "param"
        }
      ],
      tabledata: [],
      addform: {
        sort: 100,
        pid: "0",
        name: "",
        type: "click",
        param: "",
        url: "",
        appid: ""
      },
      addformrules: {
        name: [
          {
            type: "string",
            required: true,
            message: "请输入菜单名称"
          }
        ],
        param: [
          {
            // eslint-disable-next-line no-unused-vars
            validator: (rule, value, callback) => {
              if (
                this.addform.type !== "click" ||
                (value !== "" && value !== undefined)
              )
                callback();
              else return callback(new Error("请选择点击功能"));
            }
          }
        ],
        url: [
          {
            validator: (rule, value, callback) => {
              if (this.addform.type === "click" || value.indexOf("http") !== -1)
                callback();
              else return callback(new Error("请输入网页地址"));
            }
          }
        ],
        appid: [
          {
            validator: (rule, value, callback) => {
              if (
                this.addform.type !== "miniprogram" ||
                (value !== "" && value !== undefined)
              )
                callback();
              else return callback(new Error("请选择小程序"));
            }
          }
        ]
      }
    };
  },
  methods: {
    load() {
      this.$http.get("/wxmpmenu").then(data => {
        this.upmenus = data.upmenus;
        this.msgs = data.msgs;
        this.apps = data.apps;
        this.tabledata = data.menus;
      });
    },
    addShow() {
      this.menuid = 0;
      this.isshowadd = true;
    },
    editShow() {
      if (this.menuid === 0) {
        this.$Message.error("请选择菜单");
        return;
      }
      this.tabledata.forEach(row => {
        if (row.menuid === this.menuid) {
          this.addform.name = row.name;
          this.addform.sort = row.sort;
          this.addform.type = row.type;
          this.addform.url = row.url;
          if (row.type === "click") {
            this.addform.param = row.param;
            if (row.param > 0) this.addform.param = Number(row.param);
          }
          if (row.type === "miniprogram") {
            this.addform.appid = row.param;
          }
          this.typeChange(row.type);
        }
      });
      this.isshowadd = true;
    },
    addClose() {
      this.addform.type = "click";
      this.typeChange("click");
      this.$refs.addform.resetFields();
      this.isshowadd = false;
    },
    typeChange(type) {
      if (type === "click") this.isshowparam = true;
      else if (this.isshowparam) {
        this.$refs.addform.validateField("param");
        this.isshowparam = false;
      }
      if (type === "miniprogram") this.isshowappid = true;
      else if (this.isshowappid) {
        this.$refs.addform.validateField("appid");
        this.isshowappid = false;
      }
      if (type === "view" || type === "miniprogram") {
        this.isshowurl = true;
      } else if (this.isshowurl) {
        this.$refs.addform.validateField("url");
        this.isshowurl = false;
      }
    },
    select(row) {
      this.menuid = row.menuid;
    },
    add() {
      this.$refs.addform.validate(valid => {
        if (valid) {
          this.isadding = true;
          let action = "add";
          if (this.menuid > 0) action = "edit";
          this.$http
            .post(
              "/wxmpmenu/" + action,
              this.$qs.stringify({
                menuid: this.menuid,
                sort: this.addform.sort,
                pid: this.addform.pid,
                name: this.addform.name,
                type: this.addform.type,
                param: this.addform.param,
                url: this.addform.url,
                appid: this.addform.appid
              })
            )
            .then(() => {
              this.load();
              this.addClose();
              this.isadding = false;
            })
            .catch(() => {
              this.isadding = false;
            });
        }
      });
    },
    up() {
      this.$http.post("/wxmpmenu/up").then(() => {
        this.$Message.success("菜单上传成功");
      });
    },
    del() {
      if (this.menuid === 0) {
        this.$Message.error("请选择菜单");
        return;
      }
      this.$http
        .post(
          "/wxmpmenu/del",
          this.$qs.stringify({
            menuid: this.menuid
          })
        )
        .then(() => {
          this.load();
        });
    }
  },
  mounted() {
    this.tableheight = document.body.clientHeight - 160;
    const that = this;
    window.onresize = () => {
      return (() => {
        that.tableheight = document.body.clientHeight - 160;
      })();
    };
  },
  created() {
    this.load();
  }
};
</script>

<style scoped></style>
