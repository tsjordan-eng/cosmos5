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
  <div class="pa-3">
    <v-row no-gutters>
      <v-text-field
        dense
        outlined
        readonly
        label="Overall Limits State"
        :value="overallStateFormatted"
        :class="textFieldClass"
        data-test="overall-state"
      />
    </v-row>

    <div v-for="(item, index) in items" :key="item.key">
      <v-row data-test="limits-row" class="my-0 ml-1 mr-1">
        <labelvaluelimitsbar-widget
          v-if="item.limits"
          :parameters="item.parameters"
          :settings="widgetSettings"
        />
        <labelvalue-widget
          v-else
          :parameters="item.parameters"
          :settings="widgetSettings"
        />
        <v-spacer />
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="mr-2"
              @click="ignorePacket(item.key)"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon> mdi-close-circle-multiple </v-icon>
            </v-btn>
          </template>
          <span>Ignore Entire Packet</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="mr-2"
              @click="ignoreItem(item.key)"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon> mdi-close-circle </v-icon>
            </v-btn>
          </template>
          <span>Ignore Item</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="mr-2"
              @click="removeItem(item.key)"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon> mdi-eye-off </v-icon>
            </v-btn>
          </template>
          <span>Temporarily Hide Item</span>
        </v-tooltip>
      </v-row>
      <v-divider v-if="index < items.length - 1" :key="index" />
    </div>
    <v-dialog v-model="ignoredItemsDialog" max-width="600">
      <v-card>
        <v-system-bar>
          <v-spacer />
          <span>Ignored Items</span>
          <v-spacer />
        </v-system-bar>
        <v-card-text>
          <div class="my-2">
            <div v-for="(item, index) in ignoredFormatted" :key="index">
              <v-row class="ma-1">
                <span class="font-weight-black"> {{ item }} </span>
                <v-spacer />
                <v-btn
                  @click="restoreItem(item, index)"
                  small
                  icon
                  :data-test="`remove-ignore-${index}`"
                >
                  <v-icon> mdi-delete </v-icon>
                </v-btn>
              </v-row>
              <v-divider
                v-if="index < ignoredFormatted.length - 1"
                :key="index"
              />
            </div>
            <v-row class="mt-2">
              <v-spacer />
              <v-btn
                @click="ignoredItemsDialog = false"
                class="mx-2"
                color="primary"
              >
                Ok
              </v-btn>
            </v-row>
            <v-divider v-if="index < items.length - 1" :key="index" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { OpenC3Api } from '@openc3/tool-common/src/services/openc3-api'
import Cable from '@openc3/tool-common/src/services/cable.js'
import LabelvalueWidget from '@openc3/tool-common/src/components/widgets/LabelvalueWidget'
import LabelvaluelimitsbarWidget from '@openc3/tool-common/src/components/widgets/LabelvaluelimitsbarWidget'
import Vue from 'vue'

export default {
  components: {
    LabelvalueWidget,
    LabelvaluelimitsbarWidget,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      api: null,
      cable: new Cable(),
      ignored: [],
      ignoredItemsDialog: false,
      overallState: 'GREEN',
      items: [],
      itemList: [],
      screenItems: [],
      screenValues: {},
      updateCounter: 0,
      widgetSettings: [
        ['WIDTH', '520px'], // Total of three subwidgets
        ['0', 'WIDTH', '180px'],
        ['1', 'WIDTH', '180px'],
        ['2', 'WIDTH', '160px'],
        ['__SCREEN__', this],
      ],
    }
  },
  computed: {
    textFieldClass() {
      if (this.overallState) {
        return `textfield-${this.overallState.toLowerCase()}`
      } else {
        return ''
      }
    },
    overallStateFormatted() {
      if (this.ignored.length === 0) {
        return this.overallState
      } else {
        return `${this.overallState} (Some items ignored)`
      }
    },
    ignoredFormatted() {
      return this.ignored.map((x) => x.split('__').join(' '))
    },
  },
  created() {
    this.api = new OpenC3Api()
    // Value is passed in as the list of ignored items
    for (let item of this.value) {
      if (item.match(/.+__.+__.+/)) {
        // TARGET__PACKET__ITEM
        this.ignoreItem(item, true)
      } else {
        // TARGET__PACKET
        this.ignorePacket(item, true)
      }
    }
    this.updateOutOfLimits()

    this.cable
      .createSubscription('LimitsEventsChannel', window.openc3Scope, {
        received: (parsed) => {
          this.cable.recordPing()
          this.handleMessages(parsed)
        },
      })
      .then((limitsSubscription) => {
        this.limitsSubscription = limitsSubscription
      })
    this.cable
      .createSubscription('ConfigEventsChannel', window.openc3Scope, {
        received: (data) => {
          this.cable.recordPing()
          const parsed = JSON.parse(data)
          this.handleConfigEvents(parsed)
        },
      })
      .then((configSubscription) => {
        this.configSubscription = configSubscription
      })
  },
  mounted() {
    this.updater = setInterval(() => {
      this.update()
    }, 1000)
  },
  destroyed() {
    if (this.updater != null) {
      clearInterval(this.updater)
      this.updater = null
    }
    if (this.limitsSubscription) {
      this.limitsSubscription.unsubscribe()
    }
    if (this.configSubscription) {
      this.configSubscription.unsubscribe()
    }
    this.cable.disconnect()
  },
  methods: {
    updateOutOfLimits() {
      this.items = []
      this.itemList = []

      this.api.get_out_of_limits().then((items) => {
        for (const item of items) {
          let itemName = item.join('__')
          // Skip ignored
          if (this.ignored.find((ignored) => itemName.includes(ignored))) {
            continue
          }

          this.itemList.push(itemName)
          let itemInfo = {
            key: item.slice(0, 3).join('__'),
            parameters: item.slice(0, 3),
          }
          if (item[3].includes('YELLOW') && this.overallState !== 'RED') {
            this.overallState = 'YELLOW'
          }
          if (item[3].includes('RED')) {
            this.overallState = 'RED'
          }
          if (item[3] == 'YELLOW' || item[3] == 'RED') {
            itemInfo['limits'] = false
          } else {
            itemInfo['limits'] = true
          }
          this.items.push(itemInfo)
        }
        this.calcOverallState()
      })
    },
    calcOverallState() {
      let overall = 'GREEN'
      for (let item of this.itemList) {
        if (this.ignored.find((ignored) => item.includes(ignored))) {
          continue
        }

        if (item.includes('YELLOW') && overall !== 'RED') {
          overall = 'YELLOW'
        }
        if (item.includes('RED')) {
          overall = 'RED'
          break
        }
      }
      this.overallState = overall
    },
    ignorePacket(item, noUpdate) {
      let [target_name, packet_name, item_name] = item.split('__')
      let newIgnored = `${target_name}__${packet_name}`
      this.ignored.push(newIgnored)
      noUpdate || this.updateIgnored()

      while (true) {
        let index = this.itemList.findIndex((item) => item.includes(newIgnored))
        if (index === -1) {
          break
        } else {
          let underIndex = this.itemList[index].lastIndexOf('__')
          this.removeItem(this.itemList[index].substring(0, underIndex))
        }
      }
      this.calcOverallState()
    },
    ignoreItem(item, noUpdate) {
      this.ignored.push(item)
      noUpdate || this.updateIgnored()
      this.removeItem(item)
      this.calcOverallState()
    },
    restoreItem(item, index) {
      this.ignored.splice(index, 1)
      this.updateIgnored()
      this.updateOutOfLimits()
    },
    removeItem(item) {
      const index = this.itemList.findIndex((arrayItem) =>
        arrayItem.includes(item),
      )
      this.items.splice(index, 1)
      this.itemList.splice(index, 1)
    },
    updateIgnored() {
      this.$emit('input', this.ignored)
    },
    handleConfigEvents(config) {
      for (let event of config) {
        // When a target is deleted we refresh the list of items
        if (event['kind'] === 'deleted' && event['type'] === 'target') {
          this.updateOutOfLimits()
        }
      }
    },
    handleMessages(messages) {
      for (let message of messages) {
        message = JSON.parse(message['event'])

        // We only want to handle LIMITS_CHANGE messages
        // NOTE: The channel also sends LIMITS_SETTINGS and LIMITS_SET messages
        if (message.type != 'LIMITS_CHANGE') {
          continue
        }

        let itemName = `${message.target_name}__${message.packet_name}__${message.item_name}`
        const index = this.itemList.findIndex((arrayItem) =>
          arrayItem.includes(itemName),
        )
        // If we find an existing item we update the state and re-calc overall state
        if (index !== -1) {
          this.itemList[index] = `${itemName}__${message.new_limits_state}`
          this.calcOverallState()
          continue
        }
        // Skip ignored items
        if (this.ignored.find((ignored) => itemName.includes(ignored))) {
          continue
        }
        // Only process items who have gone out of limits
        if (
          message.new_limits_state &&
          !(
            message.new_limits_state.includes('YELLOW') ||
            message.new_limits_state.includes('RED')
          )
        ) {
          continue
        }
        let itemInfo = {
          key: itemName,
          parameters: [
            message.target_name,
            message.packet_name,
            message.item_name,
          ],
        }
        if (
          message.new_limits_state == 'YELLOW' ||
          message.new_limits_state == 'RED'
        ) {
          itemInfo['limits'] = false
        } else {
          itemInfo['limits'] = true
        }
        this.itemList.push(`${itemName}__${message.new_limits_state}`)
        this.items.push(itemInfo)
        this.calcOverallState()
      }
    },
    update() {
      if (this.screenItems.length !== 0) {
        this.api.get_tlm_values(this.screenItems).then((data) => {
          this.updateValues(data)
        })
      }
    },
    updateValues: function (values) {
      this.updateCounter += 1
      for (let i = 0; i < values.length; i++) {
        values[i].push(this.updateCounter)
        Vue.set(this.screenValues, this.screenItems[i], values[i])
      }
    },
    addItem: function (valueId) {
      this.screenItems.push(valueId)
      Vue.set(this.screenValues, valueId, [null, null, 0])
    },
    deleteItem: function (valueId) {
      let index = this.screenItems.indexOf(valueId)
      this.screenItems.splice(index, 1)
    },

    // Menu options
    showIgnored() {
      this.ignoredItemsDialog = true
    },
  },
}
</script>

<style scoped>
/* TODO: Color the border */
.textfield-green :deep(.v-text-field__slot) input,
.textfield-green :deep(.v-text-field__slot) label {
  color: rgb(0, 200, 0);
}

.textfield-yellow :deep(.v-text-field__slot) input,
.textfield-yellow :deep(.v-text-field__slot) label {
  color: rgb(255, 220, 0);
}

.textfield-red :deep(.v-text-field__slot) input,
.textfield-red :deep(.v-text-field__slot) label {
  color: rgb(255, 45, 45);
}
</style>
