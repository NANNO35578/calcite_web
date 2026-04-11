<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    :title="isEditing ? '编辑文件夹' : '新建文件夹'" 
    width="400px"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="文件夹名">
        <el-input v-model="form.name" placeholder="请输入文件夹名称" />
      </el-form-item>
      <el-form-item v-if="!isEditing" label="父文件夹">
        <el-select v-model="form.parentId" placeholder="选择父文件夹（默认根目录）" style="width: 100%">
          <el-option label="根目录" :value="0" />
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
  isEditing: Boolean,
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
