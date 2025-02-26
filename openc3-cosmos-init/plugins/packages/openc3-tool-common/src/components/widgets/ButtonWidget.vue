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
    <v-btn class="ma-1" color="primary" :style="computedStyle" @click="onClick">
      {{ buttonText }}
    </v-btn>
    <v-dialog v-model="displaySendHazardous" max-width="300">
      <v-card class="pa-3">
        <v-card-title class="headline">Hazardous</v-card-title>
        <v-card-text> Warning: Command is Hazardous. Send? </v-card-text>
        <v-btn @click="sendHazardousCmd" class="primary mr-4">Yes</v-btn>
        <v-btn @click="cancelHazardousCmd" class="primary">No</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { OpenC3Api } from '../../services/openc3-api'
import Api from '../../services/api'
import Widget from './Widget'

export default {
  mixins: [Widget],
  data() {
    return {
      api: null,
      screen: null,
      displaySendHazardous: false,
      lastCmd: '',
    }
  },
  computed: {
    buttonText() {
      return this.parameters[0]
    },
    eval() {
      return this.parameters[1]
    },
  },
  created() {
    this.api = new OpenC3Api()
  },
  methods: {
    async onClick() {
      const lines = this.eval.split(';;')
      // Create local references to variables so users don't need to use 'this'
      const self = this // needed for $emit
      const screen = this.screen
      const api = this.api
      const run_script = this.runScript // TODO: deprecate this in favor of runScript?
      const runScript = this.runScript
      for (let i = 0; i < lines.length; i++) {
        const result = eval(lines[i].trim())
        if (result instanceof Promise) {
          try {
            await result
          } catch (err) {
            // This text is in top_level.rb HazardousError.to_s
            if (err.message.includes('is Hazardous')) {
              this.lastCmd = err.message.split('\n').pop()
              this.displaySendHazardous = true
              while (this.displaySendHazardous) {
                await new Promise((resolve) => setTimeout(resolve, 500))
              }
            }
          }
        }
      }
    },
    sendHazardousCmd() {
      // TODO: This only handles basic cmd() calls in buttons, do we need to handle other? cmd_raw()?
      this.lastCmd = this.lastCmd.replace(
        'cmd(',
        'this.api.cmd_no_hazardous_check('
      )
      eval(this.lastCmd)
      this.displaySendHazardous = false
    },
    cancelHazardousCmd() {
      this.displaySendHazardous = false
    },
    runScript(scriptName, openScript = true, env = {}) {
      let envArray = []
      for (const key in env) {
        envArray.push({ key: key, value: env[key], readonly: false })
      }
      Api.post(`/script-api/scripts/${scriptName}/run`, {
        data: { environment: envArray },
      }).then((response) => {
        if (openScript) {
          window.open(`/tools/scriptrunner/${response.data}`, '_blank')
        }
      })
    },
  },
}
</script>
