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
  <div class="value-widget-container" :style="[computedStyle, aging]">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          solo
          dense
          readonly
          single-line
          hide-no-data
          hide-details
          placeholder="Value"
          :value="_value"
          :class="valueClass"
          data-test="value"
          @contextmenu="showContextMenu"
          v-bind="attrs"
          v-on="on"
        />
      </template>
      <span>{{ fullName }}</span>
    </v-tooltip>
    <v-menu
      v-model="contextMenuShown"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in contextMenuOptions"
          :key="index"
          @click.stop="item.action"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <details-dialog
      :target-name="parameters[0]"
      :packet-name="parameters[1]"
      :item-name="parameters[2]"
      v-model="viewDetails"
    />
  </div>
</template>

<script>
// When we apply a fixed character width we need to pad a bit since the
// width applies to the enclosing div and not the underlying input
const INPUT_PADDING = 4

import VWidget from './VWidget'
import DetailsDialog from '../../components/DetailsDialog'
export default {
  components: {
    DetailsDialog,
  },
  mixins: [VWidget],
  data: function () {
    return {
      width: 12 + INPUT_PADDING, // 'ch'
    }
  },
  computed: {
    fullName() {
      return (
        this.parameters[0] + ' ' + this.parameters[1] + ' ' + this.parameters[2]
      )
    },
    aging() {
      return {
        '--aging': this.grayLevel,
      }
    },
  },
  created() {
    this.verifyNumParams(
      'VALUE',
      3,
      5,
      'VALUE <TARGET> <PACKET> <ITEM> <TYPE> <WIDTH>',
    )
    // Note: TYPE is parameters[3]
    // This works because NaN selects the default width
    this.setWidth(
      parseInt(this.parameters[4]) + INPUT_PADDING,
      'ch',
      this.width,
    )
  },
}
</script>

<style lang="scss" scoped>
.value-widget-container {
  min-height: 34px;
}
.value-widget-container :deep(.v-input__slot) {
  background: rgba(var(--aging), var(--aging), var(--aging), 1) !important;
}
.value-widget-container :deep(input) {
  text-align: var(--text-align) !important;
}
.value :deep(div) {
  min-height: 24px !important;
  display: flex !important;
  align-items: center !important;
}
// TODO: These openc3 styles are also defined in assets/stylesheets/layout/_overrides.scss
// Can they somehow be reused here? We need to force the style down into the input
.openc3-green :deep(input) {
  color: rgb(0, 200, 0);
}
.openc3-yellow :deep(input) {
  color: rgb(255, 220, 0);
}
.openc3-red :deep(input) {
  color: rgb(255, 45, 45);
}
.openc3-blue :deep(input) {
  color: rgb(0, 153, 255);
}
.openc3-purple :deep(input) {
  color: rgb(200, 0, 200);
}
.openc3-black :deep(input) {
  color: black;
}
.openc3-white :deep(input) {
  color: white;
}
</style>
