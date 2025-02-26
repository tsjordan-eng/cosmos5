<!--
# Copyright 2022 Ball Aerospace & Technologies Corp.
# All Rights Reserved.
#
# This program is free software; you can modify and/or redistribute it
# under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation; version 3 with
# attribution addendums as found in the LICENSE.txt
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# Modified by OpenC3, Inc.
# All changes Copyright 2022, OpenC3, Inc.
# All Rights Reserved
#
# This file may also be used under the terms of a commercial license
# if purchased from OpenC3, Inc.
-->

<template>
  <div>
    <v-navigation-drawer v-model="drawer" app id="openc3-nav-drawer">
      <v-list>
        <v-list-item>
          <v-list-item-icon
            style="
              margin-right: auto !important;
              margin-left: auto;
              margin-top: 0px;
              margin-bottom: 0px;
            "
          >
            <img :src="logo" alt="OpenC3" />
          </v-list-item-icon>
        </v-list-item>
        <div class="cosmos" @click="showUpgradeToEnterpriseDialog = true">
          COSMOS
        </div>
        <v-list-item class="my-0">
          <v-list-item-content>
            <div v-for="(tool, name) in adminTools" :key="name">
              <v-btn
                block
                small
                :href="tool.url"
                onclick="singleSpaNavigate(event)"
                class="fixcenter"
              >
                Admin
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-treeview
          :items="items"
          :open="initiallyOpen"
          item-key="name"
          dense
          open-on-click
          expand-icon=""
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon v-if="!item.icon">
              {{ open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
            </v-icon>
            <a v-else :href="item.url" onclick="singleSpaNavigate(event)">
              <v-icon> {{ item.icon }} </v-icon>
            </a>
          </template>
          <template v-slot:label="{ item }">
            <a :href="item.url" onclick="singleSpaNavigate(event)">
              {{ item.name }}
            </a>
          </template>
          <template v-slot:append="{ item }">
            <a v-if="item.icon" :href="newTabUrl(item)" target="_blank">
              <v-icon>mdi-open-in-new</v-icon>
            </a>
          </template>
        </v-treeview>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="tertiary darken-3" id="openc3-app-toolbar">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-divider vertical class="top-bar-divider-full-height" />
      <span style="width: 100%"><span id="openc3-menu"></span></span>
      <div class="justify-right mr-2 pt-2"><scope-selector /></div>
      <div class="justify-right" data-test="alert-history">
        <alert-history />
      </div>
      <div class="justify-right" data-test="notifications">
        <notifications />
      </div>
      <div class="justify-right" data-test="user-menu"><user-menu /></div>
    </v-app-bar>
    <upgrade-to-enterprise-dialog
      v-model="showUpgradeToEnterpriseDialog"
    ></upgrade-to-enterprise-dialog>
  </div>
</template>

<script>
import Api from '../../services/api'
import logo from '../../../public/img/logo.png'
import { registerApplication, start } from 'single-spa'
import ScopeSelector from './components/ScopeSelector.vue'
import AlertHistory from './components/AlertHistory.vue'
import Notifications from './components/Notifications.vue'
import UserMenu from './components/UserMenu.vue'
import UpgradeToEnterpriseDialog from '../../components/UpgradeToEnterpriseDialog'

export default {
  components: {
    ScopeSelector,
    AlertHistory,
    Notifications,
    UserMenu,
    UpgradeToEnterpriseDialog,
  },
  props: {
    edition: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      items: [],
      drawer: true,
      appNav: {},
      logo: logo,
      initiallyOpen: [],
      showUpgradeToEnterpriseDialog: false,
    }
  },
  computed: {
    // a computed getter
    shownTools: function () {
      let result = {}
      for (var key of Object.keys(this.appNav)) {
        if (this.appNav[key].shown && this.appNav[key].category !== 'Admin') {
          result[key] = this.appNav[key]
        }
      }
      return result
    },
    adminTools: function () {
      let result = {}
      for (var key of Object.keys(this.appNav)) {
        if (this.appNav[key].shown && this.appNav[key].category === 'Admin') {
          result[key] = this.appNav[key]
        }
      }
      return result
    },
  },
  created() {
    Api.get('/openc3-api/tools/all', { params: { scope: 'DEFAULT' } }).then(
      (response) => {
        this.appNav = response.data

        let id = 1
        // Register apps and start single-spa
        for (var key of Object.keys(this.appNav)) {
          if (this.appNav[key].shown) {
            if (
              this.appNav[key].category &&
              this.appNav[key].category !== 'Admin'
            ) {
              // TODO: Make this initiallyOpen configurable like with a CATEGORY parameter?
              this.initiallyOpen.push(this.appNav[key].category)
              const result = this.items.filter(
                (item) => item.name === this.appNav[key].category
              )
              if (result.length === 0) {
                this.items.push({
                  id: id,
                  name: this.appNav[key].category,
                  children: [
                    {
                      id: id + 1,
                      name: this.appNav[key].name,
                      icon: this.appNav[key].icon,
                      url: this.appNav[key].url,
                    },
                  ],
                })
                id++
              } else {
                result[0].children.push({
                  id: id,
                  name: this.appNav[key].name,
                  icon: this.appNav[key].icon,
                  url: this.appNav[key].url,
                })
              }
            } else if (!this.appNav[key].category) {
              this.items.push({
                id: id,
                name: this.appNav[key].name,
                icon: this.appNav[key].icon,
                url: this.appNav[key].url,
              })
            }
            id++

            if (this.appNav[key].folder_name) {
              let folder_name = this.appNav[key].folder_name
              let name = '@openc3/tool-' + folder_name
              registerApplication({
                name: name,
                app: () => System.import(name),
                activeWhen: ['/tools/' + folder_name],
              })
            }
          }
        }
        start({
          urlRerouteOnly: true,
        })

        // Redirect some base paths to the first tool
        if (
          window.location.pathname == '/' ||
          window.location.pathname == '/tools' ||
          window.location.pathname == '/tools/'
        ) {
          for (var key of Object.keys(this.shownTools)) {
            if (this.appNav[key].shown) {
              history.replaceState(null, '', this.appNav[key].url)
              break
            }
          }
        }

        // Check every minute if we need to update our token
        setInterval(() => {
          OpenC3Auth.updateToken(120).then(function (refreshed) {
            if (refreshed) {
              OpenC3Auth.setTokens()
            }
          })
        }, 60000)
      }
    )
  },
  methods: {
    newTabUrl(tool) {
      let url = null
      if (tool.url[0] == '/' && tool.url[1] != '/') {
        url = new URL(tool.url, window.location.origin)
      } else {
        url = new URL(tool.url)
      }
      url.searchParams.set('scope', window.openc3Scope)
      return url.href
    },
  },
}
</script>

<style scoped>
.cosmos {
  cursor: pointer;
  text-align: center;
  font-size: 18pt;
}
div a {
  color: white;
  font-size: 16px;
  display: block;
  height: 100%;
  width: 100%;
}
a.fixcenter {
  display: flex;
}
.theme--dark.v-navigation-drawer {
  background-color: var(--v-primary-darken2);
}
#openc3-app-toolbar .top-bar-divider-full-height {
  margin: -4px 4px;
  min-height: calc(100% + 8px);
}
</style>
<style>
/* Remove the padding on root level nodes since we removed the expand icon */
#openc3-nav-drawer
  .v-treeview
  > .v-treeview-node
  > .v-treeview-node__root
  > .v-treeview-node__level {
  width: 0px;
}
#openc3-nav-drawer
  .v-treeview
  > .v-treeview-node
  > .v-treeview-node__root
  > .v-treeview-node__toggle {
  width: 0px;
}
#openc3-nav-drawer
  .v-treeview-node__children
  div.v-treeview-node__level:nth-child(1) {
  width: 0px;
}
</style>
