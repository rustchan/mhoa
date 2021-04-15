<template>
  <div class="device">
    <div class="tool" ref="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除' + dids.length + '个设备吗？'"
          @on-ok="del"
          :disabled="dids.length === 0"
          v-if="limits.indexOf('devicedel') !== -1"
        >
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <Poptip
          confirm
          :title="'确认要禁用' + dids.length + '个设备吗？'"
          @on-ok="disable"
          :disabled="dids.length === 0"
          v-if="limits.indexOf('devicedisable') !== -1"
        >
          <Button type="warning" icon="md-lock">禁用</Button>
        </Poptip>
        <Poptip
          confirm
          :title="'确认要启用' + dids.length + '个设备吗？'"
          @on-ok="enable"
          :disabled="dids.length === 0"
          v-if="limits.indexOf('deviceenable') !== -1"
        >
          <Button type="success" icon="md-checkmark-circle">启用</Button>
        </Poptip>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select
          v-model="pid"
          @on-change="load"
          style="width: 200px;margin-right: 10px;"
        >
          <Option value="0">全部产品</Option>
          <Option
            v-for="product in products"
            :value="product.pid"
            :key="product.pid"
          >
            {{ product.productname }}
          </Option>
        </Select>
        <Select v-model="search" style="width: 120px;margin-right: 10px;">
          <Option value="did">设备编号</Option>
          <Option value="mac">MAC地址</Option>
          <Option value="ip">IP地址</Option>
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
        :height="tableheight"
        @on-selection-change="selectchange"
        @on-row-dblclick="device"
        size="small"
      >
        <template slot-scope="{ row }" slot="status">
          <template v-if="row.status === 'online'">
            <Tag color="success">上线</Tag>
          </template>
          <template v-if="row.status === 'offline'">
            <Tag color="error">离线</Tag>
          </template>
          <template v-if="row.status === 'unactive'">
            <Tag color="primary">待激活</Tag>
          </template>
          <template v-if="row.status === 'disable'">
            <Tag color="warning">禁用</Tag>
          </template>
          <template v-if="row.status === 'ota'">
            <Tag color="warning">升级中</Tag>
          </template>
        </template>
        <template
          slot-scope="{ row }"
          slot="action"
          v-if="limits.indexOf('device') !== -1"
        >
          <a style="font-size: 14px;" @click="data(row.did)">查看</a>
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
    <Drawer
      :title="'设备' + did"
      v-model="isdrawer"
      width="350"
      :mask="false"
      @on-close="close"
    >
      <Tabs :animated="false" v-model="tab">
        <TabPane name="info" label="设备信息">
          <Table
            :columns="devicetitle"
            :data="deviceinfo"
            border
            disabled-hover
            :show-header="false"
            size="small"
          >
            <template slot-scope="{ row, index }" slot="data">
              <template v-if="index === 1">
                <template v-if="row.data === 'online'">
                  <Tag color="success">上线</Tag>
                </template>
                <template v-if="row.data === 'offline'">
                  <Tag color="error">离线</Tag>
                </template>
                <template v-if="row.data === 'unactive'">
                  <Tag color="primary">待激活</Tag>
                </template>
                <template v-if="row.data === 'disable'">
                  <Tag color="warning">禁用</Tag>
                </template>
                <template v-if="row.data === 'ota'">
                  <Tag color="warning">升级中</Tag>
                </template>
              </template>
              <template v-else>{{ row.data }}</template>
            </template>
          </Table>
        </TabPane>
        <TabPane name="data" label="运行数据">
          <template v-for="(def, i) in devicedef">
            <Card :key="i" style="margin-bottom: 20px;" :dis-hover="true">
              <p slot="title">{{ def.funcname }}</p>
              <template v-if="def.functype === 'switch'">
                <Button
                  type="info"
                  size="small"
                  slot="extra"
                  @click.prevent="sw(def.id)"
                  v-if="limits.indexOf('deviceswitch') !== -1"
                >
                  {{ def.action }}
                </Button>
              </template>
              <p style="font-size: 30px;">
                <template v-if="def.datatype === 'bool'">
                  {{ def.value }}
                </template>
                <template v-else>{{ def.data }}</template>
                <span style="font-size: 20px;">{{ def.unit }}</span>
              </p>
            </Card>
          </template>
        </TabPane>
      </Tabs>
    </Drawer>
  </div>
</template>

<script>
export default {
  name: "devices",
  props: ["limits"],
  data() {
    return {
      loading: false,
      tab: "info",
      isdrawer: false,
      pid: "0",
      search: "did",
      keyword: "",
      pagetotal: 0,
      pagesize: 30,
      pagenum: 1,
      tableheight: 0,
      tabletitle: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "设备编号",
          width: 100,
          align: "center",
          key: "did"
        },
        {
          title: "设备状态",
          width: 100,
          align: "center",
          slot: "status"
        },
        {
          title: "产品型号",
          width: 100,
          key: "model"
        },
        {
          title: "产品名称",
          width: 160,
          key: "productname"
        },
        {
          title: "产品类型",
          width: 90,
          key: "typename"
        },
        {
          title: "联网方式",
          width: 90,
          key: "netmode"
        },
        {
          title: "固件",
          width: 90,
          key: "ver",
          align: "center"
        },
        {
          title: "IP地址",
          width: 140,
          key: "ip"
        },
        {
          title: "MAC地址",
          width: 150,
          key: "mac"
        },
        {
          title: "注册时间",
          width: 160,
          key: "regtime"
        },
        {
          title: "最后上线时间",
          minWidth: 160,
          key: "lasttime"
        },
        {
          title: "操作",
          width: 120,
          slot: "action",
          align: "center",
          fixed: "right"
        }
      ],
      tabledata: [],
      products: [],
      did: 0,
      dids: [],
      devicetitle: [
        {
          width: 120,
          key: "key",
          className: "key"
        },
        {
          key: "data",
          slot: "data"
        }
      ],
      deviceinfo: [
        {
          key: "设备编号",
          data: ""
        },
        {
          key: "设备状态",
          data: ""
        },
        {
          key: "固件版本",
          data: ""
        },
        {
          key: "IP地址",
          data: ""
        },
        {
          key: "MAC地址",
          data: ""
        },
        {
          key: "产品编号",
          data: ""
        },
        {
          key: "产品型号",
          data: ""
        },
        {
          key: "产品名称",
          data: ""
        },
        {
          key: "产品类型",
          data: ""
        },
        {
          key: "联网方式",
          data: ""
        },
        {
          key: "注册时间",
          data: ""
        },
        {
          key: "最后上线",
          data: ""
        }
      ],
      devicedef: [],
      timer: 0,
      timerload: 0
    };
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
    selectchange(selection) {
      this.dids = [];
      selection.forEach(row => {
        this.dids.push(row.did);
      });
    },
    del() {
      this.$http
        .post(
          "/device/del",
          this.$qs.stringify({
            dids: this.dids.join(",")
          })
        )
        .then(() => {
          this.$Message.success("删除成功");
          this.load();
        });
    },
    disable() {
      this.$http
        .post(
          "/device/disable",
          this.$qs.stringify({
            dids: this.dids.join(",")
          })
        )
        .then(() => {
          this.$Message.success("禁用成功");
          this.load();
        });
    },
    enable() {
      this.$http
        .post(
          "/device/enable",
          this.$qs.stringify({
            dids: this.dids.join(",")
          })
        )
        .then(() => {
          this.$Message.success("启用成功");
          this.load();
        });
    },
    close() {
      clearInterval(this.timer);
      this.timer = 0;
    },
    device(row) {
      if (row.did > 0) this.data(row.did);
    },
    data(did) {
      if (did > 0) {
        this.did = did;
        if (this.timer === 0) this.timer = setInterval(this.data, 2000);
        this.tab = "info";
      } else did = this.did;
      this.isdrawer = true;
      this.$http
        .get("/device", {
          params: {
            did: did
          }
        })
        .then(data => {
          this.deviceinfo[0].data = data.device.did;
          this.deviceinfo[1].data = data.device.status;
          this.deviceinfo[2].data = data.device.ver;
          this.deviceinfo[3].data = data.device.ip;
          this.deviceinfo[4].data = data.device.mac;
          this.deviceinfo[5].data = data.product.pid;
          this.deviceinfo[6].data = data.product.model;
          this.deviceinfo[7].data = data.product.productname;
          this.deviceinfo[8].data = data.product.typename;
          this.deviceinfo[9].data = data.product.netmode;
          this.deviceinfo[10].data = data.device.regtime;
          this.deviceinfo[11].data = data.device.lasttime;
          this.devicedef = data.def;
          this.devicedef.forEach(def => {
            def.data = data.data[def.id];
            if (def.datatype === "bool") {
              def.value = def.datavalue.split(",")[def.data];
              if (def.data === "1") {
                def.action = def.datavalue.split(",")[0];
              } else {
                def.action = def.datavalue.split(",")[1];
              }
            }
          });
          this.tabledata.forEach(row => {
            if (row.did === did) row.status = data.device.status;
          });
        });
    },
    sw(defid) {
      let data = "1";
      this.devicedef.forEach(def => {
        if (def.id === defid) {
          if (def.data === "1") data = "0";
        }
      });

      this.$http
        .post(
          "/device/switch",
          this.$qs.stringify({
            did: this.did,
            part: defid,
            data: data
          })
        )
        .then(() => {
          this.devicedef.forEach((def, i) => {
            if (def.id === defid) {
              def.data = data;
              def.value = def.datavalue.split(",")[def.data];
              if (def.data === "1") {
                def.action = def.datavalue.split(",")[0];
              } else {
                def.action = def.datavalue.split(",")[1];
              }
              this.$set(this.devicedef, i, def);
            }
          });
        });
    },
    load() {
      this.dids = [];
      this.$http
        .get("/devices", {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize,
            search: this.search,
            keyword: this.keyword,
            pid: this.pid
          }
        })
        .then(data => {
          this.tabledata = data.devices;
          this.pagetotal = data.pagetotal;
          this.products = data.products;
        });
      if (this.timerload === 0) this.timerload = setInterval(this.load, 10000);
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
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) clearInterval(this.timer);
    clearInterval(this.timerload);
    this.isdrawer = false;
    next();
  }
};
</script>
