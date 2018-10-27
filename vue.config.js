module.exports = {
  devServer: {
    proxy: {
      '/services': {
        changeOrigin: true,
        target: 'https://kirimuang-service.herokuapp.com',
        pathRewrite: {'^/services': ''},
      },
    },
  },
}
