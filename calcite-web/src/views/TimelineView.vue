<template>
  <div class="timeline-container">
    <!-- 顶部标题栏 -->
    <div class="timeline-header">
      <h1 class="timeline-title">时间轴</h1>
      <el-button size="small" :icon="ArrowLeft" @click="router.push('/home')">
        返回首页
      </el-button>
    </div>

    <!-- 时间轴主体 -->
    <div class="timeline-body">
      <div
        v-for="group in timelineGroups"
        :key="group.date"
        class="timeline-group"
      >
        <!-- 左侧：日期 -->
        <div class="timeline-date-label">{{ group.date }}</div>

        <!-- 中间：节点 + 竖线 -->
        <div class="timeline-node">
          <div class="timeline-line"></div>
          <div class="node-dot"></div>
        </div>

        <!-- 右侧：内容卡片 -->
        <div class="timeline-cards">
          <div
            v-for="note in group.notes"
            :key="note.id"
            class="timeline-card"
            @click="handleNoteClick(note)"
          >
            <div class="card-header">
              <span class="card-title">{{ note.title || '无标题' }}</span>
              <span class="card-time">{{ formatTime(note.created_at) }}</span>
            </div>
            <div class="card-summary">{{ note.summary || '暂无摘要' }}</div>
            <div class="card-footer">
              <el-tag size="small" class="card-tag">
                {{ getFolderName(note.folder_id) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-if="timelineGroups.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Timer /></el-icon>
        <div class="empty-text">暂无时间轴数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Timer } from '@element-plus/icons-vue'
import { useNoteStore, useFolderStore } from '../stores'

const router = useRouter()
const noteStore = useNoteStore()
const folderStore = useFolderStore()

// ===== 时间轴数据 =====
const timelineGroups = computed(() => {
  const notes = noteStore.allNotes.length > 0
    ? [...noteStore.allNotes]
    : getMockNotes()

  const sorted = notes
    .filter(n => n.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const groups = {}
  sorted.forEach(note => {
    const date = new Date(note.created_at)
    const key = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
    if (!groups[key]) groups[key] = []
    groups[key].push(note)
  })

  return Object.entries(groups).map(([date, notes]) => ({
    date,
    notes: notes.slice(0, 3) // 每天最多展示 3 条
  })).slice(0, 10) // 最多展示 10 天
})

function getMockNotes () {
  const now = Date.now()
  return [
    { id: 201, title: 'Calcite 项目架构设计', summary: '梳理了后端 Drogon、前端 Vue 3、Android Kotlin 的三端架构...', created_at: new Date(now - 86400000).toISOString(), folder_id: 1 },
    { id: 202, title: 'Elasticsearch 索引优化笔记', summary: '记录了 IK 分词器的配置过程和 ES 同步策略...', created_at: new Date(now - 86400000).toISOString(), folder_id: 2 },
    { id: 203, title: 'MinIO 对象存储接入方案', summary: 'Docker 部署 MinIO，创建公开 bucket，封装 MinioClient...', created_at: new Date(now - 172800000).toISOString(), folder_id: 1 },
    { id: 204, title: 'Vue 3 Composition API 实践', summary: '总结了 script setup 语法、Pinia Store 设计模式...', created_at: new Date(now - 259200000).toISOString(), folder_id: 2 },
    { id: 205, title: 'Android Room 数据库设计', summary: 'Entity、Dao、Database 三层设计，配合 WorkManager 同步...', created_at: new Date(now - 345600000).toISOString(), folder_id: 3 },
    { id: 206, title: 'JWT 认证流程整理', summary: '登录时下发 token，前端 Axios 拦截器注入，401 清除凭证...', created_at: new Date(now - 432000000).toISOString(), folder_id: 1 },
    { id: 207, title: 'Markdown 渲染方案对比', summary: 'Web 端使用 md-editor-v3，Android 端使用 Markwon...', created_at: new Date(now - 518400000).toISOString(), folder_id: 2 }
  ]
}

const getFolderName = (folderId) => {
  if (!folderId) return '未分类'
  const folder = folderStore.allFolders.find(f => f.id === folderId)
  return folder?.name || '未分类'
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const handleNoteClick = (note) => {
  router.push('/home')
  setTimeout(() => {
    noteStore.openEditor(note)
  }, 100)
}

onMounted(async () => {
  if (noteStore.allNotes.length === 0) {
    await noteStore.fetchRootNotes()
  }
  if (folderStore.allFolders.length === 0) {
    await folderStore.fetchRootFolders()
  }
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 24px;
  box-sizing: border-box;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.timeline-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 时间轴主体 */
.timeline-body {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 时间轴分组：三列布局 */
.timeline-group {
  display: grid;
  grid-template-columns: 120px 40px 1fr;
  align-items: start;
  gap: 16px;
}

/* 左侧：日期标签 */
.timeline-date-label {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding-top: 12px;
  white-space: nowrap;
}

/* 中间：节点 + 竖线 */
.timeline-node {
  position: relative;
  display: flex;
  justify-content: center;
  height: 100%;
  min-height: 40px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--accent-primary) 0%,
    var(--border-primary) 100%
  );
}

.node-dot {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  border: 3px solid var(--bg-primary);
  box-shadow: 0 0 0 2px var(--accent-primary);
  margin-top: 12px;
  flex-shrink: 0;
}

/* 右侧：卡片列表 */
.timeline-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.timeline-card:hover {
  border-color: var(--accent-primary);
  background-color: var(--bg-hover);
  transform: translateX(4px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.card-time {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.card-summary {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  gap: 8px;
}

.card-tag {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-muted);
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 700px) {
  .timeline-group {
    grid-template-columns: 80px 32px 1fr;
    gap: 8px;
  }
  .timeline-date-label {
    font-size: 12px;
    padding-top: 10px;
  }
}

@media (max-width: 480px) {
  .timeline-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .timeline-date-label {
    text-align: left;
    padding-top: 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-primary);
  }
  .timeline-node {
    display: none;
  }
}
</style>
