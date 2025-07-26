// 文件路径: src/types/artplayer.d.ts

// 这一行是可选的，但有助于增强类型提示的稳定性
import 'artplayer';

declare module 'artplayer' {
  // 在这里我们重新打开 artplayer 的模块声明
  // 并对其中的 Events 接口进行扩展
  interface Events {
    // 添加我们需要的触摸事件类型
    touchstart: [event: TouchEvent];
    touchmove: [event: TouchEvent];
    touchend: [event: TouchEvent];
  }
}