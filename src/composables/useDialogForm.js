import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 新增/编辑弹窗 + 表单收口 通用逻辑
 * @param {object} options
 *  - defaultForm 表单初值（同时作为重置值的唯一来源）
 *  - submit 业务提交 (formData, { isEdit }) => Promise（页面内做 create/update 分支与成功提示）
 *  - onSuccess 提交成功后回调（一般为列表刷新）
 *  - beforeSubmit 校验通过后的额外守卫，返回 string=warning 并中止，返回 false=静默中止
 *  - createTitle / editTitle 弹窗标题
 */
export const useDialogForm = (options) => {
  const {
    defaultForm,
    submit,
    onSuccess = null,
    beforeSubmit = null,
    createTitle = '新增',
    editTitle = '编辑'
  } = options

  const dialogVisible = ref(false)
  const dialogTitle = ref(createTitle)
  const submitLoading = ref(false)
  const formRef = ref(null)
  const formData = reactive({ ...defaultForm })
  const isEdit = computed(() => formData.id != null)

  const resetForm = () => {
    Object.assign(formData, { ...defaultForm })
  }

  const openCreate = () => {
    resetForm()
    dialogTitle.value = createTitle
    dialogVisible.value = true
  }

  const openEdit = (values = {}) => {
    Object.assign(formData, { ...defaultForm, ...values })
    dialogTitle.value = editTitle
    dialogVisible.value = true
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      if (beforeSubmit) {
        const result = beforeSubmit(formData)
        if (result === false) return
        if (typeof result === 'string') {
          ElMessage.warning(result)
          return
        }
      }

      submitLoading.value = true
      try {
        await submit(formData, { isEdit: isEdit.value })
        dialogVisible.value = false
        if (onSuccess) await onSuccess()
      } catch (error) {
        ElMessage.error(error?.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleClose = () => {
    formRef.value?.resetFields()
    resetForm()
  }

  return {
    dialogVisible,
    dialogTitle,
    submitLoading,
    formRef,
    formData,
    isEdit,
    openCreate,
    openEdit,
    submitForm,
    resetForm,
    handleClose
  }
}
