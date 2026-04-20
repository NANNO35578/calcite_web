<template>
  <router-view />
</template>

<script setup>
// 主应用组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Everforest 深色模式 - Element Plus 主题覆盖 */
:root {
  --el-color-primary: #7fbbb3;
  --el-color-primary-light-3: #a7c080;
  --el-color-primary-light-5: #83c092;
  --el-color-primary-light-7: #a7c080;
  --el-color-primary-light-8: #d3c6aa;
  --el-color-primary-light-9: #e69875;
  --el-color-primary-dark-2: #5c6a72;
  
  --el-bg-color: #272e33;
  --el-bg-color-page: #272e33;
  --el-text-color-primary: #d3c6aa;
  --el-text-color-regular: #d3c6aa;
  --el-text-color-secondary: #a7c080;
  --el-border-color: #7a8478;
  --el-border-color-light: #414b50;
  --el-fill-color: #414b50;
  --el-fill-color-light: #2d353b;
  --el-fill-color-lighter: #3d484d;
  --el-fill-color-extra-light: #414b50;
  --el-fill-color-dark: #2d353b;
  --el-fill-color-darker: #272e33;
  --el-fill-color-blank: transparent;
  
  --el-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  --el-box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  --el-box-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 浅色模式 - 手动切换 */
:root[data-theme="light"] {
  --el-color-primary: #7fbbb3;
  --el-color-primary-light-3: #a7c080;
  --el-color-primary-light-5: #83c092;
  --el-color-primary-light-7: #a7c080;
  --el-color-primary-light-8: #d3c6aa;
  --el-color-primary-light-9: #e69875;
  --el-color-primary-dark-2: #5c6a72;
  
  --el-bg-color: #fdf6e3;
  --el-bg-color-page: #fdf6e3;
  --el-text-color-primary: #5c6a72;
  --el-text-color-regular: #5c6a72;
  --el-text-color-secondary: #7fbbb3;
  --el-border-color: #bdc3af;
  --el-border-color-light: #f4f0d9;
  --el-fill-color: #f4f0d9;
  --el-fill-color-light: #fdf6e3;
  --el-fill-color-lighter: #fdf6e3;
  --el-fill-color-extra-light: #fdf6e3;
  --el-fill-color-dark: #eae4ca;
  --el-fill-color-darker: #d3c6aa;
  --el-fill-color-blank: transparent;
  
  --el-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --el-box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  --el-box-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
