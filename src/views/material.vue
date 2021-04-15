<template>
  <div>
    <div class="tool" ref="tool">
      <div class="btn">
        <Poptip
          confirm
          :title="'确认要删除数据吗？'"
          @on-ok="del"
          :disabled="mid === 0"
          v-if="limits.indexOf('materialdel') !== -1"
        >
          <Button type="error" icon="md-close">删除</Button>
        </Poptip>
        <template v-if="limits.indexOf('materialedit') !== -1">
          <Button type="info" icon="md-create" @click="edit">编辑</Button>
        </template>
        <Button
          type="primary"
          icon="md-add"
          v-if="limits.indexOf('materialadd') !== -1"
          @click="add"
        >
          添加
        </Button>
        <Button icon="md-refresh" @click="load">刷新</Button>
      </div>
      <div class="search">
        <Select v-model="mtype" @on-change="load" style="width: 100px;">
          <Option value="all">全部</Option>
          <Option value="raw">生料</Option>
          <Option value="wrought">熟料</Option>
          <Option value="muck">生料土</Option>
        </Select>
        <DatePicker
          type="daterange"
          placement="bottom-end"
          style="width: 200px; margin-left: 10px;"
          :editable="false"
          @on-change="dateChange"
          :value="daterange"
        ></DatePicker>
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
        <template slot-scope="{ row }" slot="mtype">
          <template v-if="row.mtype === 'raw'">
            <Tag color="primary">生料</Tag>
          </template>
          <template v-if="row.mtype === 'wrought'">
            <Tag color="success">熟料</Tag>
          </template>
          <template v-if="row.mtype === 'muck'">
            <Tag color="warning">生料土</Tag>
          </template>
        </template>
        <template slot-scope="{ row }" slot="ticketnum">
          {{ row.ticketnum }}
        </template>
      </Table>
    </div>
    <div class="status">
      <div class="stat" v-if="suttle > 0">净重合计：{{ suttle }}</div>
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
      title="生熟料"
      width="600"
      @on-cancel="addClose"
      :styles="{ top: '200px' }"
      transfer
    >
      <Form
        :model="addform"
        :rules="addformrules"
        ref="addform"
        label-position="right"
        :label-width="60"
      >
        <Row>
          <Col span="12">
            <FormItem label="类型" prop="mtype" class="formitem">
              <Select v-model="addform.mtype" :disabled="mid > 0">
                <Option value="raw">生料</Option>
                <Option value="wrought">熟料</Option>
                <Option value="muck">生料土</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="日期" prop="date" class="formitem">
              <DatePicker
                type="date"
                placement="bottom-end"
                @on-change="formDateChange"
                :value="addform.date"
              ></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="车号" prop="carnum" class="formitem">
              <Input v-model="addform.carnum"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="票号" prop="ticketnum" class="formitem">
              <Input v-model="addform.ticketnum"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="毛重" prop="rough" class="formitem">
              <Input v-model="addform.rough"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="皮重" prop="tare" class="formitem">
              <Input v-model="addform.tare"></Input>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="备注" prop="remark" class="formitem">
          <Input v-model="addform.remark"></Input>
        </FormItem>
        <FormItem label="磅单" prop="ticket" class="formitem">
          <img
            :src="imgurl + '/' + addform.ticket"
            width="300"
            v-if="addform.ticket"
          />
          <Upload
            :action="action"
            :format="['png', 'jpg', 'jpeg']"
            :show-upload-list="false"
            :on-success="upticketok"
            :on-error="uperr"
            :headers="{ token: token }"
          >
            <Button>上传磅单</Button>
          </Upload>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="addClose">取消</Button>
        <Button type="primary" @click="save" :loading="isadding">
          <template v-if="mid === 0">添加</template>
          <template v-else>保存</template>
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import cookie from "vue-cookies";

export default {
  name: "material",
  props: ["limits", "imgurl"],
  data() {
    return {
      action: process.env.VUE_APP_API + "/upload",
      isadd: false,
      isadding: false,
      mid: 0,
      mtype: "all",
      daterange: [],
      pagetotal: 0,
      pagesize: 50,
      pagenum: 1,
      suttle: 0,
      tableheight: 0,
      tabletitle: [
        {
          title: "日期",
          width: 100,
          key: "date",
          align: "center"
        },
        {
          title: "类别",
          width: 100,
          slot: "mtype",
          align: "center"
        },
        {
          title: "车号",
          width: 100,
          key: "carnum",
          align: "center"
        },
        {
          title: "票号",
          width: 100,
          slot: "ticketnum",
          align: "center"
        },
        {
          title: "毛重",
          width: 100,
          key: "rough",
          align: "center"
        },
        {
          title: "皮重",
          width: 100,
          key: "tare",
          align: "center"
        },
        {
          title: "净重",
          width: 100,
          key: "suttle",
          align: "center"
        },
        {
          title: "备注",
          key: "remark"
        }
      ],
      tabledata: [],
      addform: {
        mtype: "raw",
        date:
          new Date().getFullYear() +
          "-" +
          this.$util.getMonth() +
          "-" +
          new Date().getDate(),
        carnum: "",
        ticketnum: "",
        rough: "",
        tare: "",
        remark: "",
        ticket: ""
      },
      addformrules: {
        carnum: [
          {
            type: "string",
            required: true,
            message: "请输入车号"
          }
        ],
        ticketnum: [
          {
            type: "string",
            required: true,
            message: "请输入票号"
          }
        ],
        rough: [
          {
            required: true,
            message: "请输入毛重"
          },
          {
            type: "number",
            required: true,
            message: "请输入正确的毛重",
            transform(value) {
              return Number(value);
            },
            min: 0
          }
        ],
        tare: [
          {
            required: true,
            message: "请输入皮重"
          },
          {
            type: "number",
            required: true,
            message: "请输入正确的皮重",
            transform(value) {
              return Number(value);
            },
            min: 0
          }
        ],
        ticket: [
          {
            type: "string",
            required: true,
            message: "请上传磅单"
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
    pagenumchange(page) {
      this.pagenum = page;
      this.load();
    },
    pagesizechange(size) {
      this.pagesize = size;
      this.load();
    },
    dateChange(range) {
      this.daterange = range;
      this.load();
    },
    formDateChange(date) {
      this.addform.date = date;
    },
    select(row) {
      this.mid = row.mid;
    },
    add() {
      this.mid = 0;
      this.isadd = true;
    },
    edit(row) {
      if (row.mid === undefined) {
        if (this.mid === 0) {
          this.$Message.error("请选择数据");
          return;
        }
        this.tabledata.forEach(m => {
          if (m.mid === this.mid) {
            row = m;
          }
        });
      }
      this.addform.date = row.date;
      this.addform.carnum = row.carnum;
      this.addform.mtype = row.mtype;
      this.addform.ticketnum = row.ticketnum;
      this.addform.ticket = row.ticket;
      this.addform.remark = row.remark;
      this.addform.tare = row.tare;
      this.addform.rough = row.rough;
      this.isadd = true;
    },
    addClose() {
      this.$refs.addform.resetFields();
      this.isadd = false;
    },
    load() {
      this.$http
        .get("/material", {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize,
            mtype: this.mtype,
            startdate: this.daterange[0],
            enddate: this.daterange[1]
          }
        })
        .then(data => {
          data.materials.forEach(material => {
            material.rough = material.rough.toFixed(2);
            material.tare = material.tare.toFixed(2);
            material.suttle = material.suttle.toFixed(2);
          });
          this.tabledata = data.materials;
          this.pagetotal = data.pagetotal;
          this.suttle = data.suttle;
        });
    },
    upticketok(res) {
      if (res.code > 0) {
        this.$Message.error(res.msg);
        return;
      }
      this.addform.ticket = res.path;
    },
    uperr() {
      this.$Message.error("上传失败");
    },
    save() {
      this.$refs.addform.validate(valid => {
        if (valid) {
          this.isadding = true;
          let action = "add";
          if (this.mid > 0) action = "edit";
          this.$http
            .post(
              "/material/" + action,
              this.$qs.stringify({
                mid: this.mid,
                mtype: this.addform.mtype,
                date: this.addform.date,
                carnum: this.addform.carnum,
                ticketnum: this.addform.ticketnum,
                ticket: this.addform.ticket,
                remark: this.addform.remark,
                rough: this.addform.rough,
                tare: this.addform.tare
              })
            )
            .then(() => {
              this.mtype = this.addform.mtype;
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
      if (this.mid === 0) {
        this.$Message.error("请选择数据");
        return;
      }
      this.$http
        .post(
          "/material/del",
          this.$qs.stringify({
            mid: this.mid
          })
        )
        .then(() => {
          this.load();
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

<style scoped></style>
