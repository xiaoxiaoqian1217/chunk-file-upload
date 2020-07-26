const path = require('path')
module.exports = () => {
  const config = {}
  config.keys ='xiaoxiaoqian!@123'
  config.multipart = {
    mode: 'file',
    whitelist: () => true
  }
  // egg 框架内置了安全系统，默认开启防止 XSS 攻击 和 CSRF 攻击
  // 我们先暂时关闭
  config.security = {
    csrf : {
      enable: false,
    }
 }
  config.UPLOAD_DIR = path.resolve(__dirname,'..','app/public')
 config.cluster = {
   listen: {
     path:'',
     port: 7002,
     hostname: 'localhost'
   }
 }
  // config.fil
  return config
}
