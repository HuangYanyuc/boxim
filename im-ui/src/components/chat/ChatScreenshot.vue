<template>
  <div class='container'>
    <div class="img">
      <img ref="imgUrl" :src="imgUrl" v-if="imgUrl" alt="" @click.prevent="() => { }" draggable="false">
      <div class="imgbtn" v-if="imgUrl">
        <el-button size="default" @click.stop="cancel">取消</el-button>
        <!-- <el-button type="primary" size="default" @click="confirm">确定</el-button> -->
      </div>
    </div>
    <div :style="screenshotAreaStyle" v-if="imgUrl && isSelect" class="screenshot-area" ref="screenshot-area">
    </div>
  </div>
</template>
<script>
import html2canvas from "html2canvas";

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
      isSelect: false,
      screenshotAreaStyle: {
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px',
      },
      imgUrl: '',
      imgDataUrl: null
    }
  },
  methods: {
    convertToImage(container, options) {
      // 设置放大倍数
      const scale = window.devicePixelRatio;

      // 传入节点原始宽高
      const _width = container.offsetWidth;
      const _height = container.offsetHeight;
      if (options) {
        let { width, height } = options;
        width = width || _width;
        height = height || _height;
      }
      // html2canvas配置项
      const ops = {
        scale,
        // width,
        // height,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        onclone: true,
        ...options
      };
      return new Promise((resolve) => {
        html2canvas(container, ops).then(canvas => {
          //   document.body.appendChild(canvas);  // 直接是一个canvas图片

          // 返回图片的二进制数据
          this.imgDataUrl = canvas.toDataURL("image/png")
          // return canvas.toDataURL("image/png");
          // let dataURI = canvas.toDataURL('image/' + format, quality);  ps:  弃用
          // 生成的Base64图片将比使用toDataURL方法生成的小得多，并且可以方便地在浏览器中显示和处理。
          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              resolve(reader.result);
            }
          }, 'image/jpeg');
        });
      });
    },
    async clickBtn(num) {
      let imgBlobData = ''
      // 调用函数，取到截图的二进制数据，对图片进行处理（保存本地、展示等）
      // 整个网页
      imgBlobData = await this.convertToImage(document.body);
      this.imgUrl = imgBlobData
      this.screenshotInit()
    },
    screenshotInit() {
      document.addEventListener('mousedown', this.startSelection);
    },
    startSelection(event) {
      this.isSelect = true
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.updateScreenshotArea();
      document.removeEventListener('mousedown', this.startSelection);
      document.addEventListener('mousemove', this.updateSelection);
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
        // this.$emit('closeFn')
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
      let { endX, startX, endY, startY } = this
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      const width = endX - startX;
      const height = endY - startY;
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      croppedCtx.drawImage(this.$refs.imgUrl, startX, startY, width, height, 0, 0, width, height);

      // this.$emit('screenshot', croppedCanvas.toDataURL())
      croppedCanvas.toBlob((blob)=>{
      this.$emit('screenshot',blob)
      })

    },

    cancel() {
      Object.assign(this.$data, this.$options.data())
      document.removeEventListener('mousemove', this.updateSelection);
      document.removeEventListener('mouseup', this.endSelection);
      document.removeEventListener('mousedown', this.startSelection);
    },
    confirm() { },
  },
  watch: {
    // imgUrl(nval) {
    //   if(!nval)return
    // }
  },
  mounted() {
  },
  beforeDestroy() {
  },
}
</script>
<style lang="scss" scoped> 
.container {
   display: flex;

   img {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 999;
   }
   .img>img{

    cursor: crosshair;
   }

   .imgbtn {
     position: fixed;
     bottom: 20px;
     left: 50%;
     transform: translate(-50%);
     z-index: 99999;
   }


   .screenshot-area {
     position: fixed;
     border: 2px dashed #000;
     background: rgba(0, 0, 0, 0.1);
     z-index: 1000;
   }

   .btnCon {
     display: flex;
   }

   .btn {
     cursor: pointer;
     width: 200px;
     margin: 20px 20px;
   }

   #content {
     background: rgba(100, 255, 255, 0.5);
     padding: 50px 10px;
   }
 }
</style>