<template>
  <div>
    <div class="tool" ref="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除产品吗？'"
          @on-ok="del"
          :disabled="pid === 0"
          v-if="limits.indexOf('productdel') !== -1"
        >
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <Poptip
          confirm
          :title="'确认要发布产品吗？'"
          @on-ok="prod"
          :disabled="pid === 0"
          v-if="limits.indexOf('productprod') !== -1"
        >
          <Button type="success" icon="md-checkbox-outline">发布</Button>
        </Poptip>
        <template v-if="limits.indexOf('productadd') !== -1">
          <Button type="primary" icon="md-add" @click="add">添加</Button>
        </template>
        <template v-if="limits.indexOf('productedit') !== -1">
          <Button type="info" icon="md-create" @click="edit">编辑</Button>
        </template>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="search" style="width: 120px;margin-right: 10px;">
          <Option value="pid">产品编号</Option>
          <Option value="model">产品型号</Option>
          <Option value="productname">产品名称</Option>
        </Select>
        <Input
          v-model="keyword"
          @on-enter="searchkeyword"
          style="width: 200px;"
        >
          <Button
            slot="append"
            icon="ios-search"
            @click="searchkeyword"
          ></Button>
        </Input>
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
        @on-row-dblclick="edit"
        size="small"
      >
        <template slot-scope="{ row }" slot="status">
          <template v-if="row.status === 'prod'">
            <Tag color="success">已发布</Tag>
          </template>
          <template v-if="row.status === 'dev'">
            <Tag color="warning">开发中</Tag>
          </template>
        </template>
        <template slot-scope="{ row }" slot="reg">
          <i-switch
            v-if="limits.includes('productreg')"
            :value="row.isreg"
            @on-change="reg($event, row.pid)"
          />
          <template v-else>
            <template v-if="row.isreg">
              <Tag color="success">打开</Tag>
            </template>
            <template v-if="!row.isreg">
              <Tag color="error">关闭</Tag>
            </template>
          </template>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button type="primary" size="small" @click="def(row.pid)">
            定义
          </Button>
        </template>
      </Table>
    </div>
    <div class="status">
      <Page
        :total="pagetotal"
        :page-size-opts="[30, 50, 100]"
        :page-size="pagesize"
        :current="pagenum"
        class-name="page"
        show-sizer
        show-total
        @on-change="pagenumchange"
        @on-page-size-change="pagesizechange"
        transfer
      />
    </div>
    <Modal
      v-model="isadd"
      :mask-closable="false"
      title="产品"
      width="600"
      @on-cancel="addClose"
      transfer
    >
      <Form
        :model="addform"
        :rules="addformrules"
        ref="addform"
        label-position="right"
        :label-width="80"
      >
        <FormItem label="产品名称" prop="name" class="formitem">
          <Input v-model="addform.name"></Input>
        </FormItem>
        <Row>
          <Col span="12">
            <FormItem label="产品类型" prop="type" class="formitem">
              <Select
                v-model="addform.type"
                :disabled="addform.status === 'prod'"
              >
                <Option
                  v-for="type in types"
                  :value="type.type"
                  :key="type.type"
                >
                  {{ type.typename }}
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="产品型号" prop="model" class="formitem">
              <Input
                v-model="addform.model"
                :disabled="addform.status === 'prod'"
              ></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="联网方式" prop="netmode" class="formitem">
              <Select
                v-model="addform.netmode"
                :disabled="addform.status === 'prod'"
              >
                <Option value="WiFi">WiFi</Option>
                <Option value="ZigBee">ZigBee</Option>
                <Option value="Bluetooth">蓝牙</Option>
                <Option value="LAN">LAN</Option>
                <Option value="LAN,WiFi">LAN,WiFi</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="配网IP" prop="ip" class="formitem">
              <Input v-model="addform.ip"></Input>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="所属应用" prop="appids" class="formitem">
          <CheckboxGroup v-model="addform.appids" @on-change="appChange">
            <Checkbox
              v-for="app in apps"
              :label="app.appid"
              :key="app.appid"
              border
            >
              {{ app.appname }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="产品分类" prop="catid" class="formitem">
          <Select v-model="addform.catid" style="width: 200px;">
            <Option
              v-for="cat in cats"
              :value="cat.catid"
              :key="cat.catid"
              :disabled="!cat.iscat"
            >
              {{ cat.catname }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="产品图标" prop="img" class="formitem">
          <img
            :src="imgurl + '/' + addform.img"
            width="100"
            height="100"
            v-if="addform.img"
          />
          <Upload
            :action="action"
            :format="['png', 'jpg', 'jpeg']"
            :show-upload-list="false"
            :on-success="upimgok"
            :on-error="uperr"
            :headers="{ token: token }"
          >
            <Button>上传图标</Button>
          </Upload>
        </FormItem>
        <FormItem label="配网提示" prop="reset" class="formitem">
          <Input v-model="addform.reset"></Input>
        </FormItem>
        <FormItem label="配网图片" prop="resetimg" class="formitem">
          <img
            :src="imgurl + '/' + addform.resetimg"
            width="300"
            v-if="addform.resetimg"
          />
          <Upload
            :action="action"
            :format="['png', 'jpg', 'jpeg']"
            :show-upload-list="false"
            :on-success="upresetimgok"
            :on-error="uperr"
            :headers="{ token: token }"
          >
            <Button>上传图片</Button>
          </Upload>
        </FormItem>
        <FormItem label="小米Type" prop="ptype" class="formitem">
          <Input
            v-model="addform.ptype"
            :disabled="addform.status === 'prod'"
          ></Input>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="addClose">取消</Button>
        <Button type="primary" @click="save" :loading="isadding">
          <template v-if="pid === 0">创建</template>
          <template v-else>保存</template>
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import cookie from "vue-cookies";
export default {
  name: "otas",
  props: ["limits"],
  data() {
    return {
      action: process.env.VUE_APP_API + "/upload",
      pid: 0,
      search: "pid",
      keyword: "",
      pagetotal: 0,
      pagesize: 30,
      pagenum: 1,
      tableheight: 0,
      tabletitle: [
        {
          title: "产品编号",
          width: 90,
          align: "center",
          key: "pid"
        },
        {
          title: "产品状态",
          width: 100,
          slot: "status",
          align: "center"
        },
        {
          title: "注册开关",
          width: 100,
          slot: "reg",
          align: "center"
        },
        {
          title: "产品型号",
          width: 100,
          key: "model"
        },
        {
          title: "产品名称",
          width: 200,
          key: "productname"
        },
        {
          title: "产品类型",
          width: 90,
          key: "typename"
        },
        {
          title: "联网方式",
          width: 120,
          key: "netmode",
          align: "center"
        },
        {
          title: "设备数量",
          width: 90,
          key: "devicenum",
          align: "center"
        },
        {
          title: "产品密钥",
          width: 150,
          key: "pkey",
          align: "center"
        },
        {
          title: "创建时间",
          minWidth: 160,
          key: "addtime"
        },
        {
          title: "操作",
          slot: "action",
          fixed: "right",
          width: 100,
          align: "center"
        }
      ],
      tabledata: [],
      isadd: false,
      addform: {
        name: "",
        model: "",
        type: "",
        netmode: "",
        ip: "",
        appids: [],
        catid: 0,
        ptype: "",
        img: "",
        reset: "",
        resetimg: "",
        status: "dev"
      },
      addformrules: {
        name: [
          {
            type: "string",
            required: true,
            message: "请输入产品名称"
          }
        ],
        type: [
          {
            type: "string",
            required: true,
            message: "请选择产品类型"
          }
        ],
        model: [
          {
            type: "string",
            required: true,
            message: "请输入产品型号"
          }
        ],
        netmode: [
          {
            type: "string",
            required: true,
            message: "请选择联网方式"
          }
        ],
        img: [
          {
            type: "string",
            required: true,
            message: "请上传产品图标"
          }
        ]
      },
      cats: [],
      types: [],
      apps: [],
      isadding: false,
      imgurl: ""
    };
  },
  computed: {
    token() {
      return cookie.get("token");
    }
  },
  methods: {
    pagenumchange(page) {
      this.pagenum = page;
      this.load();
    },
    pagesizechange(size) {
      this.pagesize = size;
      this.load();
    },
    searchkeyword() {
      this.pagenum = 1;
      this.load();
    },
    select(row) {
      this.pid = row.pid;
    },
    reg(isreg, pid) {
      this.$http
        .post(
          "/product/reg",
          this.$qs.stringify({
            pid: pid,
            isreg: isreg
          })
        )
        .catch(() => {
          this.load();
        });
    },
    prod() {
      this.$http
        .post(
          "/product/prod",
          this.$qs.stringify({
            pid: this.pid
          })
        )
        .then(() => {
          this.$Message.success("发布成功");
          this.load();
        });
    },
    add() {
      this.pid = 0;
      this.addform.status = "dev";
      this.isadd = true;
    },
    edit(row) {
      if (row.pid === undefined) {
        if (this.pid === 0) {
          this.$Message.error("请选择产品");
          return;
        }
        this.tabledata.forEach(prod => {
          if (prod.pid === this.pid) {
            row = prod;
          }
        });
      }
      this.addform.name = row.productname;
      this.addform.model = row.model;
      this.addform.type = row.type;
      this.addform.netmode = row.netmode;
      this.addform.appids = [];
      row.appids.split(",").forEach(appid => {
        this.addform.appids.unshift(Number(appid));
      });
      this.appChange(this.addform.appids);
      this.addform.catid = row.catid;
      this.addform.img = row.img;
      this.addform.ip = row.ip;
      this.addform.reset = row.reset;
      this.addform.resetimg = row.resetimg;
      this.addform.ptype = row.ptype;
      this.addform.status = row.status;
      this.isadd = true;
    },
    addClose() {
      this.$refs.addform.resetFields();
      this.isadd = false;
    },
    appChange(appids) {
      this.cats.forEach(cat => {
        cat.iscat = false;
        cat.appids.split(",").forEach(appid => {
          if (appids.includes(Number(appid))) {
            cat.iscat = true;
          }
        });
      });
    },
    upimgok(res) {
      if (res.code > 0) {
        this.$Message.error(res.msg);
        return;
      }
      this.addform.img = res.path;
    },
    upresetimgok(res) {
      if (res.code > 0) {
        this.$Message.error(res.msg);
        return;
      }
      this.addform.resetimg = res.path;
    },
    uperr() {
      this.$Message.error("上传失败");
    },
    save() {
      this.$refs.addform.validate(valid => {
        if (valid) {
          this.isadding = true;
          let action = "add";
          if (this.pid > 0) action = "edit";
          this.$http
            .post(
              "/product/" + action,
              this.$qs.stringify({
                pid: this.pid,
                name: this.addform.name,
                type: this.addform.type,
                model: this.addform.model,
                netmode: this.addform.netmode,
                ip: this.addform.ip,
                appids: this.addform.appids.join(","),
                catid: this.addform.catid,
                img: this.addform.img,
                reset: this.addform.reset,
                resetimg: this.addform.resetimg,
                ptype: this.addform.ptype
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
    del() {
      if (this.pid === 0) {
        this.$Message.error("请选择产品");
        return;
      }
      this.$http
        .post(
          "/product/del",
          this.$qs.stringify({
            pid: this.pid
          })
        )
        .then(() => {
          this.load();
        });
    },
    def(pid) {
      this.$emit("sidemenu", "productdef", pid);
      this.load();
    },
    load() {
      this.$http
        .get("/products", {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize,
            search: this.search,
            keyword: this.keyword
          }
        })
        .then(data => {
          this.pid = 0;
          this.tabledata = data.products;
          this.pagetotal = data.pagetotal;
          this.cats = data.cats;
          this.types = data.types;
          this.apps = data.apps;
          this.imgurl = data.imgurl;
        });
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tableheight =
        document.body.clientHeight - 160 - this.$refs.tool.offsetHeight;
    });
    const that = this;
    window.onresize = () => {
      return (() => {
        that.tableheight =
          document.body.clientHeight - 160 - this.$refs.tool.offsetHeight;
      })();
    };
  },
  created() {
    this.load();
  }
};
</script>
