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
    <v-overlay :value="showNotificationPane" class="overlay" />
    <v-menu
      v-model="showNotificationPane"
      transition="slide-y-transition"
      :close-on-content-click="false"
      :nudge-width="340"
      offset-y
      :nudge-bottom="20"
    >
      <!-- Bell icon -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" icon>
          <v-icon v-if="unreadCount === 0" :size="size">
            mdi-bell-outline
          </v-icon>
          <v-badge
            v-else
            left
            offset-x="24"
            offset-y="8"
            :color="badgeColor"
            bordered
            :content="unreadCount"
          >
            <v-icon :size="size" :color="badgeColor"> mdi-bell </v-icon>
          </v-badge>
        </v-btn>
      </template>

      <!-- Notifications list -->
      <v-card>
        <v-card-title>
          Notifications
          <v-spacer />
          <v-tooltip top open-delay="350">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                class="ml-1"
                @click="clearNotifications"
                data-test="clear-notifications"
              >
                <v-icon> mdi-notification-clear-all </v-icon>
              </v-btn>
            </template>
            <span>Clear all</span>
          </v-tooltip>
          <v-btn
            icon
            @click="toggleSettingsDialog"
            class="ml-1"
            data-test="notification-settings"
          >
            <v-icon> $astro-settings </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="notifications.length === 0">
          No notifications
        </v-card-text>
        <v-list
          v-else
          two-line
          width="388"
          max-height="80vh"
          class="overflow-y-auto"
          data-test="notification-list"
        >
          <template v-for="(notification, index) in notificationList">
            <template v-if="notification.header">
              <v-divider v-if="index !== 0" :key="index" class="mb-2" />
              <v-subheader :key="notification.header">
                {{ notification.header }}
              </v-subheader>
            </template>

            <v-list-item
              v-else
              :key="`notification-${index}`"
              @click="openDialog(notification)"
              class="pl-2"
            >
              <v-badge left inline color="transparent">
                <v-list-item-content class="pt-0 pb-0">
                  <v-list-item-title
                    :class="{
                      'text--secondary': notification.read,
                      'text-wrap': true,
                    }"
                  >
                    {{ notification.log }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ notification.time | shortDateTime }}
                  </v-list-item-subtitle>
                  <div style="height: 20px" />
                </v-list-item-content>
                <template v-slot:badge>
                  <astro-status-indicator :status="notification.severity" />
                </template>
              </v-badge>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Dialog for viewing full notification -->
    <v-dialog v-model="notificationDialog" width="600">
      <v-card>
        <v-card-title>
          {{ selectedNotification.log }}
          <v-spacer />
          <astro-status-indicator
            :status="selectedNotification.severity || 'INFO'"
          />
        </v-card-title>
        <v-card-subtitle>
          {{ selectedNotification.time | shortDateTime }}
        </v-card-subtitle>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click="navigate(selectedNotification.url)"
          >
            Open
            <v-icon right> mdi-open-in-new </v-icon>
          </v-btn>
          <v-btn color="primary" text @click="notificationDialog = false">
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for changing notification settings -->
    <v-dialog v-model="settingsDialog" width="600">
      <v-card>
        <v-card-title> Notification settings </v-card-title>
        <v-card-text>
          <v-switch v-model="showToast" label="Show toasts" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn color="primary" text @click="toggleSettingsDialog">
            close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatDistanceToNow } from 'date-fns'
import {
  AstroStatusColors,
  UnknownToAstroStatus,
} from '../../../components/icons'
import {
  highestSeverity,
  orderBySeverity,
  groupBySeverity,
} from '../util/AstroStatus'
import Cable from '../../../services/cable.js'

const NOTIFICATION_HISTORY_MAX_LENGTH = 100

export default {
  props: {
    size: {
      type: [String, Number],
      default: 26,
    },
  },
  data: function () {
    return {
      AstroStatusColors,
      cable: new Cable(),
      subscription: null,
      notifications: [],
      showNotificationPane: false,
      toastNotification: {},
      notificationDialog: false,
      selectedNotification: {},
      settingsDialog: false,
      showToast: true,
    }
  },
  computed: {
    badgeColor: function () {
      if (!this.unreadCount) {
        return AstroStatusColors['off']
      }
      const severities = this.unreadNotifications
        .map((notification) => notification.severity)
        .filter((val, index, self) => {
          return self.indexOf(val) === index // Unique values
        })
      return AstroStatusColors[
        UnknownToAstroStatus[highestSeverity(severities)]
      ]
    },
    readNotifications: function () {
      return this.notifications
        .filter((notification) => notification.read)
        .sort((a, b) => b.time - a.time)
    },
    unreadNotifications: function () {
      return this.notifications
        .filter((notification) => !notification.read)
        .sort((a, b) => b.time - a.time)
    },
    unreadCount: function () {
      let result = this.unreadNotifications.length
      if (result >= NOTIFICATION_HISTORY_MAX_LENGTH) {
        result += '+' // Indicate there are more
      }
      return result
    },
    notificationList: function () {
      const groups = groupBySeverity(this.unreadNotifications)
      let result = orderBySeverity(Object.keys(groups), (k) => k).flatMap(
        (severity) => {
          const header = {
            header: severity.charAt(0).toUpperCase() + severity.slice(1),
          }
          return [header, ...groups[severity]]
        },
      )
      if (this.readNotifications.length) {
        result = result.concat([{ header: 'Read' }, ...this.readNotifications])
      }
      return result
    },
  },
  watch: {
    showNotificationPane: function (val) {
      if (!val) {
        if (this.selectedNotification.log) {
          this.notificationDialog = false
          this.selectedNotification = {}
        } else {
          this.markAllAsRead()
        }
      }
    },
    showToast: function (val) {
      localStorage.notoast = !val
    },
  },
  created: function () {
    this.showToast = localStorage.notoast === 'false'
    this.subscribe()
  },
  destroyed: function () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.cable.disconnect()
  },
  methods: {
    markAllAsRead: function () {
      this.notifications.forEach((notification) => {
        notification.read = true
        if (
          !localStorage.lastReadNotification ||
          localStorage.lastReadNotification < notification.msg_id
        ) {
          localStorage.lastReadNotification = notification.msg_id
        }
      })
    },
    clearNotifications: function () {
      this.markAllAsRead()
      this.notifications = []
      localStorage.notificationStreamOffset = localStorage.lastReadNotification
      this.showNotificationPane = false
    },
    toggleNotificationPane: function () {
      this.showNotificationPane = !this.showNotificationPane
    },
    toggleSettingsDialog: function () {
      this.settingsDialog = !this.settingsDialog
    },
    openDialog: function (notification, clearToast = false) {
      notification.read = true
      if (
        !localStorage.lastReadNotification ||
        localStorage.lastReadNotification < notification.msg_id
      ) {
        localStorage.lastReadNotification = notification.msg_id
      }
      this.selectedNotification = notification
      this.notificationDialog = true
    },
    navigate: function (url) {
      window.open(url, '_blank')
    },
    subscribe: function () {
      this.cable
        .createSubscription(
          'MessagesChannel',
          window.openc3Scope,
          {
            received: (data) => this.received(data),
          },
          {
            start_offset:
              localStorage.notificationStreamOffset ||
              localStorage.lastReadNotification,
            types: ['notification', 'alert'],
          },
        )
        .then((subscription) => {
          this.subscription = subscription
        })
    },
    received: function (parsed) {
      this.cable.recordPing()
      if (parsed.length > NOTIFICATION_HISTORY_MAX_LENGTH) {
        parsed.splice(0, parsed.length - NOTIFICATION_HISTORY_MAX_LENGTH)
      }
      let foundToast = false
      parsed.forEach((notification) => {
        notification.read =
          notification.msg_id <= localStorage.lastReadNotification
        notification.severity = notification.severity || 'INFO'
        if (
          !notification.read && // Don't toast read notifications
          ['FATAL', 'ERROR', 'WARN'].includes(notification.severity) // Toast for these statuses
        ) {
          foundToast = true
          this.toastNotification = notification
        }
      })

      if (this.showToast && foundToast) {
        let duration = 5000
        if (['FATAL', 'ERROR'].includes(this.toastNotification.severity)) {
          duration = null
        }

        // Notify takes a minute to be ready on app load
        if (this.$notify) {
          this.$notify[this.toastNotification.severity]({
            ...this.toastNotification,
            type: 'notification',
            duration: duration,
            saveToHistory: false,
          })
        }
      }

      if (
        this.notifications.length + parsed.length >
        NOTIFICATION_HISTORY_MAX_LENGTH
      ) {
        this.notifications.splice(
          0,
          this.notifications.length +
            parsed.length -
            NOTIFICATION_HISTORY_MAX_LENGTH,
        )
      }
      this.notifications = this.notifications.concat(parsed)
    },
  },
  filters: {
    shortDateTime: function (nsec) {
      if (!nsec) return ''
      const date = new Date(nsec / 1_000_000)
      return formatDistanceToNow(date, { addSuffix: true })
    },
  },
}
</script>

<style scoped>
.v-subheader {
  height: 28px;
}

.v-badge {
  width: 100%;
}

.overlay {
  height: 100vh;
  width: 100vw;
}
</style>
