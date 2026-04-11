<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="新建笔记" 
    width="500px"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="笔记标题">
        <el-input v-model="form.title" placeholder="请输入笔记标题" />
      </el-form-item>
      <el-form-item label="所属文件夹">
        <el-select v-model="form.folderId" placeholder="选择文件夹" style="width: 100%">
          <el-option label="未分类" :value="null" />
          <el-option v-for="folder in allFolders" :key="folder.id" :label="getFolderPath(folder)"
            :value="folder.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  form: Object,
  allFolders: Array
})

defineEmits(['update:visible', 'confirm'])

const getFolderPath = (folder) => {
  const parts = [folder.name]
  let current = folder
  while (current.parent_id && current.parent_id !== 0) {
    const parent = props.allFolders.find(f => f.id === current.parent_id)
    if (parent) {
      parts.unshift(parent.name)
      current = parent
    } else {
      break
    }
  }
  return parts.join(' / ')
}
</script>
