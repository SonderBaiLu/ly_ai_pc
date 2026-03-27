<template>
  <el-dialog
    v-model="visible"
    width="760px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="false"
    class="product-tutorial-modal"
    @close="handleClose"
  >
    <template #title>
      <div class="modal-title">
        <span>{{ isZh ? '产品教程' : 'Product Tutorials' }}</span>
      </div>
    </template>

    <div class="modal-body">
      <div class="left">
        <div v-if="loading" class="loading">{{ isZh ? '加载中...' : 'Loading...' }}</div>
        <div v-else-if="tutorialList.length === 0" class="empty">
          {{ isZh ? '暂无教程' : 'No tutorials yet' }}
        </div>
        <div v-else class="list">
          <div
            v-for="(item, idx) in tutorialList"
            :key="getItemKey(item, idx)"
            class="list-item"
            :class="{ 'is-active': selectedItem?.key === getItemKey(item, idx) }"
            @click="selectedItem = toSelected(item, idx)"
          >
            <div class="item-title">{{ getItemTitle(item) }}</div>
            <div v-if="getItemDesc(item)" class="item-desc">{{ getItemDesc(item) }}</div>
          </div>
        </div>
      </div>

      <div class="right" v-if="selectedItem">
        <div class="detail-title">{{ isZh ? '教程详情' : 'Tutorial Detail' }}</div>
        <div class="detail-content">
          <pre class="pre">{{ selectedDetailText }}</pre>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { appApi } from '@/api/app'

type TutorialItem = Record<string, any>

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { locale } = useI18n()
const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const isZh = computed(() => locale.value === 'zh-chs')

const loading = ref(false)
const tutorialList = ref<TutorialItem[]>([])

const selectedItem = ref<{ key: string; raw: TutorialItem; idx: number } | null>(null)

const getItemKey = (item: TutorialItem, idx: number) => {
  return String(item.id ?? item.tutorialId ?? item.tId ?? idx)
}

const getItemTitle = (item: TutorialItem) => {
  return String(item.title ?? item.name ?? item.tutorialName ?? item.tutorialTitle ?? '—')
}

const getItemDesc = (item: TutorialItem) => {
  return item.desc ?? item.description ?? item.summary ?? ''
}

const toSelected = (item: TutorialItem, idx: number) => ({
  key: getItemKey(item, idx),
  raw: item,
  idx,
})

const selectedDetailText = computed(() => {
  if (!selectedItem.value) return ''
  const raw = selectedItem.value.raw
  return String(raw.content ?? raw.detail ?? raw.html ?? raw.tutorialContent ?? raw.summary ?? '')
})

const fetchTutorialList = async () => {
  if (loading.value) return
  loading.value = true
  try {
    // 文档分类（后端字段必填：categoriesCode）
    const res = (await appApi.getTutorialList({ categoriesCode: 'ALL' })) as any
    const data = res?.data

    if (String(res?.code) !== '0000' && res?.success !== true) {
      ElMessage.error(res?.msg || (isZh.value ? '获取教程失败' : 'Failed to fetch tutorials'))
      tutorialList.value = []
      return
    }

    const list: TutorialItem[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.tutorialList)
          ? data.tutorialList
          : Array.isArray(data?.data)
            ? data.data
            : []

    tutorialList.value = list
    selectedItem.value = list.length ? toSelected(list[0], 0) : null
  } catch (e) {
    console.error('[ProductTutorialModal] fetchTutorialList error:', e)
    ElMessage.error(isZh.value ? '获取教程失败' : 'Failed to fetch tutorials')
    tutorialList.value = []
    selectedItem.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      // 弹窗打开时都拉取，确保在“更多”点击后发生请求
      fetchTutorialList()
    } else {
      selectedItem.value = null
    }
  },
  { immediate: false },
)

const handleClose = () => {
  // el-dialog close 触发时同步清空可视内容
  selectedItem.value = null
}
</script>

<style scoped lang="scss">
.modal-title {
  font-weight: 700;
  font-size: 18px;
}

.modal-body {
  display: flex;
  gap: 16px;
}

.left {
  flex: 0 0 320px;
}

.right {
  flex: 1;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  padding-left: 16px;
}

.loading,
.empty {
  padding: 20px 0;
  color: rgba(255, 255, 255, 0.8);
}

.list {
  max-height: 520px;
  overflow: auto;
  padding-right: 8px;
}

.list-item {
  cursor: pointer;
  padding: 12px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 10px;

  &.is-active {
    border-color: rgba(23, 160, 225, 1);
    background: rgba(23, 160, 225, 0.12);
  }

  .item-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: rgba(255, 255, 255, 0.95);
  }

  .item-desc {
    font-size: 12px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.detail-title {
  font-weight: 700;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.95);
}

.detail-content {
  max-height: 520px;
  overflow: auto;
}

.pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.85);
}
</style>

