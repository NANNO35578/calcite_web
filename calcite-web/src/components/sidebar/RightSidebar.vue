<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 - 切换面板 -->
    <RightToolbar v-model:active-panel="activePanel" />

    <!-- 文件列表面板 -->
    <div v-show="activePanel === 'files'" class="panel-container">
      <FileList
        :all-files="allFiles"
        :note-id="editingNote?.id"
        :loading="filesLoading"
        @delete="$emit('file-delete', $event)"
        @refresh="$emit('file-refresh')"
      />
    </div>

    <!-- 笔记管理面板 -->
    <div v-show="activePanel === 'note'" class="panel-container">
      <div v-if="!editingNote" class="empty-note">
        <span>未选择笔记</span>
      </div>
      <div v-else class="note-info-panel">
        <!-- Header -->
        <div class="note-info-header">
          <span class="note-title">{{ editingNote.title || '无标题' }}</span>
        </div>

        <!-- 笔记基础信息 -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">公开</span>
            <el-switch
              :model-value="editingNote.is_public"
              @update:model-value="handlePublicChange"
            />
          </div>
          <div class="info-row">
            <span class="info-label">摘要</span>
            <el-input
              :model-value="editingNote.summary"
              @update:model-value="handleSummaryChange"
              type="textarea"
              :rows="3"
              placeholder="暂无摘要"
              size="small"
            />
          </div>
        </div>

        <!-- 文件夹管理 -->
        <div class="info-section">
          <div class="section-title">所属文件夹</div>
          <el-tree-select
            :model-value="editingNote.folder_id"
            @update:model-value="handleFolderChange"
            :data="folderTreeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            placeholder="选择文件夹"
            size="small"
            class="folder-tree-select"
          />
        </div>

        <!-- 时间信息 -->
        <div class="info-section">
          <div class="section-title">时间</div>
          <div class="info-row">
            <span class="info-label">创建</span>
            <span class="info-value">{{ formatTime(editingNote.created_at) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">更新</span>
            <span class="info-value">{{ formatTime(editingNote.updated_at) }}</span>
          </div>
        </div>

        <!-- 标签展示（只读） -->
        <div class="info-section">
          <div class="section-title">
            <span>标签</span>
            <el-button
              type="primary"
              link
              size="small"
              :icon="Refresh"
              :loading="tagsLoading"
              @click="handleRefreshTags"
            >
              AI生成
            </el-button>
          </div>
          <div v-if="tagsLoading" class="tags-loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
          </div>
          <div v-else-if="noteTags.length === 0" class="tags-empty">
            暂无标签
          </div>
          <div v-else class="tags-list">
            <el-tag
              v-for="tag in noteTags"
              :key="tag.id"
              size="small"
              class="tag-item"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </div>

        <!-- 删除功能 -->
        <div class="info-section danger-section">
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            @click="$emit('delete-note')"
          >
            删除笔记
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { InfoFilled, Refresh, Delete, Loading } from '@element-plus/icons-vue'
import RightToolbar from './RightToolbar.vue'
import FileList from './FileList.vue'
import { getNoteTags, generateNoteTagsAI } from '../../api/note'
import { ElMessage } from 'element-plus'

const props = defineProps({
  editingNote: Object,
  allFiles: {
    type: Array,
    default: () => []
  },
  filesLoading: {
    type: Boolean,
    default: false
  },
  allFolders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'note-field-change',
  'delete-note',
  'file-delete',
  'file-refresh'
])

// 当前激活的面板: 'files' 或 'note'
const activePanel = ref('note')

// 标签相关
const noteTags = ref([])
const tagsLoading = ref(false)

// 将扁平文件夹列表转为树形结构
const folderTreeData = computed(() => {
  const list = props.allFolders || []
  const map = new Map()
  const roots = []

  list.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  map.forEach(item => {
    if (item.parent_id && item.parent_id !== 0) {
      const parent = map.get(item.parent_id)
      if (parent) {
        parent.children.push(item)
      } else {
        roots.push(item)
      }
    } else {
      roots.push(item)
    }
  })

  return roots
})

// 监听当前编辑笔记变化，加载标签
watch(() => props.editingNote?.id, (newId) => {
  if (newId) {
    fetchNoteTags(newId)
  } else {
    noteTags.value = []
  }
}, { immediate: true })

const fetchNoteTags = async (noteId) => {
  tagsLoading.value = true
  try {
    const data = await getNoteTags(noteId)
    noteTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取笔记标签失败:', error)
    noteTags.value = []
  } finally {
    tagsLoading.value = false
  }
}

const handleRefreshTags = async () => {
  if (!props.editingNote?.id) return
  tagsLoading.value = true
  try {
    const data = await generateNoteTagsAI(props.editingNote.id)
    noteTags.value = Array.isArray(data) ? data : []
    ElMessage.success('标签生成成功')
  } catch (error) {
    console.error('AI生成标签失败:', error)
    ElMessage.error('标签生成失败')
  } finally {
    tagsLoading.value = false
  }
}

const handlePublicChange = (val) => {
  emit('note-field-change', { is_public: val })
}

const handleSummaryChange = (val) => {
  emit('note-field-change', { summary: val })
}

const handleFolderChange = (val) => {
  emit('note-field-change', { folder_id: val || 0 })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.sidebar-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-note {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
}

.note-info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 12px 16px;
  gap: 16px;
}

.note-info-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-primary);
}

.note-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 40px;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
}

.folder-tree-select {
  width: 100%;
}

.tags-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tags-empty {
  font-size: 13px;
  color: var(--text-muted);
  padding: 8px 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  transition: all 0.2s;
}

.danger-section {
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

/* 滚动条样式 */
.note-info-panel::-webkit-scrollbar {
  width: 4px;
}

.note-info-panel::-webkit-scrollbar-track {
  background: transparent;
}

.note-info-panel::-webkit-scrollbar-thumb {
  background: var(--component-scroll-thumb);
  border-radius: 2px;
}

.note-info-panel::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
