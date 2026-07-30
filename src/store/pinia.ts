import { createPinia, setActivePinia } from 'pinia'

/**
 * 全应用只使用这一份 Pinia。
 * 提前设为 active，使路由守卫和非组件模块也能安全访问 store。
 */
export const pinia = createPinia()
setActivePinia(pinia)

export default pinia
