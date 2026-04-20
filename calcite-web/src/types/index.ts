/**
 * Calcite Web 核心类型定义
 *
 * 为毕业设计提供类型安全支持
 */

// ===== 用户 =====
export interface UserInfo {
  user_id: number
  username: string
  email?: string
}

// ===== 笔记 =====
export interface Note {
  id: number
  title: string
  content: string
  summary?: string
  folder_id: number | null
  is_public: boolean
  created_at?: string
  updated_at?: string
  author_id?: number
  like_count?: number
  collect_count?: number
  is_liked?: boolean
  is_collected?: boolean
}

// ===== 文件夹 =====
export interface Folder {
  id: number
  name: string
  parent_id: number | null
  children?: Folder[]
}

// ===== 文件 =====
export interface FileItem {
  id: number
  file_name: string
  file_type: string
  file_size: number
  file_size_formatted?: string
  status: 'processing' | 'done' | 'failed'
  url?: string
  note_id?: number
}

// ===== 标签 =====
export interface Tag {
  id: number
  name: string
}

// ===== API 响应 =====
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// ===== 搜索 =====
export interface SearchResult extends Note {
  highlight_title?: string
  highlight_content?: string
  score?: number
}
