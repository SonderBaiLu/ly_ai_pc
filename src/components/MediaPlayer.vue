<template>
  <div class="media-player" :style="{ width: width, height: height }">
    <div class="media-container" @click="handleMedia">
      <!-- 只有在有视频源时才渲染视频组件 -->
      <template v-if="hasVideoSrc">
        <video
          ref="videoElement"
          class="video"
          :class="{ 'minimal-controls': minimalControls }"
          :src="src"
          :autoplay="autoplay"
          :loop="loop"
          :muted="muted"
          playsinline
          webkit-playsinline
          x5-playsinline
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          :controls="controls"
          :controlslist="controlsList"
          :disablePictureInPicture="disablePictureInPicture"
          :disableRemotePlayback="disableRemotePlayback"
          preload="auto"
          :style="{ objectFit: objectFit, borderRadius: borderRadius }"
          ms-playsinline="true"
          draggable="false"
          @play="onPlay"
          @pause="onPause"
          @ended="onEnded"
          @loadedmetadata="onLoadedMetadata"
          @canplay="onCanPlay"
          @error="onError"
          @loadstart="onLoadStart"
          @contextmenu.prevent
        ></video>

        <!-- 播放提示 - 暂停或自动播放失败时显示（需要用户交互，可配置开关） -->
        <div
          v-if="
            showPlayHint &&
            (videoState === 'paused' || videoState === 'autoplay-failed') &&
            !controls
          "
          class="play-hint"
        >
          <div class="play-hint-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <!-- 封面 - 自动播放失败或视频错误时显示 -->
        <LazyImage
          v-if="showPoster"
          class="poster"
          :src="poster"
          alt="poster"
          width="100%"
          height="100%"
          :object-fit="posterFit"
          :border-radius="borderRadius"
          :lazy="false"
        />
      </template>

      <!-- 没有视频源时，只显示封面图 -->
      <template v-else>
        <LazyImage
          v-if="poster"
          class="poster-only"
          :src="poster"
          alt="poster"
          width="100%"
          height="100%"
          :object-fit="posterFit"
          :border-radius="borderRadius"
        />
        <!-- 没有视频源也没有封面时的占位符 -->
        <div v-else class="placeholder">
          <span class="placeholder-text">暂无内容</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义emits
const emit = defineEmits(['play', 'pause', 'ended', 'error', 'canplay'])

// 定义props
interface Props {
  src?: string // 视频地址
  poster?: string // 封面图 / 图片
  autoplay?: boolean // 是否自动播放
  loop?: boolean // 是否循环播放
  muted?: boolean // 是否静音
  controls?: boolean // 是否显示控制条
  minimalControls?: boolean // 是否精简控制栏（只保留全屏按钮等）
  disablePictureInPicture?: boolean // 是否禁用画中画（Edge/Chrome 的 PiP 小按钮）
  disableRemotePlayback?: boolean // 是否禁用远程播放（投屏等）
  controlsList?: string // controlslist 透传
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' // 视频填充模式
  posterFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' // 封面图填充模式
  width?: string // 宽度
  height?: string // 高度
  imageOnly?: boolean // 是否强制只显示图片模式（即使有视频源也不显示视频）
  showPlayHint?: boolean // 是否显示播放提示按钮（自动播放失败/暂停时）
  borderRadius?: number // 圆角大小
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  poster: '',
  autoplay: true,
  loop: true, // 循环播放可避免Android微信播放完毕显示广告
  muted: false,
  controls: false,
  minimalControls: false,
  // 默认禁用 PiP，避免 Edge/Chrome 右下角画中画按钮影响美观
  disablePictureInPicture: true,
  // 默认禁用远程播放按钮（部分浏览器会展示投屏入口）
  disableRemotePlayback: true,
  // 默认禁用下载；并禁用远程播放入口
  controlsList: '',
  objectFit: 'cover', // 默认覆盖填充
  posterFit: 'cover', // 默认覆盖填充
  width: '100%',
  height: '100%',
  imageOnly: false,
  showPlayHint: true,
  borderRadius: 0,
})

const controlsList = computed(() => {
  // 优先使用外部传入
  if (props.controlsList) return props.controlsList
  // 统一禁用下载/远程播放（减少浏览器自带按钮干扰）
  return props.minimalControls ? 'nodownload noremoteplayback' : 'nodownload noremoteplayback'
})

// 计算属性：是否有视频源
const hasVideoSrc = computed(() => {
  return !props.imageOnly && props.src && props.src.trim() !== ''
})

// 视频状态管理
const videoState = ref<'loading' | 'playing' | 'paused' | 'error' | 'autoplay-failed'>('loading')
const hasPlayed = ref(false) // 是否已经播放过
const autoplayTimer = ref<number | null>(null) // 自动播放检测定时器
const isVideoReady = ref(false) // 视频是否准备就绪

const videoElement = ref<HTMLVideoElement | null>(null) // 视频元素引用

// 暴露给父组件的方法
const play = () => {
  if (videoElement.value && hasVideoSrc.value) {
    // 为了符合浏览器自动播放策略，先确保视频是静音的
    // 用户可以通过控制条取消静音
    if (!videoElement.value.muted && !hasPlayed.value) {
      videoElement.value.muted = true
      console.log('[MediaPlayer.play] 设置为静音以允许自动播放')
    }

    console.log('[MediaPlayer.play] 准备播放视频:', {
      src: props.src,
      muted: videoElement.value.muted,
      volume: videoElement.value.volume,
      readyState: videoElement.value.readyState,
    })

    const playPromise = videoElement.value.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          videoState.value = 'playing'
          hasPlayed.value = true
          console.log('[MediaPlayer.play] ✅ 播放成功')
        })
        .catch((error) => {
          console.error('[MediaPlayer.play] ❌ 播放失败:', error.name, error.message)
          videoState.value = 'paused'

          // 如果是 NotAllowedError，尝试静音后再次播放
          if (error.name === 'NotAllowedError' && videoElement.value && !videoElement.value.muted) {
            console.log('[MediaPlayer.play] 尝试静音后播放')
            videoElement.value.muted = true
            videoElement.value.play().catch((retryError) => {
              console.error('[MediaPlayer.play] 静音播放也失败:', retryError)
            })
          }
        })
    }
  } else {
    console.warn('[MediaPlayer.play] 无法播放:', {
      hasVideoElement: !!videoElement.value,
      hasVideoSrc: hasVideoSrc.value,
    })
  }
}

const pause = () => {
  if (videoElement.value && hasVideoSrc.value) {
    videoElement.value.pause()
    videoState.value = 'paused'
  }
}

// 检查视频是否正在播放
const isPlaying = () => {
  return videoState.value === 'playing'
}

// 计算属性：是否显示封面（自动播放失败或视频加载错误时显示）
const showPoster = computed(() => {
  // 有视频源且（自动播放失败或视频加载错误）时显示封面
  return (
    hasVideoSrc.value &&
    (videoState.value === 'autoplay-failed' || videoState.value === 'error') &&
    !!props.poster
  )
})

// 检测浏览器兼容性
const isIE = () => {
  return /MSIE|Trident/.test(navigator.userAgent)
}

const isOldEdge = () => {
  return /Edge\/\d+/.test(navigator.userAgent)
}

// 组件挂载后初始化
onMounted(() => {
  // 设置初始音量
  if (videoElement.value) {
    videoElement.value.volume = 1.0
    console.log('MediaPlayer mounted, 音量:', videoElement.value.volume)
  }

  // 初次挂载时根据当前 src 做一次初始化/自动播放尝试
  initOrAutoplayBySrc()
})

// KeepAlive 场景下，被重新激活时再尝试自动播放
onActivated(() => {
  console.log('[MediaPlayer] onActivated')
  // 已有视频源、开启 autoplay 且当前不在播放时，尝试自动播放
  if (hasVideoSrc.value && props.autoplay && !isPlaying()) {
    attemptAutoplay()
  }
})

// 封装：根据当前 src 做初始化/自动播放
const initOrAutoplayBySrc = () => {
  // 如果有视频源，进行初始化
  if (hasVideoSrc.value) {
    // IE和旧版Edge不支持自动播放，直接显示封面
    if (isIE() || isOldEdge()) {
      console.log('检测到IE/旧版Edge，禁用自动播放')
      videoState.value = 'autoplay-failed'
    } else if (props.autoplay) {
      console.log('MediaPlayer 启用自动播放模式')
      // 稍微延迟确保DOM完全加载
      setTimeout(() => {
        attemptAutoplay()
      }, 100)
    } else {
      console.log('MediaPlayer 等待外部控制播放')
    }
  }
}

// 监听视频源变化：切换到新视频时重置状态并按需自动播放
watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (newSrc === oldSrc) return
    console.log('[MediaPlayer] 视频源变化:', { oldSrc, newSrc })

    // 重置状态，避免沿用上一个视频的播放状态
    videoState.value = 'loading'
    hasPlayed.value = false
    isVideoReady.value = false

    // 如果当前已经有 video 元素，重置时间轴
    if (videoElement.value) {
      try {
        videoElement.value.currentTime = 0
      } catch (e) {
        console.warn('[MediaPlayer] 重置 currentTime 失败:', e)
      }
    }

    // 根据新的 src 再做一次初始化/自动播放判断
    initOrAutoplayBySrc()
  }
)

// 尝试自动播放（主动调用play方法）
const attemptAutoplay = () => {
  if (!videoElement.value) {
    console.log('视频元素尚未准备好')
    // 启动后备检测定时器
    checkAutoplay()
    return
  }

  console.log('尝试自动播放视频...')
  const playPromise = videoElement.value.play()

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('自动播放成功')
        videoState.value = 'playing'
        hasPlayed.value = true
      })
      .catch((error) => {
        console.log('自动播放被阻止:', error.name, error.message)
        // 自动播放失败，显示封面和播放提示
        videoState.value = 'autoplay-failed'

        // 如果是因为没有用户交互，提示用户点击播放
        if (error.name === 'NotAllowedError') {
          console.log('需要用户交互才能播放')
        }
      })
  } else {
    // 旧浏览器，启动后备检测定时器
    checkAutoplay()
  }
}

// 组件卸载前停止视频播放
onBeforeUnmount(() => {
  // 只有在有视频源时才停止视频播放
  if (hasVideoSrc.value) {
    stopVideoPlayback()
  }
})

// 组件卸载时清理定时器和停止视频播放
onUnmounted(() => {
  // 清理定时器
  if (autoplayTimer.value) {
    clearTimeout(autoplayTimer.value)
    autoplayTimer.value = null
  }

  console.log('MediaPlayer组件已卸载')
})

// 检查自动播放是否成功
const checkAutoplay = () => {
  // 设置1秒超时检测（减少等待时间）
  autoplayTimer.value = window.setTimeout(() => {
    if (videoState.value === 'loading' && !hasPlayed.value) {
      // 自动播放失败，显示封面
      videoState.value = 'autoplay-failed'
      console.log('自动播放失败，显示封面')
    }
  }, 1000)
}

// 视频开始加载
const onLoadStart = () => {
  console.log('视频开始加载:', {
    src: props.src,
    currentTime: new Date().toISOString(),
  })
  videoState.value = 'loading'
  isVideoReady.value = false
}

// 视频可以播放事件
const onCanPlay = () => {
  isVideoReady.value = true

  // 通知父组件：视频已具备真实宽高（videoWidth/videoHeight）
  if (videoElement.value) {
    emit('canplay', {
      videoWidth: videoElement.value.videoWidth,
      videoHeight: videoElement.value.videoHeight,
    })
  }

  // 确保音量设置正确
  if (videoElement.value) {
    if (!props.muted) {
      videoElement.value.volume = 1.0
      console.log('设置视频音量为:', videoElement.value.volume)
    }
  }

  // 清除自动播放检测定时器
  if (autoplayTimer.value) {
    clearTimeout(autoplayTimer.value)
    autoplayTimer.value = null
  }

  // 如果设置了autoplay，尝试播放
  if (videoState.value === 'loading') {
    if (props.autoplay) {
      // autoplay模式，等待HTML5 autoplay生效
      console.log('视频已准备，等待autoplay')
    } else {
      // 非autoplay模式，设置为暂停
      videoState.value = 'paused'
      console.log('视频已准备，等待外部播放指令')
    }
  }
}

// 元数据加载完成：此时 videoWidth/videoHeight 通常已经可用（比 canplay 更早）
const onLoadedMetadata = () => {
  if (videoElement.value) {
    emit('canplay', {
      videoWidth: videoElement.value.videoWidth,
      videoHeight: videoElement.value.videoHeight,
    })
  }
}

// 视频播放事件
const onPlay = () => {
  console.log('视频开始播放')
  videoState.value = 'playing'
  hasPlayed.value = true
  // 清除自动播放检测定时器
  if (autoplayTimer.value) {
    clearTimeout(autoplayTimer.value)
    autoplayTimer.value = null
  }
  emit('play')
}

// 视频暂停事件
const onPause = () => {
  console.log('视频暂停')
  videoState.value = 'paused'
  emit('pause')
}

// 视频结束事件
const onEnded = () => {
  console.log('视频播放结束')
  videoState.value = 'paused'
  emit('ended')
}

// 视频错误事件
const onError = (e: Event) => {
  const videoEl = e.target as HTMLVideoElement
  const error = videoEl.error

  // 详细的错误信息
  let errorMessage = '视频播放错误'
  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = '视频加载被中止'
        break
      case error.MEDIA_ERR_NETWORK:
        errorMessage = '网络错误，无法加载视频'
        break
      case error.MEDIA_ERR_DECODE:
        errorMessage = '视频解码失败'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = '视频格式不支持或视频地址无效'
        break
      default:
        errorMessage = `未知错误 (code: ${error.code})`
    }
  }

  console.error('MediaPlayer 错误:', {
    message: errorMessage,
    originalSrc: props.src,
    errorCode: error?.code,
    errorMessage: error?.message,
    event: e,
  })

  // 视频加载失败，设置为错误状态，会自动显示封面
  videoState.value = 'error'
  emit('error', e)
}

// 停止视频播放
const stopVideoPlayback = () => {
  try {
    if (videoElement.value) {
      videoElement.value.pause()
      videoElement.value.currentTime = 0
    }
    // 更新状态
    videoState.value = 'paused'
    hasPlayed.value = false
  } catch (error) {
    console.error('停止视频播放失败:', error)
  }
}

// 点击媒体切换播放和暂停
const handleMedia = (e: MouseEvent) => {
  console.log('点击媒体区域', e)

  // 如果没有视频源，不执行任何操作
  if (!hasVideoSrc.value) {
    console.log('没有视频源，仅显示图片')
    return
  }

  // 如果点击的是video元素本身（包括控制条），不拦截事件
  const target = e.target as HTMLElement
  if (target.tagName === 'VIDEO') {
    console.log('点击了video元素或控制条，不拦截')
    return
  }

  // 如果显示了控制条，不在这里处理播放暂停（让原生控制条处理）
  if (props.controls) {
    console.log('已启用控制条，由原生控制条处理播放暂停')
    return
  }

  // 切换播放状态并通知父组件
  if (videoState.value === 'playing') {
    // 当前正在播放，点击暂停
    pause()
    emit('pause')
  } else {
    // 当前未播放，点击播放（通知父组件处理单视频逻辑）
    play()
    emit('play')
  }
}

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  stop: stopVideoPlayback,
  isPlaying,
  videoState,
  videoElement,
})
</script>

<style lang="scss" scoped>
.media-player {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .media-container {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden; // 确保圆角生效
    border-radius: inherit; // 继承父元素的圆角
  }

  // 播放提示层
  .play-hint {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    animation: pulse 2s ease-in-out infinite;

    .play-hint-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      transition: all 0.3s ease;

      svg {
        width: 20px;
        height: 20px;
        color: #fff;
        margin-left: 3px; // 视觉居中
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.05);
    }
  }

  // 封面图（视频模式下的封面）
  .poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit; // 继承父元素的圆角
    z-index: 7;
    pointer-events: none;

    :deep(.lazy-image-wrapper),
    :deep(.lazy-image) {
      width: 100%;
      height: 100%;
    }
  }

  // 纯图片模式的封面（没有视频源时）
  .poster-only {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit; // 继承父元素的圆角
    z-index: 8;

    :deep(.lazy-image-wrapper),
    :deep(.lazy-image) {
      width: 100%;
      height: 100%;
    }
  }

  // 占位符（没有视频源也没有封面时）
  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: inherit; // 继承父元素的圆角
    z-index: 8;

    .placeholder-text {
      color: #999999;
      font-size: 14px;
    }
  }

  // 视频 (默认非全屏播放)
  .video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit; // 继承父元素的圆角
    z-index: 8;
  }

  // 精简控制栏样式：隐藏静音按钮和更多选项（画中画按钮），保留其他控件
  .video.minimal-controls {
    // WebKit 内核浏览器（Chrome / Edge / Safari 等）
    // 隐藏静音按钮
    &::-webkit-media-controls-mute-button,
    &::-webkit-media-controls-volume-slider,
    &::-webkit-media-controls-volume-control-container {
      display: none !important;
    }
  }
}
</style>
