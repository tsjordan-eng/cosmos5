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
# All changes Copyright 2023, OpenC3, Inc.
# All Rights Reserved
#
# This file may also be used under the terms of a commercial license
# if purchased from OpenC3, Inc.
-->

<template>
  <div>
    <v-dialog v-model="show" width="500">
      <v-card>
        <form v-on:submit.prevent="submitHandler">
          <v-system-bar>
            <v-spacer />
            <span> Create New Trigger Group </span>
            <v-spacer />
          </v-system-bar>
          <v-card-text>
            Creating a new Trigger Group spawns a new microservice which
            processes all triggers sequentially. This is generally only
            necessary if you have high priority or overlapping triggers.
            <div class="pt-3">
              <v-text-field
                v-model="groupName"
                label="Group Name"
                data-test="group-input-name"
                autofocus
                dense
                outlined
                hide-details
              />
              <span class="red--text" v-show="error">{{ error }}</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              @click="clearHandler"
              outlined
              class="mx-2"
              data-test="group-create-cancel-btn"
            >
              Cancel
            </v-btn>
            <v-btn
              @click.prevent="submitHandler"
              class="mx-2"
              type="submit"
              color="primary"
              data-test="group-create-submit-btn"
              :disabled="!!error"
            >
              Ok
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Api from '@openc3/tool-common/src/services/api'

export default {
  props: {
    groups: {
      type: Array,
      required: true,
    },
    value: Boolean, // value is the default prop when using v-model
  },
  data() {
    return {
      groupName: '',
    }
  },
  computed: {
    error: function () {
      if (this.groupName.trim() === '') {
        return 'Group name can not be blank.'
      }
      if (this.groupName.includes('_')) {
        return `Group name can not contain an underscore.`
      }
      // Traditional for loop so we can return if we find a match
      if (this.groups.includes(this.groupName)) {
        return `Group name must be unique. Duplicate name found: ${this.groupName}.`
      }
      return null
    },
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value) // input is the default event when using v-model
      },
    },
  },
  methods: {
    clearHandler: function () {
      this.show = !this.show
      this.groupName = ''
    },
    submitHandler(event) {
      const path = `/openc3-api/autonomic/group`
      Api.post(path, {
        data: {
          name: this.groupName,
        },
      }).then((response) => {})
      this.clearHandler()
    },
  },
}
</script>

<style scoped>
.theme--dark .v-card__title,
.theme--dark .v-card__subtitle {
  background-color: var(--v-secondary-darken3);
}
</style>
