module.exports = {
  "/api": {
    "target": "http://192.168.18.196:8081",
    "changeOrigin": true,
    "ws": false,
    "pathRewrite": {
      "^/api": "/api"
    }
  }
}