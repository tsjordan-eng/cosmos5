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
  <v-dialog v-model="show" width="600">
    <v-card>
      <v-system-bar>
        <v-spacer />
        <span> Details </span>
        <v-spacer />
      </v-system-bar>

      <v-card-title>
        {{ targetName }} {{ packetName }} {{ itemName }}
      </v-card-title>
      <v-card-subtitle>{{ details.description }}</v-card-subtitle>
      <v-card-text>
        <v-container fluid>
          <v-row no-gutters v-if="type === 'tlm'">
            <v-col cols="3" class="label">Item Values</v-col>
            <v-col />
            <v-container fluid class="ml-5 pa-0">
              <v-row no-gutters>
                <v-col cols="4" class="label">Raw Value</v-col>
                <v-col>{{ rawValue }}</v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4" class="label">Converted Value</v-col>
                <v-col>{{ convertedValue }}</v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4" class="label">Formatted Value</v-col>
                <v-col>{{ formattedValue }}</v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4" class="label">With Units Value</v-col>
                <v-col>{{ unitsValue }}</v-col>
              </v-row>
            </v-container>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Bit Offset</v-col>
            <v-col>{{ details.bit_offset }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Bit Size</v-col>
            <v-col>{{ details.bit_size }}</v-col>
          </v-row>
          <v-row v-if="details.array_size" no-gutters>
            <v-col cols="3" class="label">Array Size</v-col>
            <v-col>{{ details.array_size }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Data Type</v-col>
            <v-col>{{ details.data_type }}</v-col>
          </v-row>
          <v-row no-gutters v-if="type === 'cmd'">
            <v-col cols="3" class="label">Minimum</v-col>
            <v-col>{{ details.minimum }}</v-col>
          </v-row>
          <v-row no-gutters v-if="type === 'cmd'">
            <v-col cols="3" class="label">Maximum</v-col>
            <v-col>{{ details.maximum }}</v-col>
          </v-row>
          <v-row no-gutters v-if="type === 'cmd'">
            <v-col cols="3" class="label">Default</v-col>
            <v-col>{{ details.default }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Format String</v-col>
            <v-col>{{ details.format_string }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Read Conversion</v-col>
            <v-col v-if="details.read_conversion">
              Class: {{ details.read_conversion.class }}
              <br />
              Params:
              {{ details.read_conversion.params }}
            </v-col>
            <v-col v-else></v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Write Conversion</v-col>
            <v-col v-if="details.write_conversion">
              Class: {{ details.write_conversion.class }}
              <br />
              Params:
              {{ details.write_conversion.params }}
            </v-col>
            <v-col v-else></v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Id Value</v-col>
            <v-col>{{ details.id_value }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Units Full</v-col>
            <v-col>{{ details.units_full }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Units Abbr</v-col>
            <v-col>{{ details.units }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="3" class="label">Endianness</v-col>
            <v-col>{{ details.endianness }}</v-col>
          </v-row>
          <v-row no-gutters v-if="details.states">
            <v-col cols="3" class="label">States</v-col>
            <v-col />
            <v-container fluid class="ml-5 pa-0">
              <v-row
                no-gutters
                v-for="(state, key) in details.states"
                :key="key"
              >
                <v-col cols="4" class="label">{{ key }}</v-col>
                <v-col>{{ state.value }}</v-col>
              </v-row>
            </v-container>
          </v-row>
          <v-row no-gutters v-else>
            <v-col cols="3" class="label">States</v-col>
            <v-col>None</v-col>
          </v-row>
          <v-row no-gutters v-if="details.limits">
            <v-col cols="3" class="label">Limits</v-col>
            <v-col></v-col>
            <v-container fluid class="ml-5 pa-0">
              <v-row
                no-gutters
                v-for="(limit, key) in details.limits"
                :key="key"
              >
                <v-col v-if="key === 'enabled'" cols="4" class="label"
                  >Enabled</v-col
                >
                <v-switch
                  v-if="key === 'enabled'"
                  v-model="details.limits.enabled"
                  @change="changeLimitsEnabled"
                  dense
                  hide-details
                ></v-switch>
                <v-col v-if="key !== 'enabled'" cols="4" class="label">{{
                  key
                }}</v-col>
                <div v-if="key !== 'enabled'">{{ formatLimit(limit) }}</div>
                <v-col></v-col>
              </v-row>
            </v-container>
          </v-row>
          <v-row no-gutters v-else>
            <v-col cols="3" class="label">Limits</v-col>
            <v-col>None</v-col>
          </v-row>
          <v-row no-gutters v-if="details.meta">
            <v-col cols="3" class="label">Meta</v-col>
            <v-col></v-col>
            <v-container fluid class="ml-5 pa-0">
              <v-row no-gutters v-for="(value, key) in details.meta" :key="key">
                <v-col cols="4" class="label">{{ key }}</v-col>
                <v-col>{{ value }}</v-col>
              </v-row>
            </v-container>
          </v-row>
          <v-row v-else no-gutters>
            <v-col cols="3" class="label">Meta</v-col>
            <v-col>None</v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { OpenC3Api } from '../services/openc3-api.js'

export default {
  props: {
    type: {
      default: 'tlm',
      validator: function (value) {
        // The value must match one of these strings
        return ['cmd', 'tlm'].indexOf(value) !== -1
      },
    },
    targetName: String,
    packetName: String,
    itemName: String,
    value: Boolean, // value is the default prop when using v-model
  },
  data() {
    return {
      details: Object,
      updater: null,
      rawValue: null,
      convertedValue: null,
      formattedValue: null,
      unitsValue: null,
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value) // input is the default event when using v-model
      },
    },
  },
  created() {
    this.api = new OpenC3Api()
  },
  beforeDestroy() {
    clearInterval(this.updater)
    this.updater = null
  },
  watch: {
    // Create a watcher on value which is the indicator to display the dialog
    // If value is true we request the details from the server
    // If this is a tlm dialog we setup an interval to get the telemetry values
    value: function (newValue, oldValue) {
      if (newValue) {
        this.requestDetails()
        if (this.type === 'tlm') {
          this.updater = setInterval(() => {
            this.api
              .get_tlm_values([
                `${this.targetName}__${this.packetName}__${this.itemName}__RAW`,
                `${this.targetName}__${this.packetName}__${this.itemName}__CONVERTED`,
                `${this.targetName}__${this.packetName}__${this.itemName}__FORMATTED`,
                `${this.targetName}__${this.packetName}__${this.itemName}__WITH_UNITS`,
              ])
              .then((values) => {
                for (var i = 0; i < values.length; i++) {
                  let rawString = null
                  // Check for raw encoded strings (non-ascii)
                  if (
                    values[i][0]['json_class'] === 'String' &&
                    values[i][0]['raw'] !== undefined
                  ) {
                    rawString = values[i][0]['raw']
                  } else if (this.details.data_type === 'BLOCK') {
                    rawString = values[i][0]
                  }
                  if (rawString !== null) {
                    // Slice the number of bytes in case they added UNITS
                    // Othewise we would render the units,
                    // e.g. UNITS of 'B' becomes 20 42 (space, B)
                    rawString = rawString.slice(
                      0,
                      parseInt(this.details.bit_size) / 8
                    )
                    // Only display the first 64 bytes at which point ...
                    let ellipse = false
                    if (rawString.length > 64) {
                      ellipse = true
                    }
                    values[i][0] = Array.from(
                      rawString.slice(0, 64),
                      function (byte) {
                        return ('0' + (byte & 0xff).toString(16)).slice(-2)
                      }
                    )
                      .join(' ')
                      .toUpperCase()
                    if (ellipse) {
                      values[i][0] += '...'
                    }
                  }
                }
                if (
                  this.details.data_type.includes('INT') &&
                  !this.details.array_size
                ) {
                  // For INT and UINT display both dec and hex
                  this.rawValue = `${values[0][0]} (0x${values[0][0]
                    .toString(16)
                    .toUpperCase()})`
                } else {
                  this.rawValue = values[0][0]
                }
                this.convertedValue = values[1][0]
                this.formattedValue = values[2][0]
                this.unitsValue = values[3][0]
              })
          }, 1000)
        }
      } else {
        clearInterval(this.updater)
        this.updater = null
      }
    },
  },
  methods: {
    async requestDetails() {
      if (this.type === 'tlm') {
        await this.api
          .get_item(this.targetName, this.packetName, this.itemName)
          .then((details) => {
            this.details = details
            if (details.limits) {
              let enabled = false
              if (details.limits.enabled) {
                enabled = true
                delete details.limits.enabled
              }
              // Do this to assign enabled first since it's missing when it's false
              this.details.limits = { enabled: enabled, ...details.limits }
            }
          })
      } else {
        await this.api
          .get_parameter(this.targetName, this.packetName, this.itemName)
          .then((details) => {
            this.details = details
          })
      }
    },
    async changeLimitsEnabled() {
      if (this.details.limits.enabled) {
        await this.api.enable_limits(
          this.targetName,
          this.packetName,
          this.itemName
        )
      } else {
        await this.api.disable_limits(
          this.targetName,
          this.packetName,
          this.itemName
        )
      }
    },
    formatLimit(limit) {
      if (limit.green_low) {
        return (
          'RL/' +
          limit.red_low +
          ' YL/' +
          limit.yellow_low +
          ' YH/' +
          limit.yellow_high +
          ' RH/' +
          limit.red_high +
          ' GL/' +
          limit.green_low +
          ' GH/' +
          limit.green_high
        )
      } else if (limit.red_low) {
        return (
          'RL/' +
          limit.red_low +
          ' YL/' +
          limit.yellow_low +
          ' YH/' +
          limit.yellow_high +
          ' RH/' +
          limit.red_high
        )
      } else {
        return limit
      }
    },
  },
}
</script>

<style scoped>
.label {
  font-weight: bold;
  text-transform: capitalize;
}
:deep(.v-input--selection-controls) {
  padding: 0px;
  margin: 0px;
}
</style>
