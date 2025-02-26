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
  <v-card class="card-height">
    <v-card-title>
      Limits Events
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
      :items="data"
      :search="search"
      calculate-widths
      disable-pagination
      hide-default-footer
      multi-sort
      dense
      :height="calcTableHeight()"
      data-test="limits-events"
    >
      <template v-slot:item.time_nsec="{ item }">
        <span>{{ formatDate(item.time_nsec) }}</span>
      </template>
      <template v-slot:item.message="{ item }">
        <span :class="getColorClass(item.message)">{{ item.message }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { toDate, format } from 'date-fns'
import Cable from '@openc3/tool-common/src/services/cable.js'

export default {
  props: {
    history_count: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      data: [],
      cable: new Cable(),
      search: '',
      headers: [
        { text: 'Time', value: 'time_nsec', width: 250 },
        { text: 'Message', value: 'message' },
      ],
    }
  },
  created() {
    this.cable
      .createSubscription(
        'LimitsEventsChannel',
        window.openc3Scope,
        {
          received: (parsed) => {
            this.cable.recordPing()
            this.handleMessages(parsed)
          },
        },
        {
          history_count: 1000,
        },
      )
      .then((limitsSubscription) => {
        this.limitsSubscription = limitsSubscription
      })
  },
  destroyed() {
    if (this.limitsSubscription) {
      this.limitsSubscription.unsubscribe()
    }
    this.cable.disconnect()
  },
  methods: {
    handleMessages(messages) {
      for (let i = 0; i < messages.length; i++) {
        let event = JSON.parse(messages[i]['event'])
        this.data.unshift(event)
      }
      if (this.data.length > this.history_count) {
        this.data.length = this.history_count
      }
    },
    formatDate(nanoSecs) {
      return format(
        toDate(parseInt(nanoSecs) / 1_000_000),
        'yyyy-MM-dd HH:mm:ss.SSS',
      )
    },
    getColorClass(message) {
      if (message.includes('GREEN')) {
        return 'openc3-green'
      } else if (message.includes('YELLOW')) {
        return 'openc3-yellow'
      } else if (message.includes('RED')) {
        return 'openc3-red'
      } else if (message.includes('BLUE')) {
        return 'openc3-blue'
      }
      if (this.$vuetify.theme.dark) {
        return 'openc3-white'
      } else {
        return 'openc3-black'
      }
    },
    calcTableHeight() {
      // TODO: 250 is a magic number but seems to work well
      return window.innerHeight - 250
    },
  },
}
</script>

<style lang="scss" scoped>
.card-height {
  // TODO: 150 is a magic number but seems to work well
  // Can this be calculated by the size of the table search box?
  height: calc(100vh - 150px);
}
</style>
