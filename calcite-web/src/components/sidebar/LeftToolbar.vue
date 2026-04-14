<template>
  <div class="sidebar-toolbar">
    <el-tooltip content="新建笔记" placement="bottom">
      <el-button
        type="success"
        size="small"
        :icon="DocumentAdd"
        @click="$emit('create-note')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
    <el-tooltip content="新建文件夹" placement="bottom">
      <el-button
        type="primary"
        size="small"
        :icon="FolderAdd"
        @click="$emit('create-folder')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
    <el-tooltip content="OCR识别生成笔记" placement="bottom">
      <el-button
        type="warning"
        size="small"
        :icon="Picture"
        @click="triggerFileSelect"
        class="icon-btn"
        circle
      />
    </el-tooltip>
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      accept=".jpg,.jpeg,.png,.bmp,.webp,.pdf"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DocumentAdd, FolderAdd, Picture } from '@element-plus/icons-vue'

const emit = defineEmits(['create-note', 'create-folder', 'ocr-upload'])

const fileInput = ref(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  emit('ocr-upload', file)
  // 重置 input，允许再次选择同一文件
  e.target.value = ''
}
</script>

<style scoped>
.sidebar-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 12px;
  height: 40px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}
</style>
