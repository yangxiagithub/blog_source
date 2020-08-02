---
title: web设备检测
date: 2020-03-24 10:32:38
tags: web
---

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      #video {
        width: 340px;
        height: 237px;
        /* 看自己要变成镜子 */
        transform: scale(-1 , 1)
      }
      #take-photo-btn {
        width: 100px;
        height: 50px;
        border-radius: 10px
      }
      #capture-img {
        width: 340px;
      }
      #microphone-audio {
        width: 20px;
        height: 20px;
        background: red;
      }
    </style>
  </head>
  <body>
    <div class="app">
      <div class="detect-camera-box">
        <video id="video" autoplay></video>
        <button id="take-photo-btn">拍照</button>
        <img id="capture-img">
      </div>
      <div class="detect-microphone-box">
          <audio id="microphone-audio" autoplay></audio>
        </div>
    </div>
    <!-- <script>
      // 设备检测一般包括检测摄像头，扬声器，麦克风这三样。检测摄像头和麦克风需要通过getUserMedia，检测扬声器只需要能播放一个固定的audio音频就代表没问题

      // 简单检测的话，直接用getUserMedia 得到的 stream 赋值给 video.srcObject 或者 audio.srcObject就行
      detect_camera_microphone_easy();

      function detect_camera_microphone_easy() {
        navigator.mediaDevices.getUserMedia({
          // 检测摄像头
          video: {
            width: {
              max: 640,
              ideal: 340,
            },
            height: {
              max: 480,
              ideal: 237,
            },
          },
          // 检测麦克风
          audio: true
        }).then(stream => {
          const videoTracks = stream.getVideoTracks();
          const mediaStream_video =  new MediaStream(videoTracks);
          document.getElementById('video').srcObject = mediaStream_video;
          document.getElementById('take-photo-btn').addEventListener('click', function() {
            imageCapture(mediaStream_video)
          });

          const audioTracks = stream.getAudioTracks();
          const mediaStream_audio = new MediaStream(audioTracks);
          document.getElementById('microphone-audio').srcObject = mediaStream_audio;
        });
        function imageCapture(stream) {
          const videoTracks = stream.getVideoTracks();
          const captureImg = document.getElementById('capture-img');
          new ImageCapture(videoTracks[0]).takePhoto().then(blob => {
            captureImg.src = URL.createObjectURL(blob);
          });
        }
      }
    </script> -->
    <script>
      // 上面那个 script 中的js是超级简单的设备检测版本，当前这个 script 中的js是一个稍微复杂一点点的版本
      // 稍微全面一点的话，设备检测的时候会涉及到 如下问题：
      // **1. 设备管理器：选择设备ID， 默认设备等等** : navigator.mediaDevices.enumerateDevices()
      // **2. 检测摄像头：摄像头获取到的是否是单色，如果是单色就证明没获取成功，界面是全黑或者全白**: 通过canvas获取图片二进制数据，对每一个数据进行比较，如不是完全一致则说明不是全黑或全白
      // **3. 检测麦克风：声音大小** : this.audioInput ====> this.jsAudioNode ====> this.audioContext.destination,在 onaudioprocess 事件里面的event.inputBuffer.getChannelData(0)获取音频数据

      // 1. 设备管理器: 获取到用户的设备，主要通过window.navigator.mediaDevices.enumerateDevices
      class deviceManager {
        constructor() {
          this.deviceNameMap = {
            speaker: '扬声器',
            camera: '摄像头',
            microphone:'麦克风',
          };
        }
        getDevices() {
          return new Promise(resolve => {
            // 用户的所有设备
            let userDevices = {
              speaker: [],
              camera: [],
              microphone: [],
            };
            if (
              !window.navigator.mediaDevices ||
              !window.navigator.mediaDevices.enumerateDevices
            ) {
              resolve(userDevices);
              return;
            }

            // 如果获取设备列表超过3秒还没返回就直接返回空设备对象，让程序直接选用默认设备
            const deviceEnumTimer = setTimeout(() => {
              resolve(userDevices);
            }, 3000);

            window.navigator.mediaDevices.enumerateDevices().then(devicesInfo => {
              clearTimeout(deviceEnumTimer);
              console.log('devicesInfo',devicesInfo);
              devicesInfo.forEach(deviceInfo => {
                const kind2type = {
                  'audioinput': 'microphone',
                  'audiooutput': 'speaker',
                  'videoinput': 'camera'
                }
                const type = kind2type[deviceInfo.kind];
                this.setOneDevice(type, deviceInfo, userDevices);
              });
              resolve(userDevices);
            })
          });
        }
        setOneDevice(type, deviceInfo, userDevices) {
          let label = deviceInfo.label || deviceInfo.devicename;
          let name = label || this.deviceNameMap[type] + (userDevices[type].length + 1)

          let deviceId = deviceInfo.deviceId || deviceInfo.deviceid;
          userDevices[type].push({
            deviceId,
            name,
            groupId: deviceInfo.groupId,
            // 获取不到设备名称便为自定义加的名称
            isCustomName: !label,
          });
        }
      }

      function detect_camera(deviceId) {
        stopCaptureVideo();
        startCaptureVideo(deviceId)
      }
      function detect_microphone(deviceId) {
        stopCaptureAudio();
        startCaptureAudio(deviceId);
      }

      function stopCaptureAudio() {
        if (audioStream) {
          audioStream.getAudioTracks()[0].stop();
          audioStream = null;
          microphoneRecorder.stopRecord();
        }
      }
      // 通过track.stop()停止音视频
      function stopCaptureVideo() {
        if(videoStream) {
          videoStream.getTracks().forEach(track => track.stop());
          videoStream = null;
        }
      }
      // 使用某个特定设备
      function startCaptureVideo(deviceId) {
        let constraints = {
          audio: false,
          video: {
            width: {
              max: 640,
              ideal: 340,
            },
            height: {
              max: 480,
              ideal: 237,
            },
          },
        };
        if(deviceId) {
          constraints.video.deviceId = {
            exact: deviceId
          }
        }
        window.navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => {
            document.getElementById('video').srcObject = stream;
            videoStream = stream;
            document.getElementById('take-photo-btn').addEventListener('click', function() {
              imageCapture(stream)
            });
          })
      }

      function startCaptureAudio(deviceId) {
        let constraints = {
          audio: true
        };
        if(deviceId) {
          constraints.audio.deviceId = {
            exact: deviceId
          }
        }
        window.navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => {
            document.getElementById('microphone-audio').srcObject = stream;
            audioStream = stream;
            microphoneRecorder.listenVolumnChange(stream, volumn => {
              // 获取到音量值时候可以通过图表展示在页面等等
            });
          });
      }

      // 2. 检测摄像头：摄像头获取到的是否是单色，如果是单色就证明没获取成功，界面是全黑或者全白
      function checkImageIsValid(img) {
        const canvas = document.createElement('canvas');
        const width = 100;
        canvas.width = width;
        canvas.height = img.naturalHeight / img.naturalWidth * width;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < imageData.length; i++) {
          if(imageData[i] === imageData[i - 1]) return false;
        }
        return true;
      }
      function imageCapture(stream) {
        const videoTracks = stream.getVideoTracks();
        const captureImg = document.getElementById('capture-img');
        new ImageCapture(videoTracks[0]).takePhoto().then(blob => {
          captureImg.src = URL.createObjectURL(blob);
        });
        // 如果需要检测图片是否是单色则需要调用checkImageIsValid
        captureImg.onload = function() {
          const valid = checkImageIsValid(captureImg);
          console.log('valid===', valid);
        }
      }

      // 3. 检测麦克风：声音大小。要获取声音大小需要得到麦克风获取到的声音数据，用这个数据来得到声音的大小。另外得这些数据之后也可以实现录音功能
      // 录音功能可以看这篇文章： https://juejin.im/post/5b8bf7e3e51d4538c210c6b0 
      class MicorphoneRecorder {
        constructor() {
          // 这些参数可以通过入参获取，这里暂且写死
          this.numberOfAudioChannels = 2;
          this.bufferSize = 4096;
          // audioContext 不能在没有用户操作的时候去创建，所以不能放在constructor里面
          this.audioContext = null;
          this.jsAudioNode = null;
          this.audioInput = null;
        }
        setupAudioContext() {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if(this.audioContext['createScriptProcessor' || 'createJavaScriptNode']) {
            this.jsAudioNode = (this.audioContext['createScriptProcessor' || 'createJavaScriptNode'])(
              this.bufferSize,
              this.numberOfAudioChannels,
              this.numberOfAudioChannels
            );
          } else {
            throw new Error('WebAudio API has no support on this browser.');
          }
        }
        // 监听音量变化
        listenVolumnChange(mediaStream, onVolumnChange) {
          this.setupAudioContext();
          // this.audioInput ====> this.jsAudioNode ====> this.audioContext.destination
          this.jsAudioNode.connect(this.audioContext.destination);
          this.audioInput = this.audioContext.createMediaStreamSource(mediaStream);
          this.audioInput.connect(this.jsAudioNode);
          let time = 1;
          // 通过jsAudioNode.onaudioprocess事件获取音频数据
          this.jsAudioNode.onaudioprocess = event => {
            // onaudioprocess会疯狂触发，为了避免疯console，这里只打印一次
            while(time) {
              console.log('event-onaudioprocess', event);
              time--;
            }
            this.onAudioProcess(event, onVolumnChange);
          }
        }
        // 当前做的操作是通过音频二进制数据检测音量，其实也可以存储这些音频二进制数据，实现录音
        onAudioProcess(audioProcessingEvent, onVolumnChange) {
          var inputBuffer = audioProcessingEvent.inputBuffer;
          // The output buffer contains the samples that will be modified and played
          var outputBuffer = audioProcessingEvent.outputBuffer;

          // 获取左声道和右声道的数据
          for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            // inputData是一个数组，这个数据代表什么呢？它是通过采样采来的，表示声音的强弱，声波被麦克风转换为不同强度的电流信号，这些数字就代表了信号的强弱。它的取值范围是[-1, 1]，表示一个相对比例。
            var inputData = inputBuffer.getChannelData(channel);
            var outputData = outputBuffer.getChannelData(channel);

            // Loop through the 4096 samples
            for (var sample = 0; sample < inputBuffer.length; sample++) {
              // 不给outputBuffer设置内容，扬声器不会播放出声音
              // make output equal to the same as the input
              outputData[sample] = inputData[sample];

              // add noise to each output sample
              // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;         
            }
          }

          // 具体怎样表示一个时刻的音量？这个就看自己怎么处理这些数据了。我现在使用下面的代码处理方式来作为音量的大小，这只是我自己定的一个标准，其实使用平均值，或者最大值都行
          let sum = 0;
          for(let i = 0; i < inputBuffer.length; i++) {
            sum += inputBuffer[i] * inputBuffer[i];
          }
          let volumn = Math.sqrt(sum / inputBuffer.length);
          if (typeof onVolumnChange === 'function') {
            // 稍微提升一下，不然太小
            onVolumnChange(volumn * 3);
          }
        }
        stopRecord() {
          this.audioInput.disconnect();
          this.jsAudioNode.disconnect();
        }
      }



      // 开始调用
      let userDevices = null;
      let videoStream = null;
      let audioStream = null;
      const deviceManage = new deviceManager();
      const microphoneRecorder = new MicorphoneRecorder();
      deviceManage.getDevices().then(_userDevices => {
        userDevices = _userDevices;
        detect_camera(userDevices.camera[0].deviceId);
        detect_microphone(userDevices.microphone[0].deviceId);
      });
    </script>
  </body>
</html>

```

