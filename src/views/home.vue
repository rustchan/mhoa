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
  height: 44px;
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
        :accordion="true"
        :class="menuitemClasses"
        v-if="!isCollapsed"
        @on-select="sidemenu"
        ref="sidemenu"
      >
        <template v-for="(menu, key) in menus">
          <Submenu
            :name="menu.name"
            :key="key"
            v-if="menu.child && menu.isshow"
          >
            <template slot="title">
              <Icon :type="menu.icon" />
              <span>{{ menu.title }}</span>
            </template>
            <template v-for="(submenu, subkey) in menu.child">
              <MenuItem
                :name="submenu.name"
                :key="subkey"
                v-if="submenu.isshow"
              >
                <span>{{ submenu.title }}</span>
              </MenuItem>
            </template>
          </Submenu>
          <MenuItem
            :name="menu.name"
            :key="key"
            v-if="!menu.child && menu.isshow"
          >
            <Icon :type="menu.icon" />
            <span>{{ menu.title }}</span>
          </MenuItem>
        </template>
      </Menu>
      <div v-if="isCollapsed" class="dropmenu">
        <template v-for="(menu, key) in menus">
          <Dropdown
            transfer
            placement="right-start"
            v-if="menu.child && menu.isshow"
            @on-click="dropmenu"
            :key="key"
          >
            <Button type="text" class="dropmenubtn">
              <Icon :type="menu.icon" size="20"></Icon>
            </Button>
            <DropdownMenu slot="list" class="dropmenuitem">
              <template v-for="(submenu, subkey) in menu.child">
                <DropdownItem
                  :name="submenu.name"
                  :key="subkey"
                  v-if="submenu.isshow"
                >
                  {{ submenu.title }}
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
          <Button
            type="text"
            class="dropmenubtn"
            :key="key"
            v-if="!menu.child && menu.isshow"
            @click.native="dropmenu(menu.name)"
          >
            <Icon :type="menu.icon" size="20"></Icon>
          </Button>
        </template>
      </div>
    </Sider>
    <Layout style="overflow: hidden;">
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
            <Tag
              type="dot"
              :closable="tag.name !== 'index'"
              :color="tag.isactive ? 'success' : 'default'"
              v-for="tag in tags"
              :name="tag.name"
              :key="tag.name"
              @on-close="closetag"
              @click.native="clicktag(tag.name)"
              style="cursor: pointer;"
            >
              {{ tag.title }}
            </Tag>
          </div>
          <div class="tagmenu">
            <Dropdown @on-click="closetags">
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
      isCollapsed: true,
      isFullscreen: false,
      activename: "",
      opennames: [],
      menus: [],
      name: "",
      avatar: ""
    };
  },
  computed: {
    tags() {
      let tags = [];
      this.menus.forEach(menu => {
        if (menu.istag) {
          tags.push(menu);
        } else if (menu.child) {
          menu.child.forEach(child => {
            if (child.istag) {
              tags.push(child);
            }
          });
        }
      });
      tags.sort((a, b) => {
        return a.num - b.num;
      });
      return tags;
    },
    rotateIcon() {
      return ["menu-icon", this.isCollapsed ? "rotate-icon" : ""];
    },
    menuitemClasses() {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }
  },
  //初始化
  created() {
    this.$http.get("/emp").then(data => {
      this.menus = data.menus;
      this.name = data.name;
      this.avatar = data.avatar;
      let path = this.$route.path;
      let activename = "index";
      if (path !== "/") activename = path.slice(1);
      this.activename = activename;
      let tags = ["index"];
      if (localStorage.tags) tags = JSON.parse(localStorage.tags);
      let tagnum = 0;
      if (this.tags.length > 0) tagnum = this.tags[this.tags.length - 1].num;
      this.menus.forEach(menu => {
        if (tags.indexOf(menu.name) !== -1 || activename === menu.name) {
          menu.istag = true;
          menu.num = tagnum + 1;
          tagnum++;
        }
        if (activename === menu.name) {
          menu.isactive = true;
        } else if (menu.child) {
          menu.child.forEach(child => {
            if (tags.indexOf(child.name) !== -1 || activename === child.name) {
              child.istag = true;
              child.num = tagnum + 1;
              tagnum++;
            }
            if (activename === child.name) {
              child.isactive = true;
              this.opennames = [menu.name];
            }
          });
        }
      });
      this.$nextTick(() => {
        this.$refs.sidemenu.updateOpened();
        this.$refs.sidemenu.updateActiveName();
      });
    });
  },
  methods: {
    collapsedSider() {
      this.$refs.side.toggleCollapse();
    },
    //退出登录
    logout() {
      this.$cookies.remove("token");
      this.$router.push("/login");
    },
    //全屏
    full() {
      if (!screenfull.isEnabled) {
        return false;
      }
      screenfull.toggle();
    },
    //用户下拉菜单
    dropdown(name) {
      switch (name) {
        case "logout":
          this.logout();
          break;
      }
    },
    //批量关闭标签
    closetags(name) {
      let tag = null;
      if (name !== "all") {
        this.tags.forEach(_tag => {
          if (_tag.isactive) tag = _tag;
        });
      }
      this.menus.forEach(menu => {
        if (menu.name !== "index") {
          if (name === "left" && menu.num < tag.num) menu.istag = false;
          if (name === "right" && menu.num > tag.num) menu.istag = false;
          if (name === "other" && menu.name !== tag.name) menu.istag = false;
          if (name === "all") menu.istag = false;
        } else {
          if (name === "all") {
            menu.isactive = true;
            this.activename = "index";
            this.opennames = [];
          }
        }
        if (menu.child) {
          menu.child.forEach(child => {
            if (child.name !== "index") {
              if (name === "left" && child.num < tag.num) child.istag = false;
              if (name === "right" && child.num > tag.num) child.istag = false;
              if (name === "other" && child.name !== tag.name)
                child.istag = false;
              if (name === "all") child.istag = false;
            }
          });
        }
      });
      if (name === "all") {
        this.$nextTick(() => {
          this.$refs.sidemenu.updateOpened();
          this.$refs.sidemenu.updateActiveName();
        });
      }
      this.tag();
    },
    //保存标签
    tag() {
      let tags = ["index"];
      this.tags.forEach(tag => {
        if (tag.name !== "index") tags.push(tag.name);
      });
      localStorage.tags = JSON.stringify(tags);
    },
    //点击导航菜单
    sidemenu(name) {
      let tagnum = 0;
      if (this.tags.length > 0) tagnum = this.tags[this.tags.length - 1].num;
      this.activename = name;
      let menu = null;
      this.menus.forEach(_menu => {
        if (_menu.name === name) {
          if (!_menu.istag) {
            _menu.num = tagnum + 1;
            if (name === "index") _menu.num = 0;
          }
          menu = _menu;
          _menu.istag = true;
          _menu.isactive = true;
        } else if (_menu.child) {
          _menu.child.forEach(child => {
            if (child.name === name) {
              if (!child.istag) {
                child.num = tagnum + 1;
              }
              menu = child;
              child.istag = true;
              child.isactive = true;
            } else {
              child.isactive = false;
            }
          });
        } else {
          _menu.isactive = false;
        }
      });
      this.tag();
      this.$router.push("/" + menu.name);
    },
    //点击下拉菜单
    dropmenu(name) {
      this.sidemenu(name);
    },
    //关闭标签
    closetag(event, name) {
      let isactive = false;
      this.menus.forEach(menu => {
        if (menu.name === name) {
          isactive = menu.isactive;
          menu.istag = false;
        } else if (menu.child) {
          menu.child.forEach(child => {
            if (child.name === name) {
              isactive = child.isactive;
              child.istag = false;
            }
          });
        }
      });
      this.tag();
      if (isactive) {
        let tag = this.tags[this.tags.length - 1];
        tag.isactive = true;
        this.$router.push("/" + tag.name);
        this.activename = tag.name;
      }
    },
    //点击标签
    clicktag(name) {
      this.tags.forEach(tag => {
        if (tag.name === name) {
          tag.isactive = true;
        } else {
          tag.isactive = false;
        }
      });
      this.activename = name;
      this.$nextTick(() => {
        this.$refs.sidemenu.updateOpened();
        this.$refs.sidemenu.updateActiveName();
      });
      this.$router.push("/" + name);
    }
  }
};
</script>
