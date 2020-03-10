<style scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
  height: 100%;
}
.layout-header-bar {
  background: #2b85e4;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  color: #fff;
  padding: 0;
}
.sider {
  transition: none;
  height: 100%;
}
.menu-icon {
  transition: all 0.3s;
}
.rotate-icon {
  transform: rotate(-90deg);
}
.menu-item {
  white-space: nowrap;
}
.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}
.menu-item i {
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}
.collapsed-menu span {
  width: 0;
  transition: width 0.2s ease;
}
.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
.dropmenubtn {
  width: 100%;
  box-shadow: none;
  padding: 15px;
  height: 100%;
  border-radius: 0;
  color: white;
}
.dropmenubtn:hover {
  background-color: #515a6e;
}
.dropmenu {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.dropmenuitem {
  background-color: #fff;
}
.dropmenuitem li:hover {
  color: #ffffff;
  background-color: #2c8cf0;
}
.topnav {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}
.tagnav {
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tagmenu {
  width: 30px;
}
.closebtn {
  background: #fff;
  padding: 5px;
  outline: none;
}
.content {
  height: calc(100% - 46px);
  overflow: auto;
  background: #fff;
}
.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
<template>
  <Layout class="layout">
    <Sider
      ref="side"
      hide-trigger
      collapsible
      :collapsed-width="78"
      v-model.trim="isCollapsed"
      class="sider no-select"
      width="150"
    >
      <Menu
        :active-name="activename"
        :open-names="opennames"
        theme="dark"
        width="auto"
        accordion="true"
        :class="menuitemClasses"
        v-if="!isCollapsed"
        @on-select="sidemenu"
      >
        <template v-for="(menu, key) in menus">
          <Submenu :name="menu.name" :key="key" v-if="menu.child">
            <template slot="title">
              <Icon :type="menu.icon" />
              <span>{{ menu.title }}</span>
            </template>
            <template v-for="(submenu, subkey) in menu.child">
              <MenuItem :name="submenu.name" :key="subkey">
                <span>{{ submenu.title }}</span>
              </MenuItem>
            </template>
          </Submenu>
        </template>
      </Menu>
      <div v-if="isCollapsed" class="dropmenu">
        <template v-for="(menu, key) in menus">
          <Dropdown
            transfer
            placement="right-start"
            v-if="menu.child"
            @on-click="dropmenu"
            :key="key"
          >
            <Button type="text" class="dropmenubtn">
              <Icon :type="menu.icon" size="20"></Icon>
            </Button>
            <DropdownMenu slot="list" class="dropmenuitem">
              <template v-for="(submenu, subkey) in menu.child">
                <DropdownItem :name="submenu.name" :key="subkey">
                  {{ submenu.title }}
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
        </template>
      </div>
    </Sider>
    <Layout>
      <Header class="layout-header-bar no-select">
        <Row>
          <Col span="12">
            <Icon
              @click.native="collapsedSider"
              :class="rotateIcon"
              type="md-menu"
              size="28"
              style="margin-left: 20px;cursor: pointer;"
            ></Icon>
          </Col>
          <Col span="12" class="topnav">
            <Button
              type="primary"
              icon="md-expand"
              size="large"
              @click="full"
              title="全屏"
              style="margin-right: 20px;"
            ></Button>
            <Dropdown @on-click="dropdown">
              <Button type="primary" size="large">
                <Avatar
                  icon="ios-person"
                  style="background-color: #87d068"
                  :src="avatar"
                />
                {{ name }}
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="setting">
                  <Icon type="ios-settings-outline"></Icon>
                  个人设置
                </DropdownItem>
                <DropdownItem name="logout">
                  <Icon type="ios-log-out"></Icon>
                  退出登录
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Content style="height: 100%">
        <div class="tagnav no-select">
          <div class="tags">
            <Tag type="dot">首页</Tag>
            <Tag type="dot" closable color="success">标签二</Tag>
            <Tag type="dot" closable color="error">标签三</Tag>
            <Tag type="dot" closable color="warning">标签四</Tag>
            <Tag type="dot" closable color="primary">首页</Tag>
            <Tag type="dot" closable color="success">标签二</Tag>
            <Tag type="dot" closable color="error">标签三</Tag>
            <Tag type="dot" closable color="warning">标签四</Tag>
            <Tag type="dot" closable color="primary">首页</Tag>
            <Tag type="dot" closable color="success">标签二</Tag>
            <Tag type="dot" closable color="error">标签三</Tag>
            <Tag type="dot" closable>标签四</Tag>
          </div>
          <div class="tagmenu">
            <Dropdown>
              <Button type="text" class="closebtn">
                <Icon :size="18" type="ios-arrow-down" />
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="left">
                  <Icon type="md-arrow-back"></Icon>
                  关闭左侧
                </DropdownItem>
                <DropdownItem name="right">
                  <Icon type="md-arrow-forward"></Icon>
                  关闭右侧
                </DropdownItem>
                <DropdownItem name="other">
                  <Icon type="md-close"></Icon>
                  关闭其它
                </DropdownItem>
                <DropdownItem name="all">
                  <Icon type="md-close-circle"></Icon>
                  关闭全部
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div class="content">
          <keep-alive>
            <router-view />
          </keep-alive>
        </div>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import screenfull from "screenfull";
export default {
  data() {
    return {
      isCollapsed: false,
      isFullscreen: false,
      activename: "",
      opennames: [],
      menus: [],
      name: "",
      avatar: ""
    };
  },
  computed: {
    rotateIcon() {
      return ["menu-icon", this.isCollapsed ? "rotate-icon" : ""];
    },
    menuitemClasses() {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }
  },
  created() {
    this.emp(); //员工信息
  },
  methods: {
    collapsedSider() {
      this.$refs.side.toggleCollapse();
    },
    logout() {
      this.$cookies.remove("token");
      this.$router.push("/login");
    },
    full() {
      if (!screenfull.isEnabled) {
        return false;
      }
      screenfull.toggle();
    },
    dropdown(name) {
      switch (name) {
        case "logout":
          this.logout();
          break;
      }
    },
    sidemenu(name) {
      alert(name);
    },
    dropmenu(name) {
      alert(name);
    },
    emp() {
      this.$http.get("/emp").then(data => {
        this.menus = data.menus;
        this.name = data.name;
        this.avatar = data.avatar;
      });
    }
  }
};
</script>
