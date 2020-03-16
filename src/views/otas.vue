<template>
  <div>
    <div class="tool">
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
        <template v-if="limits.indexOf('otaadd') !== -1">
          <Button type="primary" icon="md-add" @click="add">添加</Button>
        </template>
        <template v-if="limits.indexOf('otacheck') !== -1">
          <Button type="info" icon="md-checkbox-outline" @click="check">
            验证
          </Button>
        </template>
        <template v-if="limits.indexOf('otaupdate') !== -1">
          <Button type="success" icon="md-cloud-done" @click="edit">
            升级
          </Button>
        </template>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="pid" @on-change="load" style="width: 250px;">
          <Option value="0">全部产品</Option>
          <Option
            v-for="product in products"
            :value="product.pid"
            :key="product.pid"
          >
            {{ product.productname }} - {{ product.model }}
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
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button type="primary" size="small" @click="ota(row.otaid)">
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
      pid: "0",
      otaid: 0,
      pagetotal: 0,
      pagesize: 30,
      pagenum: 1,
      tableheight: 0,
      tabletitle: [
        {
          title: "产品型号",
          width: 100,
          key: "model"
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
          title: "产品编号",
          width: 90,
          key: "pid",
          align: "center"
        },
        {
          title: "产品名称",
          width: 200,
          key: "productname"
        },
        {
          title: "添加时间",
          width: 150,
          key: "addtime"
        },
        {
          title: "操作",
          slot: "action"
        }
      ],
      tabledata: [],
      products: []
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
