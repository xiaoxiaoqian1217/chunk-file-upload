// 开启一个新的线程去计算文件的md5值 ，不阻碍主线程的渲染
// 导入外部脚步
self.importScripts('./spark-md5.min.js')

self.addEventListener('message', function (e) {
  console.log('onmessage',e)
  const { fileChunk } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  let count = 0
  let percenage = 0
  const hash = 0
  // 递归加载下一个切片
  const loadNext = () => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunk[count].file);
    count++
    reader.onload =(e) => {
      if (count === fileChunk.length) {
        console.log('end')
        self.postMessage({
          percenage: 100,
          hash: spark.end()
        })
        self.close();
      }else{
        percenage += 100 / fileChunk.length
        self.postMessage({
          percenage:percenage,
          index: count
        })
        spark.append(e.target.result);
        loadNext(count)
      }  
    }
  }
  loadNext(0)
}, false);
