<template>
  <div>
    <div class="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除产品定义吗？'"
          @on-ok="del"
          :disabled="defid === 0"
          v-if="limits.includes('productdefdel')"
        >
          <Button type="error" icon="md-close" :disabled="status === 'prod'">
            删除
          </Button>
        </Poptip>
        <template v-if="limits.includes('productdefadd')">
          <Button type="primary" icon="md-add" @click="add">添加</Button>
        </template>
        <template v-if="limits.includes('productdefedit')">
          <Button type="info" icon="md-create" @click="edit">编辑</Button>
        </template>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="pid" @on-change="load" style="width: 200px;">
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
        @on-row-dblclick="edit"
        size="small"
      >
        <template slot-scope="{ row }" slot="type">
          <template v-for="func in funcs">
            <span :key="func.funcid" v-if="func.func === row.functype">
              {{ func.funcname }}
            </span>
          </template>
        </template>
        <template
          slot-scope="{ row }"
          slot="float"
          v-if="row.datatype === 'float'"
        >
          {{ row.datavalue }}
        </template>
        <template
          slot-scope="{ row }"
          slot="value"
          v-if="row.datatype === 'bool'"
        >
          <template v-for="(val, i) in row.datavalue.split(',')">
            <span :key="i">{{ i }}-{{ val }}<br /></span>
          </template>
        </template>
      </Table>
    </div>
    <Modal
      v-model="isadd"
      :mask-closable="false"
      title="产品定义"
      width="400"
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
        <FormItem label="排序编号" prop="sort" class="formitem">
          <Input v-model="addform.sort"></Input>
        </FormItem>
        <FormItem label="功能名称" prop="funcname" class="formitem">
          <Input v-model="addform.funcname"></Input>
        </FormItem>
        <FormItem label="功能类型" prop="functype" class="formitem">
          <Select
            v-model="addform.functype"
            :disabled="defid > 0 && status === 'prod'"
          >
            <Option v-for="func in funcs" :value="func.func" :key="func.func">
              {{ func.funcname }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="标识符" prop="id" class="formitem">
          <Input
            v-model="addform.id"
            :disabled="defid > 0 && status === 'prod'"
          ></Input>
        </FormItem>
        <FormItem label="数据类型" prop="datatype" class="formitem">
          <Select
            v-model="addform.datatype"
            :disabled="defid > 0 && status === 'prod'"
          >
            <Option v-for="type in types" :value="type.type" :key="type.type">
              {{ type.typename }}
            </Option>
          </Select>
        </FormItem>
        <FormItem
          label="小数位数"
          prop="dec"
          class="formitem"
          v-if="addform.datatype === 'float'"
        >
          <Select v-model="addform.dec">
            <Option value="0">0</Option>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
          </Select>
        </FormItem>
        <Row v-if="addform.datatype === 'bool'">
          <Col span="12">
            <FormItem label="0值" prop="bool0" class="formitem">
              <Input v-model="addform.bool0"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="1值" prop="bool1" class="formitem">
              <Input v-model="addform.bool1"></Input>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="数据单位" prop="unit" class="formitem">
          <Input v-model="addform.unit"></Input>
        </FormItem>
        <FormItem label="小米siid" prop="siid" class="formitem">
          <Input
            v-model="addform.siid"
            :disabled="defid > 0 && status === 'prod'"
          ></Input>
        </FormItem>
        <FormItem label="小米piid" prop="piid" class="formitem">
          <Input
            v-model="addform.piid"
            :disabled="defid > 0 && status === 'prod'"
          ></Input>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="addClose">取消</Button>
        <Button type="primary" @click="save" :loading="isadding">
          <template v-if="defid === 0">添加</template>
          <template v-else>保存</template>
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
export default {
  name: "productdef",
  props: ["limits", "id"],
  data() {
    return {
      defid: 0,
      pid: 0,
      products: [],
      status: "dev",
      funcs: [],
      types: [
        { type: "int", typename: "整型" },
        { type: "float", typename: "浮点型" },
        { type: "bool", typename: "布尔型" }
      ],
      tableheight: 0,
      tabletitle: [
        {
          title: "序号",
          width: 80,
          align: "center",
          key: "sort"
        },
        {
          title: "功能名称",
          width: 120,
          key: "funcname"
        },
        {
          title: "功能类型",
          width: 120,
          slot: "type"
        },
        {
          title: "标识符",
          width: 100,
          key: "id"
        },
        {
          title: "数据类型",
          width: 90,
          align: "center",
          key: "datatype"
        },
        {
          title: "小数位",
          width: 80,
          align: "center",
          slot: "float"
        },
        {
          title: "数据值",
          width: 80,
          align: "center",
          slot: "value"
        },
        {
          title: "数据单位",
          width: 90,
          align: "center",
          key: "unit"
        },
        {
          title: "小米siid",
          width: 90,
          align: "center",
          key: "siid"
        },
        {
          title: "小米piid",
          width: 90,
          align: "center",
          key: "piid"
        },
        {
          title: " "
        }
      ],
      tabledata: [],
      isadd: false,
      isadding: false,
      addform: {
        sort: 100,
        funcname: "",
        functype: "",
        id: "",
        datatype: "int",
        dec: "2",
        bool0: "",
        bool1: "",
        unit: "",
        siid: 0,
        piid: 0
      },
      addformrules: {
        funcname: [
          {
            type: "string",
            required: true,
            message: "请输入功能名称"
          }
        ],
        functype: [
          {
            type: "string",
            required: true,
            message: "请选择功能类型"
          }
        ],
        id: [
          {
            type: "string",
            required: true,
            message: "请输入标识符"
          }
        ],
        datatype: [
          {
            type: "string",
            required: true,
            message: "请选择数据类型"
          }
        ],
        bool0: [
          {
            validator: (rule, value, callback) => {
              if (this.addform.datatype !== "bool" || value !== "") callback();
              else return callback(new Error("请输入布尔0值"));
            }
          }
        ],
        bool1: [
          {
            validator: (rule, value, callback) => {
              if (this.addform.type === "click" || value !== "") callback();
              else return callback(new Error("请输入布尔1值"));
            }
          }
        ]
      }
    };
  },
  methods: {
    select(row) {
      this.defid = row.defid;
    },
    add() {
      this.defid = 0;
      this.isadd = true;
    },
    addClose() {
      this.$refs.addform.resetFields();
      this.isadd = false;
    },
    edit(row) {
      if (row.defid === undefined) {
        if (this.defid === 0) {
          this.$Message.error("请选择产品定义");
          return;
        }
        this.tabledata.forEach(def => {
          if (def.defid === this.def) {
            row = def;
          }
        });
      }
      this.addform.funcname = row.funcname;
      this.addform.functype = row.functype;
      this.addform.id = row.id;
      this.addform.datatype = row.datatype;
      this.addform.unit = row.unit;
      this.addform.ssid = row.ssid;
      this.addform.piid = row.piid;
      this.addform.sort = row.sort;
      if (row.datatype === "float") {
        this.addform.dec = row.datavalue;
      }
      if (row.datatype === "bool") {
        let datavalue = row.datavalue.split(",");
        this.addform.bool0 = datavalue[0];
        this.addform.bool1 = datavalue[1];
      }
      this.isadd = true;
    },
    del() {
      if (this.defid === 0) {
        this.$Message.error("请选择产品定义");
        return;
      }
      this.$http
        .post(
          "/productdef/del",
          this.$qs.stringify({
            pid: this.pid,
            defid: this.defid
          })
        )
        .then(() => {
          this.load();
        });
    },
    save() {
      this.$refs.addform.validate(valid => {
        if (valid) {
          this.isadding = true;
          let action = "add";
          if (this.defid > 0) action = "edit";
          let datavalue = "0";
          if (this.addform.datatype === "bool") {
            datavalue = this.addform.bool0 + "," + this.addform.bool1;
          }
          if (this.addform.datatype === "float") {
            datavalue = this.addform.dec;
          }
          this.$http
            .post(
              "/productdef/" + action,
              this.$qs.stringify({
                pid: this.pid,
                defid: this.defid,
                funcname: this.addform.funcname,
                functype: this.addform.functype,
                sort: this.addform.sort,
                id: this.addform.id,
                datatype: this.addform.datatype,
                datavalue: datavalue,
                unit: this.addform.unit,
                siid: this.addform.siid,
                piid: this.addform.piid
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
    load() {
      this.$http
        .get("/productdef", {
          params: {
            pid: this.pid
          }
        })
        .then(data => {
          this.products = data.products;
          if (this.pid === 0) {
            this.pid = data.products[0].pid;
            this.status = data.products[0].status;
          } else {
            data.products.forEach(product => {
              if (product.pid === this.pid) {
                this.status = product.status;
              }
            });
          }
          this.tabledata = data.defs;
          this.funcs = data.funcs;
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
  watch: {
    id() {
      this.pid = this.id;
      this.load();
    }
  },
  created() {
    this.pid = this.id;
    this.load();
  }
};
</script>
