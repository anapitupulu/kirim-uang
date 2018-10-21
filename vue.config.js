module.exports = {
  devServer: {
    proxy: {
      '/service': {
        changeOrigin: true,
        target: 'https://kirimuang-service.herokuapp.com',
        pathRewrite: {'^/service': ''},
      },
    },
  },
}
