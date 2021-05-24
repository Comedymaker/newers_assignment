## 异步Javascript

#### 关于Javascript的异步特性

1. 产生阻塞的代码

   当浏览器里面的一个web应用进行密集运算还没有把控制权返回给浏览器的时候，整个浏览器就像冻僵了一样，这叫做**阻塞；**这时候浏览器无法继续处理用户的输入并执行其他任务，直到web应用交回处理器的控制。

2. 线程

   + 为什么js要选择单线程？

   > 其实这与它的用途有关。作为浏览器脚本语言，JavaScript 的主要用途是与用户互动，以及操作 DOM。若以多线程的方式操作这些 DOM，则可能出现操作的冲突。假设有两个线程同时操作一个 DOM 元素，线程 1 要求浏览器删除 DOM，而线程 2 却要求修改 DOM 样式，这时浏览器就无法决定采用哪个线程的操作。

   + Javascript是单线程的，即使计算机拥有多个内核。一个**线程**是一个基本的处理过程，程序用它来完成任务。每个线程一次只能执行一个任务。

   + 线程与进程：

   > 进程和线程都是操作系统的概念。进程是应用程序的执行实例，每一个进程都是由私有的虚拟地址空间、代码、数据和其它系统资源所组成；进程在运行过程中能够申请创建和使用系统资源（如独立的内存区域等），这些资源也会随着进程的终止而被销毁。而线程则是进程内的一个独立执行单元，在不同的线程之间是可以共享进程资源的，所以在多线程的情况下，需要特别注意对临界资源的访问控制。在系统创建进程之后就开始启动执行进程的主线程，而进程的生命周期和这个主线程的生命周期一致，主线程的退出也就意味着进程的终止和销毁。主线程是由系统进程所创建的，同时用户也可以自主创建其它线程，这一系列的线程都会并发地运行于同一个进程中。

3. 某些异步特性带来的错误

   例如你要获取某一个图片或文件等数据，在随后的代码中使用这些数据，然而，取决于网络速度的限制，获取数据是需要时间的，但由于下载数据是一个异步行为，代码会接着运行，在接下来的代码中对这些数据进行操作就会发生错误。

   例如:

   > ```javascript
   > var response = fetch('myImage.png');
   > var blob = response.blob();
   > // display your image blob in the UI somehow
   > ```

   ```javascript
   function loadScript(src) {  
   
   // 创建一个 <script> 标签，并将其附加到页面 
   
   // 这将使得具有给定 src 的脚本开始加载，并在加载完成后运行  
   
   let script = document.createElement('script');  
   
   script.src = src;  
   
   document.head.append(script); 
   
   }
   
   // 在给定路径下加载并执行脚本 
   
   loadScript('/my/script.js');
   
   // loadScript 下面的代码 
   
   // 不会等到脚本加载完成才执行 
   
   // ...
   ```

   

   但如果我们在 `loadScript(…)` 调用后立即执行此操作，这将不会有效。

   ```javascript
   loadScript('/my/script.js'); // 这个脚本有 "function newFunction() {…}"
   
   newFunction(); // 没有这个函数！
   ```

#### 回调函数

​		当我们把回调函数作为一个参数传递给另一个函数时，仅仅是把回调函数定义作为参数传递过去 — 回调函数并没有立刻执行，回调函数会在包含它的函数的某个地方异步执行，包含函数负责在合适的时候执行回调函数。

​		关于上面loadscript例子的回调函数法解决：

``` javascript
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;
  script.onload = () => callback(script);
  document.head.append(script);
}

loadScript('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.2.0/lodash.js', script => {
  alert(`Cool, the script ${script.src} is loaded`);
  alert( _ ); // 所加载的脚本中声明的函数
});
```



#### Promise

+ 为什么需要promise？

  关于上面提到的回调函数的确是一个解决某些异步操作带来的问题的好办法，但是请看以下这个例子：如果我们需要按照一定顺序依次加载几个脚本应该怎么办？直接想到的办法是使用回调函数嵌套，即：

  ```javascript
  loadScript('/my/script.js', function(script) {
  
    loadScript('/my/script2.js', function(script) {
  
      loadScript('/my/script3.js', function(script) {
        // ...加载完所有脚本后继续
      });
  
    });
  
  });
  ```

  思考一下会出现什么问题？

  没错，当嵌套的函数过多，代码层次过深，维护难度将大大升高！

  因此，一个最好的解决办法就是**Promise**。

+ 什么是Promise？

  引用一段文章来通俗的解释promise：

  > 想象一下，你是一位顶尖歌手，粉丝没日没夜地询问你下个单曲什么时候发。
  >
  > 为了从中解放，你承诺（promise）会在单曲发布的第一时间发给他们。你给了粉丝们一个列表。他们可以在上面填写他们的电子邮件地址，以便当歌曲发布后，让所有订阅了的人能够立即收到。即便遇到不测，例如录音室发生了火灾，以致你无法发布新歌，他们也能及时收到相关通知。
  >
  > 每个人都很开心：你不会被任何人催促，粉丝们也不用担心错过单曲发行。
  >
  > 这是我们在编程中经常遇到的事儿与真实生活的类比：
  >
  > 1. “生产者代码（producing code）”会做一些事儿，并且会需要一些时间。例如，通过网络加载数据的代码。它就像一位“歌手”。
  > 2. “消费者代码（consuming code）”想要在“生产者代码”完成工作的第一时间就能获得其工作成果。许多函数可能都需要这个结果。这些就是“粉丝”。
  > 3. **Promise** 是将“生产者代码”和“消费者代码”连接在一起的一个特殊的 JavaScript 对象。用我们的类比来说：这就是就像是“订阅列表”。“生产者代码”花费它所需的任意长度时间来产出所承诺的结果，而 “promise” 将在它（译注：指的是“生产者代码”，也就是下文所说的 executor）准备好时，将结果向所有订阅了的代码开放。

+ 构造器语法

  ```javascript
  let promise = new Promise(function(resolve, reject) {
    // executor（生产者代码，“歌手”）
  });
  ```

+ executor是promise被创建时即自动运行的函数，按照引文中的描述，executor应当是生产者代码，executor 会自动运行并尝试执行一项工作。尝试结束后，如果成功则调用 `resolve`，如果出现 error 则调用 `reject`。

+ 由 `new Promise` 构造器返回的 `promise` 对象具有以下内部属性：

  - `state` — 最初是 `"pending"`，然后在 `resolve` 被调用时变为 `"fulfilled"`，或者在 `reject` 被调用时变为 `"rejected"`。
  - `result` — 最初是 `undefined`，然后在 `resolve(value)` 被调用时变为 `value`，或者在 `reject(error)` 被调用时变为 `error`。（但根据console测试似乎不能对promise调用到这俩属性）

  ![image-20210523104157157](C:\Users\54473\AppData\Roaming\Typora\typora-user-images\image-20210523104157157.png)

  - 此处value是可以自定义的表示状态的字符串，而error也可返回一个自定义的error，例如：

    ```javascript
    let promise = new Promise(function(resolve, reject) {
      // 当 promise 被构造完成时，自动执行此函数
    
      // 1 秒后发出工作已经被完成的信号，并带有结果 "done"
      setTimeout(() => resolve("done"), 1000);
    });
    ```

    ```javascript
    let promise = new Promise(function(resolve, reject) {
      // 1 秒后发出工作已经被完成的信号，并带有 error
      setTimeout(() => reject(new Error("Whoops!")), 1000);
    });
    ```

  - 注意：promise中只能由有一个结果或error

+ then, catch, finally

  + then

    语法：

    ```javascript
    promise.then(
      function(result) { /* handle a successful result */ },
      function(error) { /* handle an error */ }
    );
    ```

    用法实例：

    ```js
    let promise = new Promise(function(resolve, reject) {
      setTimeout(() => resolve("done!"), 1000);
    });
    
    // resolve 运行 .then 中的第一个函数
    promise.then(
      result => alert(result), // 1 秒后显示 "done!"
      error => alert(error) // 不运行
    );
    ```

    

    ```js
    let promise = new Promise(function(resolve, reject) {
      setTimeout(() => reject(new Error("Whoops!")), 1000);
    });
    
    // reject 运行 .then 中的第二个函数
    promise.then(
      result => alert(result), // 不运行
      error => alert(error) // 1 秒后显示 "Error: Whoops!"
    );
    ```

  ​		warning:请注意promise.then()函数是含有两个参数的！如果你要仅对错误输出进行相应操作，那么调用时不能漏掉第一个参数，即**.then(null, errorHandlingFunction)** 。

  + catch

    与then几乎相同，只不过仅用于error情况，而且不需要对加入then的第一个参数。

  + finally

    `.finally(f)` 调用与 `.then(f, f)` 类似，在某种意义上，`f` 总是在 promise 被 settled 时运行：即 promise 被 resolve 或 reject。

    `finally` 处理程序（handler）没有参数。在 `finally` 中，我们不知道 promise 是否成功。没关系，因为我们的任务通常是执行“常规”的定稿程序（finalizing procedures）。

+ Promise链

  之前提到的问题还没有解决：即如何让多个异步任务按顺序进行。

  

  

  



