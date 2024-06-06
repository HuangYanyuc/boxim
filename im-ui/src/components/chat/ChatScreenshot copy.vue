<template>
  <!--继续写页面的其他内容 pop_alert可封装成组件使用-->
  <div :style="screenshotAreaStyle" class="screenshot-area" ref="screenshot-area">
  </div>
</template>
<script>
import html2canvas from "html2canvas"
export default {
  neme: 'ChatScreenshot',
  props: {
    show: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      screenshotAreaStyle: {
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px',
      },
      isSelect: false,
    }
  },
  methods: {
    startSelection(event) {
      this.isSelect = true
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.updateScreenshotArea();
      document.removeEventListener('mousedown', this.startSelection);
      document.addEventListener('mouseup', this.endSelection);
    },
    updateSelection(event) {
      if (!this.show) return;
      if (this.isSelect) {
        this.endX = event.clientX;
        this.endY = event.clientY;
        this.updateScreenshotArea();
      } else {
        this.startX = event.clientX;
        this.startY = event.clientY;
      }
    },
    endSelection(event) {
      if (this.show) {
        this.captureScreenshot(event);
        document.removeEventListener('mousemove', this.updateSelection);
        document.removeEventListener('mouseup', this.endSelection);
        this.isSelect = false
        this.$emit('closeFn')
      }
    },
    updateScreenshotArea() {
      this.screenshotAreaStyle = {
        left: `${Math.min(this.startX, this.endX)}px`,
        top: `${Math.min(this.startY, this.endY)}px`,
        width: `${Math.abs(this.endX - this.startX)}px`,
        height: `${Math.abs(this.endY - this.startY)}px`,
      };
    },
    captureScreenshot(event) {
      console.log(event,JSON.stringify(event))
    },
    screenshotInit() {
      document.addEventListener('mousedown', this.startSelection);
      document.addEventListener('mousemove', this.updateSelection);
    },

    copyTextToClipboard(text) {

    },
    simulateKeyPress(character) {
      var evt = new KeyboardEvent('keydown', {
        key: character,
        code: 'KeyA'.charCodeAt(0),
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(evt);
    }

  },
  mounted() {
  },
  beforeDestroy() {
  },
}
</script>
<style lang="scss">
.screenshot-area {
  position: fixed;
  border: 2px dashed #000;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>