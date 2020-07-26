// app/controller/home.js
const path = require('path')
const fse = require('fs-extra') //  (移动文件，copy文件)给文件系统增加了很多的扩展功能
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = {
      code: 0
    };
  }
  async upload(){
    const {ctx} = this
    const file = ctx.request.files[0]
    console.log('file',file)
    const targetPath = path.resolve(this.config.UPLOAD_DIR, file.filename)
    // 设置文件上传的路径， 把文件临时保存的路径移到真实的路径
    await fse.move(file.filepath,targetPath)
    ctx.body={
      code:0,
      message: '11'
    }
  }
  // 断点续传
  async uploadList(){
    const {ctx} = this
    const file = ctx.request.files[0]
    const { fileHash , hash} = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, fileHash)
    await fse.move(file.filepath,`${chunkPath}/${hash}`)
    ctx.body={
      code:0,
      message: '11'
    }
  }
}

module.exports = HomeController;