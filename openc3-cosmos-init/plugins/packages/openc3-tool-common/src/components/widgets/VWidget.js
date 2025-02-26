/*
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
*/

import Widget from './Widget'
import 'sprintf-js'
export default {
  mixins: [Widget],
  // ValueWidget can either get it's value and limitsState directly through props
  // or it will register itself in the Vuex store and be updated asyncronously
  props: {
    value: {
      default: null,
    },
    limitsState: {
      type: String,
      default: null,
    },
    counter: {
      default: null,
    },
    formatString: null,
  },
  data() {
    return {
      curValue: null,
      prevValue: null,
      grayLevel: 80,
      grayRate: 5,
      valueId: null,
      colorBlind: false,
      viewDetails: false,
      contextMenuShown: false,
      x: 0,
      y: 0,
      contextMenuOptions: [
        {
          title: 'Details',
          action: () => {
            this.contextMenuShown = false
            this.viewDetails = true
          },
        },
        {
          title: 'Graph',
          action: () => {
            window.open(
              '/tools/tlmgrapher/' +
                this.parameters[0] +
                '/' +
                this.parameters[1] +
                '/' +
                this.parameters[2],
              '_blank'
            )
          },
        },
      ],
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    _counter: function (newVal, oldVal) {
      if (this.curValue !== this.prevValue) {
        this.grayLevel = 80
      } else {
        this.grayLevel -= this.grayRate
        if (this.grayLevel < 30) {
          this.grayLevel = 30
        }
      }
      this.prevValue = this.curValue
    },
  },
  computed: {
    _value: function () {
      this.curValue = this.value
      if (this.curValue === null) {
        // See store.js for how this is set
        if (this.screen) {
          if (this.screen.screenValues[this.valueId]) {
            this.curValue = this.screen.screenValues[this.valueId][0]
          }
        } else {
          this.curValue = null
        }
      }
      this.curValue = this.formatValue(this.curValue)
      if (localStorage.colorblindMode === 'true' && this.limitsLetter !== '') {
        return `${this.curValue} (${this.limitsLetter})`
      }
      return this.curValue
    },
    _counter: function () {
      let counter = this.counter
      if (counter === null) {
        if (this.screen) {
          if (this.screen.screenValues[this.valueId]) {
            counter = this.screen.screenValues[this.valueId][2]
          }
        } else {
          counter = null
        }
      }
      return counter
    },
    valueClass: function () {
      return 'value shrink pa-1 ' + 'openc3-' + this.limitsColor
    },
    limitsColor() {
      let limitsState = this.limitsState
      if (limitsState === null) {
        if (this.screen) {
          if (this.screen.screenValues[this.valueId]) {
            limitsState = this.screen.screenValues[this.valueId][1]
          }
        } else {
          limitsState = null
        }
      }
      if (limitsState != null) {
        switch (limitsState) {
          case 'GREEN':
          case 'GREEN_HIGH':
          case 'GREEN_LOW':
            return 'green'
          case 'YELLOW':
          case 'YELLOW_HIGH':
          case 'YELLOW_LOW':
            return 'yellow'
          case 'RED':
          case 'RED_HIGH':
          case 'RED_LOW':
            return 'red'
          case 'BLUE':
            return 'blue'
          case 'STALE':
            return 'purple'
          default:
            return 'white'
        }
      }
      return ''
    },
    limitsLetter() {
      let limitsState = this.limitsState
      if (limitsState === null) {
        if (this.screen) {
          if (this.screen.screenValues[this.valueId]) {
            limitsState = this.screen.screenValues[this.valueId][1]
          }
        } else {
          limitsState = null
        }
      }
      if (limitsState != null) {
        let c = limitsState.charAt(0)
        if (limitsState.endsWith('_LOW')) {
          c = c.toLowerCase()
        }
        return c
      }
      return ''
    },
  },
  created() {
    // If they're not passing us the value and limitsState we have to register
    if (this.value === null || this.limitsState === null) {
      this.valueId = `${this.parameters[0]}__${this.parameters[1]}__${
        this.parameters[2]
      }__${this.getType()}`

      if (this.screen) {
        this.screen.addItem(this.valueId)
      }
    }
  },
  destroyed() {
    if (this.value === null || this.limitsState === null) {
      if (this.screen) {
        this.screen.deleteItem(this.valueId)
      }
    }
  },
  methods: {
    getType() {
      var type = 'WITH_UNITS'
      if (this.parameters[3]) {
        type = this.parameters[3]
      }
      return type
    },
    formatValue(value) {
      // Convert json raw strings into the raw bytes
      // Only convert the first 32 bytes before adding an ellipse
      // TODO: Handle units on a BLOCK item
      // TODO: Render data in a BLOCK item as bytes (instead of ASCII)
      if (
        value &&
        value['json_class'] === 'String' &&
        value['raw'] !== undefined
      ) {
        let result = Array.from(value['raw'].slice(0, 32), function (byte) {
          return ('0' + (byte & 0xff).toString(16)).slice(-2)
        })
          .join(' ')
          .toUpperCase()
        if (value['raw'].length > 32) {
          result += '...'
        }
        return result
      }
      if (Object.prototype.toString.call(value).slice(8, -1) === 'Array') {
        let result = '['
        for (let i = 0; i < value.length; i++) {
          if (
            Object.prototype.toString.call(value[i]).slice(8, -1) === 'String'
          ) {
            result += '"' + value[i] + '"'
          } else {
            result += value[i]
          }
          if (i != value.length - 1) {
            result += ', '
          }
        }
        result += ']'
        return result
      }
      if (Object.prototype.toString.call(value).slice(8, -1) === 'Object') {
        return ''
      }
      if (this.formatString && value) {
        return sprintf(this.formatString, value)
      }
      return '' + value
    },
    showContextMenu(e) {
      e.preventDefault()
      this.contextMenuShown = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.contextMenuShown = true
      })
    },
  },
}
