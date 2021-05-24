function my_promise(exector){


    var _this = this;
    this.status = "pending";
    this.value = undefined;
    this.resolveList = [];
    this.rejectList = [];

    try{
        exector(resolve,reject)
    }catch(e){
        reject(e)
    }

     function resolve(value) {
        if(_this.status === 'pending') {
          _this.status = 'fulfilled'
          _this.value = value
          _this.resolveList.forEach(item=> {
            item(_this.value)
            _this.resolveList.shift()
          })
        }
      } 
    
    
  
      function reject(value) {
        if(_this.status === 'pending') {
          _this.status = 'rejected'
          _this.value = value
          _this.rejectList.forEach(item=> {
            item(_this.value)
            _this.rejectList.shift()
          })
        }
      }
}
    my_promise.prototype.then = function(resolveCallback,rejectCallback){
        if(this.status === "fulfilled"){
            resolve(this.value);
        }
        if(this.status === "rejected"){
            reject(this.value);
        }
        if(this.status === 'pending') {
            this.resolveList.push(resolveCallback)
            this.rejectList.push(rejectCallback)
          }
    }
    

    new my_promise((resolve, reject)=> {
        setTimeout(()=> {
          resolve('1')
        }, 1000)
      }).then((data)=> {
        console.log('resolve' + data)
      }, (data)=> {
        console.log('reject' + data)
      })

    





