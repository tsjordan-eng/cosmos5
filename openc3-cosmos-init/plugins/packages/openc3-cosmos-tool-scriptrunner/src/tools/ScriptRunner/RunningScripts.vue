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
    <v-card flat>
      <v-card-text class="overflow-y-auto" max-height="400">
        <div class="row">
          <div class="v-card__title col-2">Running Scripts</div>
          <div class="col-2">
            <v-btn color="primary" @click="getRunningScripts">Refresh</v-btn>
          </div>
          <div class="col-8">
            <v-text-field
              v-model="runningSearch"
              class="pt-0"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              data-test="running-search"
            />
          </div>
        </div>
      </v-card-text>
      <v-data-table
        :headers="runningHeaders"
        :items="runningScripts"
        :search="runningSearch"
        dense
        calculate-widths
        multi-sort
        sort-by="start_time"
        sort-desc
        data-test="running-scripts"
        :footer-props="{
          itemsPerPageOptions: [3],
          showFirstLastPage: true,
        }"
      >
        <template v-slot:item.connect="{ item }">
          <v-btn color="primary" @click="connectScript(item)">
            <span>Connect</span>
            <v-icon right v-show="connectInNewTab"> mdi-open-in-new </v-icon>
          </v-btn>
        </template>
        <template v-slot:item.stop="{ item }">
          <v-btn color="primary" @click="stopScript(item)">
            <span>Stop</span>
            <v-icon right> mdi-close-circle-outline </v-icon>
          </v-btn>
        </template>
        <template v-slot:item.delete="{ item }">
          <v-btn color="primary" @click="deleteScript(item)">
            <span>Delete</span>
            <v-icon right> mdi-alert-octagon-outline </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-3" flat>
      <v-card-text>
        <div class="row">
          <div class="v-card__title col-2">Completed Scripts</div>
          <div class="col-2">
            <v-btn color="primary" @click="getCompletedScripts">Refresh</v-btn>
          </div>
          <div class="col-8">
            <v-text-field
              v-model="completedSearch"
              class="pt-0"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            />
          </div>
        </div>
      </v-card-text>
      <v-container
        style="max-height: 400px; padding: 0px; margin: 0px"
        class="overflow-y-auto"
      >
        <!-- TODO: This probably needs to be paginated -->
        <v-data-table
          :headers="completedHeaders"
          :items="completedScripts"
          :search="completedSearch"
          dense
          calculate-widths
          multi-sort
          sort-by="start"
          sort-desc
          data-test="completed-scripts"
          :footer-props="{
            itemsPerPageOptions: [5],
            showFirstLastPage: true,
          }"
        >
          <template v-slot:item.download="{ item }">
            <v-btn
              color="primary"
              :disabled="downloadScript"
              :loading="downloadScript && downloadScript.name === item.name"
              @click="downloadScriptLog(item)"
            >
              <span v-if="item.name.includes('Script Report')"
                >Script Report</span
              >
              <span v-else>Script Log</span>
              <v-icon right> mdi-file-download-outline </v-icon>
              <template v-slot:loader>
                <span>Loading...</span>
              </template>
            </v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import Api from '@openc3/tool-common/src/services/api'

export default {
  props: {
    tabId: Number,
    curTab: Number,
    connectInNewTab: Boolean,
  },
  data() {
    return {
      downloadScript: null,
      runningSearch: '',
      runningScripts: [],
      runningHeaders: [
        {
          text: 'Connect',
          value: 'connect',
          sortable: false,
          filterable: false,
        },
        { text: 'Id', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Start Time', value: 'start_time' },
        {
          text: 'Stop',
          value: 'stop',
          sortable: false,
          filterable: false,
        },
        {
          text: 'Force Quit',
          value: 'delete',
          sortable: false,
          filterable: false,
        },
      ],
      completedSearch: '',
      completedScripts: [],
      completedHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Start Time', value: 'start' },
        {
          text: 'Download',
          value: 'download',
          sortable: false,
          filterable: false,
        },
      ],
    }
  },
  created() {
    this.getRunningScripts()
    this.getCompletedScripts()
  },
  methods: {
    getRunningScripts: function () {
      Api.get('/script-api/running-script').then((response) => {
        this.runningScripts = response.data
      })
    },
    getCompletedScripts: function () {
      // TODO: Support pagination because you could have a lot of completed scripts
      Api.get('/script-api/completed-scripts').then((response) => {
        this.completedScripts = response.data
      })
    },
    connectScript: function (script) {
      const destination = {
        name: 'ScriptRunner',
        params: { id: script.id },
      }
      if (this.connectInNewTab) {
        let { href } = this.$router.resolve(destination)
        window.open(href, '_blank')
      } else {
        this.$router.push(destination)
        this.$emit('close')
      }
    },
    stopScript: function (script) {
      this.$dialog
        .confirm(
          `Are you sure you want to stop script: ${script.id} ${script.name}?`,
          {
            okText: 'Stop',
            cancelText: 'Cancel',
          },
        )
        .then((dialog) => {
          return Api.post(`/script-api/running-script/${script.id}/stop`)
        })
        .then((response) => {
          this.$notify.normal({
            body: `Stopped script: ${script.id} ${script.name}`,
          })
          this.getRunningScripts()
        })
        .catch((error) => {
          if (error) {
            this.$notify.caution({
              body: `Failed to stop script: ${script.id} ${script.name}`,
            })
          }
        })
    },
    deleteScript: function (script) {
      this.$dialog
        .confirm(
          `Are you sure you want to force quit script: ${script.id} ${script.name}?\n` +
            'Did you try to stop the script first to allow the script to stop gracefully?',
          {
            okText: 'Force Quit',
            cancelText: 'Cancel',
          },
        )
        .then((dialog) => {
          return Api.post(`/script-api/running-script/${script.id}/delete`)
        })
        .then((response) => {
          this.$notify.normal({
            body: `Stopped script: ${script.id} ${script.name}`,
          })
          this.getRunningScripts()
        })
        .catch((error) => {
          if (error) {
            this.$notify.caution({
              body: `Failed to stop script: ${script.id} ${script.name}`,
            })
          }
        })
    },
    downloadScriptLog: function (script) {
      this.downloadScript = script
      Api.get(
        `/openc3-api/storage/download/${encodeURIComponent(
          script.log,
        )}?bucket=OPENC3_LOGS_BUCKET`,
      )
        .then((response) => {
          const filenameParts = script.log.split('/')
          const basename = filenameParts[filenameParts.length - 1]
          // Make a link and then 'click' on it to start the download
          const link = document.createElement('a')
          link.href = response.data.url
          link.setAttribute('download', basename)
          link.click()
          this.downloadScript = null
        })
        .catch(() => {
          this.$notify.caution({
            title: `Unable to download log for ${script.name}`,
            body: `You may be able to download this log manually from the 'logs' bucket at ${script.log}`,
          })
        })
    },
  },
}
</script>
