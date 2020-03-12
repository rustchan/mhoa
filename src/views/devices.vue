<template>
  <div class="device" style="overflow: hidden;">
    <div class="tool">
      <div class="btn">
        <Poptip confirm title="确认要删除设备吗？" @on-ok="del">
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <Button type="warning" icon="md-lock">禁用</Button>
        <Button type="success" icon="md-checkmark-circle">启用</Button>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="search" style="width: 120px; margin-right: 10px;">
          <Option value="did">设备编号</Option>
          <Option value="devicename">设备名称</Option>
        </Select>
        <Input
          v-model="keyword"
          @on-enter="searchkeyword"
          style="width: 150px;"
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
        :loading="loading"
      >
        <template slot-scope="{ row }" slot="status">
          <template v-if="row.status === 'online'">
            <Badge color="green" text="在线" />
          </template>
          <template v-if="row.status === 'offline'">
            <Badge color="red" text="离线" />
          </template>
          <template v-if="row.status === 'unactive'">
            <Badge color="blue" text="待激活" />
          </template>
          <template v-if="row.status === 'disable'">
            <Badge color="orange" text="禁用" />
          </template>
        </template>
      </Table>
      <Switch v-model="loading"></Switch>
    </div>
    <div class="page">
      <Page
        :total="pagetotal"
        :page-size-opts="[20, 50, 100]"
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
  name: "device",
  data() {
    return {
      loading: false,
      search: "did",
      keyword: "",
      pagetotal: 0,
      pagesize: 20,
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
          width: 120,
          align: "center",
          key: "did"
        },
        {
          title: "状态",
          width: 100,
          slot: "status"
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
          title: "设备名称",
          width: 150,
          key: "devicename"
        },
        {
          title: "固件版本",
          width: 100,
          key: "ver"
        },
        {
          title: "IP地址",
          width: 150,
          key: "ip"
        },
        {
          title: "MAC地址",
          width: 200,
          key: "mac"
        },
        {
          title: "注册时间",
          width: 200,
          key: "addtime"
        },
        {
          title: "最后上线时间",
          key: "lasttime"
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
    del() {
      alert();
    },
    load() {
      this.loading = true;
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
          this.loading = false;
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
  }
};
</script>

<style scoped>
.tool {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}
.btn button {
  margin-left: 10px;
}
.search {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 15px;
}
.page {
  position: fixed;
  bottom: 0;
  height: 40px;
  right: 20px;
}
</style>
