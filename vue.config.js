module.exports = {
  devServer: {
    proxy: {
      '/services': {
        changeOrigin: true,
        // target: 'https://kirimuang-service.herokuapp.com',
        target: 'http://localhost:5000',
        pathRewrite: {'^/services': ''},
      },
    },
  },
}
