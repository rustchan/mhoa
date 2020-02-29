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
}
.menu-icon {
  transition: all 0.3s;
}
.rotate-icon {
  transform: rotate(-90deg);
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
</style>
<template>
  <Layout class="layout">
    <Sider
      ref="side"
      hide-trigger
      collapsible
      :collapsed-width="78"
      v-model="isCollapsed"
    >
      <Menu
        active-name="1-3"
        theme="dark"
        width="auto"
        :class="menuitemClasses"
      >
        <MenuItem name="1-1">
          <Icon type="ios-navigate"></Icon>
          <span>Option 1</span>
        </MenuItem>
        <MenuItem name="1-2">
          <Icon type="ios-search"></Icon>
          <span>Option 2</span>
        </MenuItem>
        <MenuItem name="1-3">
          <Icon type="ios-settings"></Icon>
          <span>Option 3</span>
        </MenuItem>
      </Menu>
    </Sider>
    <Layout>
      <Header :style="{ padding: 0 }" class="layout-header-bar">
        <Row>
          <Col span="12" style="padding-left: 20px;">
            <Icon
              @click.native="collapsedSider"
              :class="rotateIcon"
              type="ios-menu"
              size="24"
            ></Icon>
          </Col>
          <Col
            span="12"
            style="display:flex;justify-content: flex-end;align-items:center;padding-right: 20px;"
          >
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
                  src="https://i.loli.net/2017/08/21/599a521472424.jpg"
                />
                陈志伟
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
      <Content
        :style="{
          margin: '20px',
          background: '#fff'
        }"
      >
        <keep-alive>
          <router-view />
        </keep-alive>
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
      isFullscreen: false
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
    }
  }
};
</script>
