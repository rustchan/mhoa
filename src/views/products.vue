<template>
  <div>
    <div class="tool">
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
        :loading="tableloading"
        @on-current-change="select"
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
            v-if="limits.indexOf('productreg') !== -1"
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
        <template slot-scope="{ row }" slot="type">
          <template v-if="row.type === 'device'">
            设备
          </template>
          <template v-else-if="row.type === 'subdevice'">
            子设备
          </template>
          <template v-else-if="row.type === 'gateway'">
            网关
          </template>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button type="primary" size="small" @click="product(row.pid)">
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
  </div>
</template>

<script>
export default {
  name: "otas",
  props: ["limits"],
  data() {
    return {
      pid: 0,
      tableloading: false,
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
          slot: "type",
          align: "center"
        },
        {
          title: "联网方式",
          width: 90,
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
          title: "注册时间",
          width: 150,
          key: "addtime"
        },
        {
          title: "操作",
          slot: "action"
        }
      ],
      tabledata: []
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
    select(row) {
      this.pid = row.pid;
    },
    reg(isreg, pid) {
      this.$http
        .post(
          "/productreg",
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
          "/productprod",
          this.$qs.stringify({
            pid: this.pid
          })
        )
        .then(() => {
          this.$Message.success("发布成功");
          this.load();
        });
    },
    load() {
      this.tableloading = true;
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
          this.tableloading = false;
          this.pid = 0;
          this.tabledata = data.products;
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
  }
};
</script>
