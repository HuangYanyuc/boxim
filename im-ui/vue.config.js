const path = require('path')
function resolve(dir){
  return path.join(__dirname,dir)
}
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://im.loongson.cn/api',
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  configureWebpack:{
    resolve:{
      alias:{
        '@':resolve('src')
      },
      alias:{
        '@_':resolve('public')
      }
    }
  }
}
