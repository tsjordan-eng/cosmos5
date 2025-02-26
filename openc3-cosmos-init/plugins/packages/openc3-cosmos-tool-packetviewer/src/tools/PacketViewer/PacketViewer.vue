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
    <top-bar :menus="menus" :title="title" />
    <v-card style="padding: 10px">
      <target-packet-item-chooser
        :initial-target-name="this.$route.params.target"
        :initial-packet-name="this.$route.params.packet"
        @on-set="packetChanged($event)"
      />
      <v-card-title style="padding-top: 0px">
        Items
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="rows"
        :search="search"
        :items-per-page="itemsPerPage"
        @update:items-per-page="itemsPerPage = $event"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 50, 100, 500, 1000],
          showFirstLastPage: true,
          firstIcon: 'mdi-page-first',
          lastIcon: 'mdi-page-last',
          prevIcon: 'mdi-chevron-left',
          nextIcon: 'mdi-chevron-right',
        }"
        calculate-widths
        multi-sort
        dense
      >
        <template v-slot:item.index="{ item }">
          <span>
            {{
              rows
                .map(function (x) {
                  return x.name
                })
                .indexOf(item.name)
            }}
          </span>
        </template>
        <template v-slot:item.name="{ item }">
          {{ item.name }}<span v-if="item.derived">&nbsp;*</span>
        </template>
        <template v-slot:item.value="{ item }">
          <value-widget
            :value="item.value"
            :limits-state="item.limitsState"
            :counter="item.counter"
            :parameters="[targetName, packetName, item.name]"
            :settings="[['WIDTH', '100%']]"
          />
        </template>
        <template v-slot:footer.prepend
          >* indicates a&nbsp;
          <a href="https://openc3.com/docs/v5/telemetry#derived-items"
            >DERIVED</a
          >&nbsp;item</template
        >
      </v-data-table>
    </v-card>
    <v-dialog
      v-model="optionsDialog"
      @keydown.esc="optionsDialog = false"
      max-width="300"
    >
      <v-card>
        <v-system-bar>
          <v-spacer />
          <span>Options</span>
          <v-spacer />
        </v-system-bar>
        <v-card-text>
          <div class="pa-3">
            <v-text-field
              min="0"
              max="10000"
              step="100"
              type="number"
              label="Refresh Interval (ms)"
              :value="refreshInterval"
              @change="refreshInterval = $event"
              data-test="refresh-interval"
            />
          </div>
          <div class="pa-3">
            <v-text-field
              min="1"
              max="10000"
              step="1"
              type="number"
              label="Time at which to mark data Stale (s)"
              :value="staleLimit"
              @change="staleLimit = parseInt($event)"
              data-test="stale-limit"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { OpenC3Api } from '@openc3/tool-common/src/services/openc3-api'
import ValueWidget from '@openc3/tool-common/src/components/widgets/ValueWidget'
import TargetPacketItemChooser from '@openc3/tool-common/src/components/TargetPacketItemChooser'
import TopBar from '@openc3/tool-common/src/components/TopBar'

export default {
  components: {
    TargetPacketItemChooser,
    ValueWidget,
    TopBar,
  },
  data() {
    return {
      title: 'COSMOS Packet Viewer',
      search: '',
      data: [],
      headers: [
        { text: 'Index', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Value', value: 'value' },
      ],
      optionsDialog: false,
      showIgnored: false,
      derivedLast: false,
      ignoredItems: [],
      derivedItems: [],
      menus: [
        {
          label: 'File',
          items: [
            {
              label: 'Options',
              command: () => {
                this.optionsDialog = true
              },
            },
          ],
        },
        {
          label: 'View',
          radioGroup: 'Formatted Items with Units', // Default radio selected
          items: [
            {
              label: 'Show Ignored Items',
              checkbox: true,
              checked: false,
              command: (item) => {
                this.showIgnored = item.checked
              },
            },
            {
              label: 'Display DERIVED Last',
              checkbox: true,
              checked: false,
              command: (item) => {
                this.derivedLast = item.checked
              },
            },
            {
              divider: true,
            },
            {
              label: 'Formatted Items with Units',
              radio: true,
              command: () => {
                this.valueType = 'WITH_UNITS'
              },
            },
            {
              label: 'Formatted Items',
              radio: true,
              command: () => {
                this.valueType = 'FORMATTED'
              },
            },
            {
              label: 'Converted Items',
              radio: true,
              command: () => {
                this.valueType = 'CONVERTED'
              },
            },
            {
              label: 'Raw Items',
              radio: true,
              command: () => {
                this.valueType = 'RAW'
              },
            },
          ],
        },
      ],
      updater: null,
      counter: 0,
      targetName: '',
      packetName: '',
      valueType: 'WITH_UNITS',
      refreshInterval: 1000,
      staleLimit: 30,
      rows: [],
      menuItems: [],
      itemsPerPage: 20,
      api: null,
    }
  },
  watch: {
    // Create a watcher on refreshInterval so we can change the updater
    refreshInterval: function (newValue, oldValue) {
      this.changeUpdater(false)
    },
    itemsPerPage: function (newValue, oldValue) {
      localStorage['packet_viewer__items_per_page'] = newValue
    },
  },
  created() {
    this.api = new OpenC3Api()
    // If we're passed in the route then manually call packetChanged to update
    if (this.$route.params.target && this.$route.params.packet) {
      this.packetChanged({
        targetName: this.$route.params.target.toUpperCase(),
        packetName: this.$route.params.packet.toUpperCase(),
      })
    }
    let local = parseInt(localStorage['packet_viewer__items_per_page'])
    if (local) {
      this.itemsPerPage = local
    } else {
      this.itemsPerPage = 20
    }
  },
  beforeDestroy() {
    if (this.updater != null) {
      clearInterval(this.updater)
      this.updater = null
    }
  },
  methods: {
    packetChanged(event) {
      if (
        this.targetName === event.targetName &&
        this.packetName === event.packetName
      ) {
        return
      }
      this.api.get_target(event.targetName).then((target) => {
        this.ignoredItems = target.ignored_items
      })
      this.api
        .get_packet_derived_items(event.targetName, event.packetName)
        .then((derived) => {
          this.derivedItems = derived
        })

      this.targetName = event.targetName
      this.packetName = event.packetName
      if (
        this.$route.params.target !== event.targetName ||
        this.$route.params.packet !== event.packetName
      ) {
        this.$router.push({
          name: 'PackerViewer',
          params: {
            target: this.targetName,
            packet: this.packetName,
          },
        })
      }
      this.changeUpdater(true)
    },

    changeUpdater(clearExisting) {
      if (this.updater != null) {
        clearInterval(this.updater)
        this.updater = null
      }

      if (clearExisting) {
        this.rows = []
      }

      this.updater = setInterval(() => {
        this.api
          .get_tlm_packet(
            this.targetName,
            this.packetName,
            this.valueType,
            this.staleLimit,
          )
          .then((data) => {
            // Make sure data isn't null or undefined. Note this is the only valid use of == or !=
            if (data != null) {
              this.counter += 1
              let derived = []
              let other = []
              data.forEach((value) => {
                if (!this.showIgnored && this.ignoredItems.includes(value[0])) {
                  return
                }
                if (this.derivedItems.includes(value[0])) {
                  derived.push({
                    name: value[0],
                    value: value[1],
                    limitsState: value[2],
                    derived: true,
                    counter: this.counter,
                  })
                } else {
                  other.push({
                    name: value[0],
                    value: value[1],
                    limitsState: value[2],
                    derived: false,
                    counter: this.counter,
                  })
                }
              })
              if (this.derivedLast) {
                this.rows = other.concat(derived)
              } else {
                this.rows = derived.concat(other)
              }
            }
          })
      }, this.refreshInterval)
    },
  },
}
</script>
