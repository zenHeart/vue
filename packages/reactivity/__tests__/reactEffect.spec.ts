import { ReactiveEffect, reactive } from '../src/index'
import { describe, expect, test, vi } from 'vitest'

/**
 * 
 export class ReactiveEffect<T = any> {
  deps?: Link; // 当前 effect 所依赖的响应式数据的链表头
  depsTail?: Link; // 当前 effect 所依赖的响应式数据的链表尾
  flags: EffectFlags; // 标志位，用于标记 effect 的状态（如是否活跃、是否脏等）
  next?: Subscriber; // 链表中的下一个订阅者，用于批量更新
  cleanup?: () => void; // 清理函数，在 effect 停止或重新运行前调用
  scheduler?: EffectScheduler; // 调度器函数，用于自定义 effect 的触发时机
  onStop?: () => void; // effect 停止时的回调函数
  onTrack?: (event: DebuggerEvent) => void; // 调试时的依赖追踪回调
  onTrigger?: (event: DebuggerEvent) => void; // 调试时的触发回调
  constructor(public fn: () => T) { ... } // 构造函数，接收一个副作用函数
}
 */
describe('reactivity/ReactiveEffect', () => {
  test('basic usage', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })

    reactiveEffect.run()
    expect(dummy).toBe(0)

    obj.count++
    reactiveEffect.run()
    expect(dummy).toBe(1)
  })

  test('scheduler option', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined
    const scheduler = vi.fn(() => {
      dummy = obj.count * 2
    })

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })
    reactiveEffect.scheduler = scheduler

    reactiveEffect.run()
    expect(dummy).toBe(0)

    obj.count++
    reactiveEffect.scheduler!()
    expect(dummy).toBe(2)
  })

  test('onStop callback', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined
    const onStop = vi.fn()

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })
    reactiveEffect.onStop = onStop

    reactiveEffect.run()
    expect(dummy).toBe(0)

    reactiveEffect.stop()
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  test('manual dependency tracking', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })

    reactiveEffect.run()
    expect(dummy).toBe(0)

    obj.count++
    reactiveEffect.run()
    expect(dummy).toBe(1)
  })

  test('pause and resume tracking', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })

    reactiveEffect.run()
    expect(dummy).toBe(0)

    reactiveEffect.pause()
    obj.count++
    expect(dummy).toBe(0) // Ensure dummy is not updated during pause
    reactiveEffect.run()
    expect(dummy).toBe(1)

    reactiveEffect.resume()
    reactiveEffect.run()
    expect(dummy).toBe(1)
  })

  test('debugger hooks', () => {
    const obj = reactive({ count: 0 })
    let dummy: number | undefined
    const onTrack = vi.fn()
    const onTrigger = vi.fn()

    const reactiveEffect = new ReactiveEffect(() => {
      dummy = obj.count
    })
    reactiveEffect.onTrack = onTrack
    reactiveEffect.onTrigger = onTrigger

    reactiveEffect.run()
    expect(dummy).toBe(0)
    expect(onTrack).toHaveBeenCalled()

    obj.count++
    reactiveEffect.run()
    expect(dummy).toBe(1)
    expect(onTrigger).toHaveBeenCalled()
  })
})
