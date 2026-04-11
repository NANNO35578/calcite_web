<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    :title="isEditing ? '编辑标签' : '新建标签'" 
    <!-- width="400px" -->
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="标签名称">
        <el-input v-model="form.name" placeholder="请输入标签名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: Boolean,
  isEditing: Boolean,
  form: Object
})

defineEmits(['update:visible', 'confirm'])
</script>
