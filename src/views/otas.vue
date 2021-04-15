<template>
  <div>
    <div class="tool" ref="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除固件吗？'"
          @on-ok="del"
          :disabled="otaid === 0"
          v-if="limits.indexOf('otadel') !== -1"
        >
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <Button
          type="primary"
          icon="md-add"
          v-if="limits.indexOf('otaadd') !== -1"
          @click="isaddmodal = true"
        >
          添加
        </Button>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="pid" @on-change="load" style="width: 200px;">
          <Option value="0">全部产品</Option>
          <Option
            v-for="product in products"
            :value="product.pid"
            :key="product.pid"
          >
            {{ product.pid }}-{{ product.productname }}
          </Option>
        </Select>
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
        <template slot-scope="{ row }" slot="status">
          <template v-if="row.status === 'checked'">
            <Tag color="success">已验证</Tag>
          </template>
          <template v-if="row.status === 'uncheck'">
            <Tag color="default">未验证</Tag>
          </template>
          <template v-if="row.status === 'checking'">
            <Tag color="warning">验证中</Tag>
          </template>
          <template v-if="row.status === 'checkfail'">
            <Tag color="error">已失败</Tag>
          </template>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button
            type="info"
            size="small"
            v-if="limits.indexOf('ota') !== -1"
            @click="ota(row.otaid)"
          >
            查看
          </Button>
          <Button
            type="success"
            size="small"
            v-if="limits.indexOf('otaupdate') !== -1"
            @click="updatemodal(row.otaid)"
            :disabled="row.status !== 'checked'"
          >
            升级
          </Button>
          <Button
            type="warning"
            size="small"
            v-if="limits.indexOf('otacheck') !== -1"
            @click="checkmodal(row.otaid)"
            :disabled="row.status === 'checked' || row.status === 'checking'"
          >
            验证
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
      v-model="isaddmodal"
      :mask-closable="false"
      title="固件添加"
      width="400"
      @on-cancel="addmodalclose"
    >
      <Form
        :model="addform"
        :rules="addformrules"
        ref="addform"
        label-position="top"
      >
        <FormItem label="所属产品" prop="pid" class="formitem">
          <Select v-model="addform.pid">
            <Option
              v-for="product in products"
              :value="product.pid"
              :key="product.pid"
            >
              {{ product.pid }} - {{ product.productname }} -
              {{ product.model }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="固件版本" prop="ver" class="formitem">
          <Input v-model="addform.ver"></Input>
        </FormItem>
        <FormItem label="固件文件" prop="file" class="formitem">
          <Upload
            :action="action"
            :format="['bin']"
            :show-upload-list="false"
            :data="updata"
            :on-success="upok"
            :on-error="uperr"
            :headers="{ token: token }"
          >
            <Button>
              <span v-if="addform.file !== ''">重新</span>上传固件
            </Button>
            <br /><span v-if="addform.file !== ''">已上传成功</span>
          </Upload>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="addmodalclose">取消</Button>
        <Button type="primary" @click="add" :loading="adding">添加</Button>
      </template>
    </Modal>
    <Modal
      v-model="ischeckmodal"
      :mask-closable="false"
      title="固件验证"
      @on-cancel="checkmodalclose"
    >
      <Form
        :model="checkform"
        :rules="checkformrules"
        ref="checkform"
        label-position="top"
      >
        <FormItem label="待升级版本号" prop="vers" class="formitem">
          <Select v-model="checkform.vers" multiple :filterable="true">
            <Option v-for="(ver, i) in vers" :value="ver" :key="i">
              {{ ver }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="待升级设备" prop="dids" class="formitem">
          <Select
            v-model="checkform.dids"
            multiple
            remote
            :filterable="true"
            :remote-method="checkdevice"
          >
            <Option v-for="(device, i) in devices" :value="device.did" :key="i">
              {{ device.did }} - {{ device.ver }}
            </Option>
          </Select>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="checkmodalclose">取消</Button>
        <Button type="info" @click="check" :loading="checking">验证</Button>
      </template>
    </Modal>
    <Modal
      v-model="isupdatemodal"
      :mask-closable="false"
      title="固件升级"
      @on-cancel="updatemodalclose"
      width="400"
    >
      <Form
        :model="updateform"
        :rules="updateformrules"
        ref="updateform"
        label-position="top"
      >
        <FormItem label="待升级版本号" prop="vers" class="formitem">
          <Select v-model="updateform.vers" multiple :filterable="true">
            <Option v-for="(ver, i) in vers" :value="ver" :key="i">
              {{ ver }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="升级时间" class="formitem">
          <DatePicker
            type="datetime"
            placeholder="立即升级"
            :editable="false"
            style="width: 200px"
            @on-change="updatetime"
            :value="updateform.updatetime"
          ></DatePicker>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="updatemodalclose">取消</Button>
        <Button type="info" @click="update" :loading="updating">升级</Button>
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
      loading: false,
      pid: "0",
      otaid: 0,
      otapid: 0,
      otaver: "",
      pagetotal: 0,
      pagesize: 30,
      pagenum: 1,
      tableheight: 0,
      tabletitle: [
        {
          title: "产品编号",
          width: 90,
          key: "pid",
          align: "center"
        },
        {
          title: "版本号",
          width: 90,
          align: "center",
          key: "ver"
        },
        {
          title: "固件状态",
          width: 100,
          slot: "status",
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
          title: "添加时间",
          minWidth: 160,
          key: "addtime"
        },
        {
          title: "操作",
          width: 200,
          slot: "action",
          align: "center",
          fixed: "right"
        }
      ],
      tabledata: [],
      products: [],
      isaddmodal: false,
      adding: false,
      addform: {
        pid: 0,
        ver: "",
        file: "",
        md5: ""
      },
      addformrules: {
        pid: [
          {
            type: "integer",
            required: true,
            min: 1,
            message: "请选择所属产品",
            trigger: "change"
          }
        ],
        ver: [
          {
            type: "string",
            required: true,
            min: 3,
            message: "请输入版本号",
            trigger: "blur"
          }
        ],
        file: [
          {
            type: "string",
            required: true,
            message: "请上传固件"
          }
        ]
      },
      updata: {
        type: "ota"
      },
      ischeckmodal: false,
      checking: false,
      checkform: {
        vers: [],
        dids: []
      },
      checkformrules: {
        dids: [
          {
            type: "array",
            required: true,
            message: "请选择设备",
            trigger: "change"
          }
        ],
        vers: [
          {
            type: "array",
            required: true,
            message: "请选择版本号",
            trigger: "change"
          }
        ]
      },
      vers: [],
      devices: [],
      isupdatemodal: false,
      updating: false,
      updateform: {
        vers: [],
        updatetime: ""
      },
      updateformrules: {
        vers: [
          {
            type: "array",
            required: true,
            message: "请选择版本号",
            trigger: "change"
          }
        ]
      }
    };
  },
  computed: {
    token() {
      return cookie.get("token");
    }
  },
  methods: {
    updatetime(time) {
      this.updateform.updatetime = time;
    },
    update() {
      this.$refs.updateform.validate(valid => {
        if (valid) {
          this.updating = true;
          this.$http
            .post(
              "/ota/update",
              this.$qs.stringify(
                {
                  otaid: this.otaid,
                  vers: this.updateform.vers,
                  updatetime: this.updateform.updatetime
                },
                { indices: false }
              )
            )
            .then(() => {
              this.$Message.success("固件升级提交成功");
              this.updatemodalclose();
              this.updating = false;
            })
            .catch(() => {
              this.updating = false;
            });
        }
      });
    },
    updatemodal(otaid) {
      if (otaid > 0) this.otaid = otaid;
      this.tabledata.forEach(data => {
        if (data.otaid === otaid) {
          this.otapid = data.pid;
          this.otaver = data.ver;
        }
      });
      this.$http
        .get("/ota/ver", {
          params: {
            pid: this.otapid
          }
        })
        .then(data => {
          this.vers = [];
          data.vers.forEach(ver => {
            if (ver !== this.otaver) this.vers.push(ver);
          });
          this.isupdatemodal = true;
        });
    },
    updatemodalclose() {
      this.isupdatemodal = false;
      this.updateform.updatetime = "";
      this.$refs.updateform.resetFields();
    },
    ota(otaid) {
      if (otaid > 0) this.otaid = otaid;
      if (this.otaid === 0) return;
      this.$router.push({ path: "/ota/" + this.otaid });
    },
    checkdevice(keyword) {
      if (keyword === "") return;
      this.$http
        .get("/devices", {
          params: {
            pagenum: 1,
            pagesize: 10,
            pid: this.otapid,
            search: "did",
            keyword: keyword
          }
        })
        .then(data => {
          this.dids = [];
          this.devices = [];
          data.devices.forEach(device => {
            if (device.status === "online" && device.ver !== this.otaver) {
              this.devices.push(device);
            }
          });
        });
    },
    check() {
      this.$refs.checkform.validate(valid => {
        if (valid) {
          this.checking = true;
          this.$http
            .post(
              "/ota/check",
              this.$qs.stringify(
                {
                  otaid: this.otaid,
                  vers: this.checkform.vers,
                  dids: this.checkform.dids
                },
                { indices: false }
              )
            )
            .then(() => {
              this.$Message.success("固件验证提交成功");
              this.load();
              this.checkmodalclose();
              this.checking = false;
            })
            .catch(() => {
              this.checking = false;
            });
        }
      });
    },
    checkmodal(otaid) {
      if (otaid > 0) this.otaid = otaid;
      this.tabledata.forEach(data => {
        if (data.otaid === otaid) {
          this.otapid = data.pid;
          this.otaver = data.ver;
        }
      });
      this.$http
        .get("/ota/ver", {
          params: {
            pid: this.otapid
          }
        })
        .then(data => {
          this.vers = [];
          data.vers.forEach(ver => {
            if (ver !== this.otaver) this.vers.push(ver);
          });
          this.ischeckmodal = true;
        });
    },
    checkmodalclose() {
      this.ischeckmodal = false;
      this.$refs.checkform.resetFields();
      this.dids = [];
    },
    addmodalclose() {
      this.isaddmodal = false;
      this.$refs.addform.resetFields();
    },
    add() {
      this.$refs.addform.validate(valid => {
        if (valid) {
          this.adding = true;
          this.$http
            .post(
              "/ota/add",
              this.$qs.stringify({
                pid: this.addform.pid,
                ver: this.addform.ver,
                file: this.addform.file,
                md5: this.addform.md5
              })
            )
            .then(() => {
              this.$Message.success("固件添加成功");
              this.load();
              this.addmodalclose();
              this.adding = false;
            })
            .catch(() => {
              this.adding = false;
            });
        }
      });
    },
    del() {
      this.$http
        .post(
          "/ota/del",
          this.$qs.stringify({
            otaid: this.otaid
          })
        )
        .then(() => {
          this.$Message.success("固件删除成功");
          this.load();
        });
    },
    upok(res) {
      if (res.code > 0) {
        this.$Message.error(res.msg);
        return;
      }
      this.addform.file = res.path;
      this.addform.md5 = res.md5;
    },
    uperr() {
      this.$Message.error("固件上传失败");
    },
    pagenumchange(page) {
      this.pagenum = page;
      this.load();
    },
    pagesizechange(size) {
      this.pagesize = size;
      this.load();
    },
    select(row) {
      this.otaid = row.otaid;
    },
    load() {
      this.$http
        .get("/otas", {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize,
            pid: this.pid
          }
        })
        .then(data => {
          this.otaid = 0;
          this.tabledata = data.otas;
          this.pagetotal = data.pagetotal;
          this.products = data.products;
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
