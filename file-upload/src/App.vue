<template>
	<div id="app">
		<input type="file" name="file" @change="handleChange" />
		<textarea ref="article" name="article" cols="30" rows="10"></textarea>
		<div>
			<h6>切片进度条</h6>
			<el-progress v-for="(item,index) in chunk" :key="index" :percentage="item.percenage"></el-progress>
			<h6>文件进度条</h6>
			<el-progress :percentage="uploadPercentage"></el-progress>
			<h6>hash进度条</h6>
			<el-progress :percentage="hashPercentage"></el-progress>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'App',
	data() {
		return {
			chunk: [], // 切片
			file: '',
			hashPercentage: 0,
			fileHash: ''
		}
	},
	components: {},
	mounted() {
		var ret = axios.get('/api/index')
		console.log(ret)
		this.bindEvent()
	},
	computed: {
		uploadPercentage() {
			if (!this.chunk || !this.chunk.length) return 0
			const loaded = this.chunk
				.map(item => item.file.size * item.percenage)
				.reduce((total, cur) => total + cur)
			console.log('size', loaded, this.file.size)
			return parseInt(loaded / this.file.size)
		}
	},
	methods: {
		bindEvent() {
			// 复制上传
			this.$refs.article.addEventListener('paste', e => {
				const files = e.clipboardData.files
				console.log('files', files)
				this.file = files[0]
				this.upLoadFile()
			})
			// 拖拽上传
			this.$refs.article.addEventListener('paste', e => {
				const files = e.datatransfer.files
				this.file = files[0]
				this.upLoadFile()
			})
		},
		// 创建切片
		createChunk() {
			const chunkSize = 0.5 * 1024 * 1024
      let cur = 0
      const fileChunk = []

      console.log(this.file.size)
			while (cur < this.file.size) {
				fileChunk.push({
					file: this.file.slice(cur, cur + chunkSize)
				})
				cur += chunkSize
      }
      return fileChunk
		},
		async uploadChunk() {
			const forms = this.chunk.map((item,index) => {
				const {  fileHash ,file, hash} = item
				const form = new FormData()
				form.append('file', file)
        form.append('cur', index)
      
				form.append('fileHash', fileHash)
        form.append('hash', hash)
        return {
          form: form,
          idx: index
        }
      })
      // 当文件很大的时候，Promise.all会并发很多的请求，造成浏览器非常的卡顿
      // 做一下网络请求并发控制
      // Promise.all(promises)
      console.log('forms',forms)
      const res = await this.sendRequest(forms,4)
      console.log('res', res)
    },
    // 网络请求并发控制
    /**
     * @param max 最大并发数
     * @forms 切片数据
     * 
     */
    sendRequest(forms, max = 4){
      const chunk = this.chunk
      return  new Promise((resolve)=> {
      let idx = 0
      let counter = 0
      const start = async () => {
        while(idx < forms.length && max > 0){
          const form = forms[idx].form
          const i = forms[idx].idx
          axios.post('/api/uploadList', form, {
					onUploadProgress: progress => {
						chunk[i].percenage = Number(
							(progress.loaded / progress.total) * 100
						).toFixed(2)
          }
				}).then((res) => {
          console.log(idx,res)
          counter++ // 成功记录
          max++ // 释放通道
          if(counter === forms.length){
            resolve()
          }else{
            start()
          }
        })
        max--
        idx++
        }
         
      }
      start()
      })
      
      
    },
		// 计算文件的hash
		calculateHash(fileChunk) {
			return new Promise((resolve) => {
        
				const worker = new Worker('/hash.js')
				worker.postMessage({ fileChunk })
				worker.onmessage = event => {
					// percenage 是计算切片md5的进度， hash是整个文件的hash
          const { percenage, hash } = event.data
          console.log(percenage, hash)
					this.hashPercentage = percenage
					if (hash) {
						resolve(hash)
					}
				}
			})
		},
		async upLoadFile() {
       const fileChunk =  this.createChunk()
			// 计算切片的hash，已文件内容生成md5的hash，避免因为文件名修改引起问题
			const fileHash = await this.calculateHash(fileChunk)
      this.fileHash = fileHash
      console.log('fileHash',fileHash)
			this.chunk = fileChunk.map((item, index) => {
        console.log(item)
				return {
					fileHash: fileHash,
					hash: fileHash + '-' + index,
					percenage: 0,
          cur: index,
          file: item.file
				}
			})
			this.uploadChunk()
			// return false
			// const form = new FormData()
			// form.append('file', this.file)
			// axios.post('/api/upload', form)
			// console.log('ret', this.file)
		},
		handleChange(e) {
			const file = e.target.files[0]
			this.file = file
			this.upLoadFile()
		}
		// 显示上传进度条
	}
}
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
