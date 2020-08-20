---
title: Lottie动画参数解析
date: 2020-08-18 20:08:22
tags: 前端 动画
---

背景：

1. 简单动画可以通过animation/transition 来实现，但是复杂的动画就很难用这个来实现了，这时候可以使用Lottie来实现相关动画[官网地址](https://github.com/airbnb/lottie-web)。
2. 动效师会生成一个json文件，前端同学使用lottie-web这个npm包，结合动效师给的json文件，就可以做出对应的动画效果了。
3. 但是有一个问题是，动效师给的json文件渲染出来的动画是固定的，比如缩放尺寸，比如位移大小，比如图片等等。有时候我们需要修改这些数据来达到动态动画的目的。比如下图中蘑菇落地的位置是不确定的，这时候我们就需要修改json的数据了

![](/image/mushroom.gif)

下面我们简单介绍一下lottie动画相关参数含义。[github地址](https://github.com/airbnb/lottie-web/tree/master/docs/json) 这个地址介绍了一些参数，但不是很全

```json
{
  "v": "5.4.4",
  "fr": 60, // 帧率
  "ip": 352, // in point 起始点
  "op": 425, // out point 结束点。(op-ip) / fr = 动画时间
  "w": 2048, // 画布宽度
  "h": 1536, // 画布高度
  "nm": "名字",
  "ddd": 0, // 3D层,
  "assets": [ // 资源（一般是图片和合成组的静态资源）
     {
      "id": "image_0",
      "w": 422,
      "h": 432,
      "u": "images/",
      "p": "img_1.png",
      "e": 0
    },
  ],
  "fonts": { // 使用的字体
    "list": [
      {
        "fName": "FZLANTY_CUJW--GB1-0",
        "fFamily": "FZLanTingYuanS-B-GB",
        "fStyle": "Regular",
        "ascent": 78.38134765625
      }
    ]
  },
  layers:[] 
  // 图层。layers里面记录了图层在展示的时候实际的位置和它做动画的关键帧。我们一把要改的就是在这里
}
  
```

下面看看layers

![](/image/mushroom-layers.png)

看看layers[2].ks字段含义

![](/image/mushroom-ks.png)

看看看看layers[2].ks.p即位移相关参数含义

![](/image/mushroom-p.png)

与ks并列的有一个t字段，其内部控制图层文本显示

![](/image/mushroom-text.png)

看完上面lottie输出的json数据含义，大概能得知对应的定制化修改方案了：

1.找到动画的元素对应哪一层，也就是layers的哪一个元素。（蘑菇上的文本在第0层，蘑菇图片在第2层，如果不清楚哪个元素处于哪一层，可以找制作动效的动效师问问）

2.当前需要修改的是蘑菇层的起点和终点位置。需要得到起始位置和结束位置（现在暂时认为已经计算出相关位置），并传入json中，修改对应的参数。

3.同时蘑菇跳动之后的文本显示也需要做修改，不同的蘑菇显示的文本内容不同，而json中是固定的文本，所以需要修改。

4.同时注意如果json是2倍的，需要将对应的位置数据处理成2倍

```
 // 前面计算出蘑菇跳动的起始坐标和结束坐标 startPoint endPoint
 const answerRightAnimator = await lottiePlayer.play(
        'name',
        dom,
        {
          jsonPreHandler: preJson => {
            let json = JSON.parse(JSON.stringify(preJson));
            json.layers[0].t.d.k[0].s.t = 'apple'; // 修改跳动后蘑菇上的文本内容
            // json是2倍的
            json.layers[1].ks.p.k = endPoint;
            json.layers[2].ks.p.k[0].s = startPoint;
            json.layers[2].ks.p.k[0].e = endPoint;
            json.layers[2].ks.p.k[1].s = startPoint;
            json.layers[2].ks.p.k[1].e = endPoint;
            return json;
          },
          renderer: 'canvas',
          // renderer: 'svg'
          // canvas渲染性能比svg更好
        },
      );
```

了解了lottie的json数据字段含义之后，就能对lottie动画做动态修改了。上面所说的是在lottie播放前动态修改属性，还有一种需求可能是动画播放之后，再去修改json的属性，这时候可以使用[lottie-api](https://github.com/bodymovin/lottie-api) 这个库。

