import { App } from 'vue';
import pullRefresh from './pullRefresh';

// 指令集合
const directives = {
  pullRefresh
};

// 批量注册指令
export function registerDirectives(app: App) {
  Object.keys(directives).forEach(key => {
    app.directive(key, directives[key as keyof typeof directives]);
  });
}

export default directives;