<template>
  <div class="tag-list-container">
    <!-- 标签列表头部 -->
    <div class="tag-list-header">
      <span class="tag-title">{{ title }}</span>
      <div v-if="editable" class="header-actions">
        <el-tooltip :content="manageMode ? '完成管理' : '管理标签'" placement="top">
          <el-button
            type="primary"
            link
            size="small"
            :icon="manageMode ? Check : EditPen"
            @click="manageMode = !manageMode"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="tag-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!tags || tags.length === 0 && !inputVisible" class="tag-empty">
      <span>{{ emptyText }}</span>
      <el-button
        class="button-new-tag"
        size="small"
        @click="showInput"
      >
        + New Tag
      </el-button>
    </div>

    <!-- 标签列表 -->
    <div v-else class="tag-list">
      <div
        v-for="tag in tags"
        :key="tag.id || tag"
        class="tag-item-wrapper"
      >
        <el-tag
          :closable="(closable || manageMode) && !isEditing(tag)"
          :disable-transitions="false"
          @close="handleClose(tag)"
          @click="!manageMode && handleClick(tag)"
          class="tag-item"
          :class="{ 'is-editing': isEditing(tag) }"
        >
          {{ tag.name || tag }}
        </el-tag>

        <!-- 编辑按钮 -->
        <el-button
          v-if="manageMode && !isEditing(tag)"
          type="primary"
          link
          size="small"
          :icon="EditPen"
          @click="startEdit(tag)"
          class="edit-btn"
        />

        <!-- 编辑输入框 -->
        <el-input
          v-if="manageMode && isEditing(tag)"
          ref="editInputRef"
          v-model="editingName"
          class="tag-edit-input"
          size="small"
          @keyup.enter="confirmEdit"
          @blur="confirmEdit"
        />
      </div>

      <!-- 添加标签输入框 -->
      <el-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        class="tag-input"
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />

      <!-- 新标签按钮 -->
      <el-button
        v-else
        class="button-new-tag"
        size="small"
        @click="showInput"
      >
        + New Tag
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Loading, EditPen, Check } from '@element-plus/icons-vue'

const props = defineProps({
  tags: Array,
  title: {
    type: String,
    default: 'Tags'
  },
  emptyText: {
    type: String,
    default: '暂无标签'
  },
  closable: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'create', 'delete', 'edit'])

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref()

const manageMode = ref(false)
const editingTag = ref(null)
const editingName = ref('')
const editInputRef = ref()

const isEditing = (tag) => {
  return editingTag.value && editingTag.value.id === tag.id
}

const startEdit = (tag) => {
  editingTag.value = tag
  editingName.value = tag.name || ''
  nextTick(() => {
    editInputRef.value?.input?.focus()
  })
}

const confirmEdit = () => {
  if (editingTag.value && editingName.value && editingName.value !== editingTag.value.name) {
    emit('edit', { tag: editingTag.value, newName: editingName.value })
  }
  editingTag.value = null
  editingName.value = ''
}

const handleClose = (tag) => {
  emit('delete', tag)
}

const handleClick = (tag) => {
  emit('click', tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value?.input?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    emit('create', inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<style scoped>
.tag-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 16px;
  margin-bottom: 16px;
  min-height: 0;
}

.tag-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.tag-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tag-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 13px;
  gap: 12px;
}

.tag-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  overflow-y: auto;
  padding-right: 4px;
}

.tag-item-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  padding: 2px !important;
  height: auto !important;
}

.tag-edit-input {
  width: 100px;
  max-width: 120px;
}

.button-new-tag {
  height: 24px;
  padding: 0 8px;
  line-height: 22px;
  font-size: 12px;
}

.tag-input {
  width: 100px;
  max-width: 120px;
}

/* 滚动条样式 */
.tag-list::-webkit-scrollbar {
  width: 4px;
}

.tag-list::-webkit-scrollbar-track {
  background: transparent;
}

.tag-list::-webkit-scrollbar-thumb {
  background: var(--component-scroll-thumb);
  border-radius: 2px;
}

.tag-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
