<template>
  <div class="device">
    <div class="tool">
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
        <Select v-model="search" style="width: 120px;margin-right: 10px;">
          <Option value="did">设备编号</Option>
          <Option value="devicename">设备名称</Option>
          <Option value="uid">用户编号</Option>
          <Option value="pid">产品编号</Option>
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
        :loading="tableloading"
        @on-selection-change="selectchange"
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
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button type="primary" size="small" @click="data(row.did)">
            查看
          </Button>
        </template>
      </Table>
    </div>
    <div class="page">
      <Page
        :total="pagetotal"
        :page-size-opts="[30, 50, 100]"
        :page-size="pagesize"
        :current="pagenum"
        show-sizer
        show-total
        @on-change="pagenumchange"
        @on-page-size-change="pagesizechange"
      />
    </div>
    <Drawer
      :title="did"
      v-model="isdrawer"
      width="350"
      :mask="false"
      :styles="styles"
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
              </template>
              <template v-else-if="index === 10">
                <template v-if="row.data === 'device'">
                  设备
                </template>
                <template v-else-if="row.data === 'subdevice'">
                  子设备
                </template>
                <template v-else-if="row.data === 'gateway'">
                  网关
                </template>
              </template>
              <template v-else>{{ row.data }}</template>
            </template>
          </Table>
        </TabPane>
        <TabPane name="data" label="运行数据">
          <template v-for="(def, i) in devicedef">
            <Card
              :key="i"
              :title="def.name"
              style="margin-bottom: 20px;"
              :dis-hover="true"
            >
              <p style="font-size: 30px;">
                {{ devicedata[def.id] }}
                <span style="font-size: 20px;">
                  <template v-if="def.type === 'bool'">
                    ({{ def.typedata.split(",")[devicedata[def.id]] }})
                  </template>
                  {{ def.unit }}
                </span>
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
      tab: "info",
      isdrawer: false,
      tableloading: false,
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
          width: 90,
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
          width: 150,
          key: "productname"
        },
        {
          title: "设备名称",
          width: 120,
          key: "devicename"
        },
        {
          title: "固件版本",
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
          width: 150,
          key: "addtime"
        },
        {
          title: "最后上线时间",
          width: 150,
          key: "lasttime"
        },
        {
          title: "操作",
          slot: "action"
        }
      ],
      tabledata: [],
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
          key: "设备名称",
          data: ""
        },
        {
          key: "用户编号",
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
      devicedata: [],
      devicedef: [],
      timer: 0
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
          "/devicedel",
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
          "/devicedisable",
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
          "/deviceenable",
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
    data(did) {
      if (did > 0) {
        this.did = did;
        if (this.timer === 0) this.timer = setInterval(this.data, 5000);
        //this.tab = "info";
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
          this.deviceinfo[2].data = data.device.devicename;
          if (data.device.uid > 0) this.deviceinfo[3].data = data.device.uid;
          else this.deviceinfo[3].data = "-";
          this.deviceinfo[4].data = data.device.ver;
          this.deviceinfo[5].data = data.device.ip;
          this.deviceinfo[6].data = data.device.mac;
          this.deviceinfo[7].data = data.product.pid;
          this.deviceinfo[8].data = data.product.model;
          this.deviceinfo[9].data = data.product.productname;
          this.deviceinfo[10].data = data.product.type;
          this.deviceinfo[11].data = data.product.netmode;
          this.deviceinfo[12].data = data.device.addtime;
          this.deviceinfo[13].data = data.device.lasttime;
          this.devicedata = data.data;
          this.devicedef = data.def;
        });
    },
    load() {
      this.dids = [];
      this.tableloading = true;
      this.$http
        .get("/devices", {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize,
            search: this.search,
            keyword: this.keyword
          }
        })
        .then(data => {
          this.tableloading = false;
          this.tabledata = data.devices;
          this.pagetotal = data.pagetotal;
        });
    }
  },
  mounted() {
    this.tableheight = document.body.clientHeight - 210;
    const that = this;
    window.onresize = () => {
      return (() => {
        that.tableheight = document.body.clientHeight - 210;
      })();
    };
  },
  created() {
    this.load();
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) clearInterval(this.timer);
    this.isdrawer = false;
    next();
  }
};
</script>
