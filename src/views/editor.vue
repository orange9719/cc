<template>
  <div class="editor-page">
    <div class="editor-wrap">
      <Toolbar :editor="toolEditorRef" :defaultConfig="toolbarConfig" mode="simple" />
      <Editor id="editor" v-model="content" :defaultConfig="editorConfig" mode="default" @onCreated="contentCreated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Snackbar } from '@varlet/ui'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { IToolbarConfig } from '@wangeditor/editor'

// 内容
const content = ref<string>('')
// editor配置
const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 4, // 插入的位置，基于当前的 toolbarKeys
    keys: ['uploadImage']
  },
  excludeKeys: []
}

const editorConfig = {
  MENU_CONF: {
    lineHeight: {
      // lineHeightList: ['1', '1.5', '2', '2.5']
    },
    uploadImage: {
      fieldName: 'file',
      server: import.meta.env.VITE_API_PREFIX + '/upload',
      allowedFileTypes: ['image/*'],
      headers: {
        'X-Access-Token': localStorage.token
      },
      // 超时时间，默认为 10 秒
      timeout: 10 * 60 * 1000,
      maxFileSize: 10 * 1024 * 1024, // 上传文件大小10M
      base64LimitSize: 1 * 1024, // 1K以内用base64
      // 上传之前触发
      onBeforeUpload: (file: File) => {
        
        return file
      },
      // 上传进度的回调函数
      onProgress() {  // TS 语法
        Snackbar({
          content: '上传中',
          duration: 10 * 60 * 1000,
          type: 'loading'
        })
      },
      // 单个文件上传成功之后
      onSuccess(file: File, res: any) {  // TS 语法
        Snackbar.clear()
      },
      onFailed: (file, res) => {
        Snackbar.clear()
        Snackbar.error('上传失败')
        console.log(`${file.name} 上传失败`, res)
      },
      // 上传错误，或者触发 timeout 超时
      onError: (file, err, res) => {
        Snackbar.clear()
        Snackbar.error(err.toString())
      }
    }
  },
  focus: false,
  placeholder: '请输入内容...'
}

// 编辑器实例，必须用 shallowRef
const toolEditorRef = shallowRef()

const contentCreated = editor => {
  // console.log(editor.getAllMenuKeys()) // 当前菜单排序和分组
  toolEditorRef.value = editor
  editor.blur()
  editor.deselect()
}

// 组件销毁
onBeforeUnmount(() => {
  const contentEditor = toolEditorRef.value
  if (!contentEditor) contentEditor.destroy()
})
</script>

<style lang="less" scoped></style>