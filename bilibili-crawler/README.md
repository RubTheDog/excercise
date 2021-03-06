<h3>基于node.js的一个B站视频信息小爬虫</h3>
<p>使用方法：修改crawler.js中url变量为对应链接地址。切换到对应目录，安装好相应依赖后，npm start即可，在目录下即可找到对应番号的文本文件，示例如下</p>
<pre><code>
//有些意义不大的项懒得筛掉了……
{
  title: '听说《名侦探柯南纯黑的噩梦》上映了，那我们就愉快的来吐槽它吧',//标题
  author: 'LexBurner',//作者
  category: '动画综合',//分类名称
  time: '2016-11-26 14:25',//投稿时间
  aid: '7260153',//aid，即大家熟知的视频番号
  cid: '11868869',//cid 可以调用接口获取弹幕信息
  details: 
   { 
     zoneid: '151339074',//    
     chatid: '11868869',
     credits: '0',
     click: '1167224',//点击数
     suggest_comment: 'false',
     duration: '14:52',//视频时长
     acceptguest: 'true',//只有会员知道的世界，B站看片指日可待
     maxlimit: '1500',//弹幕限制
     danmu: '24483',//弹幕数量
     typeid: '27',//分类id
     favourites: '22177',//收藏数
     coins: '57995',//投币数
     arctype: 'Original',
     aid: '7260153' 
   }
}
 </code></pre>
 
<p>主要实现思路，利用cheerio根据对应选择器获取主html文档上有关视频的基本信息</p>
<p>用正则表达式在脚本中捕获aid和cid，并拼接url调用相关接口，进一步获取视频详细信息，其他信息如排行等也基本可以如法炮制</p>

遇到的几个坑：
<ol>
<li>主页面是经过gzip压缩过的，不能直接解析，request的option中需加入gzip:true</li>
<li>详细信息获取的是类似xml格式的平级标签文本，这里在最外面又嵌套了一层标签，然后用了xml2js将其整体转为js对象</li>
<li>也尝试着抓取了详细弹幕信息不过直接变成了乱码，尝试多种编码方式包括采用iconv等模块均未解决，不知道是不是有什么反爬虫机制？留着慢慢研究了</li>
</ol>



