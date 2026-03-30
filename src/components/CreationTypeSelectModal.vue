<template>
  <el-dialog v-model="visible" width="800px" :close-on-click-modal="false" :close-on-press-escape="true"
    :show-close="false" class="creation-type-modal" @close="handleClose">

    <template #header>
      <div class="modal-header">
        <div class="header-left">
          <img class="header-icon" :src="images.magic" alt="" />
          <span class="header-title">创作款型选择</span>
        </div>
        <img :src="images.closeDialog" alt="" class="header-close" @click="handleClose" />
      </div>
    </template>

    <div class="modal-body">
      <div v-for="(section, sectionIndex) in sections" :key="`${section.title}-${sectionIndex}`" class="section">
        <div class="section-title">{{ section.title }}</div>
        <div class="btn-row" :class="{ wrap: sectionIndex >= 2 }">
          <button v-for="option in section.options" :key="String(option.id || option.content || '')"
            :class="[sectionIndex < 2 ? 'pill' : 'tag', { active: selectedPath[sectionIndex] === String(option.content || '') }]"
            type="button" @click="selectOption(sectionIndex, String(option.content || ''))">
            {{ option.content }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer">
        <div class="current">当前选择：{{ currentText }}</div>
        <el-button type="primary" class="confirm-btn" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { images } from '@/assets'

export type CreationTypeSelection = {
  category: string
  clothType: string
  kind: string
  subKind: string
  pathValues?: string[]
  pathNodeIds?: string[]
  displayText?: string
}

type CreationTreeNode = {
  id?: string
  content?: string
  children?: CreationTreeNode[]
}

type DynamicSection = {
  title: string
  options: CreationTreeNode[]
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  selection?: Partial<CreationTypeSelection>
  optionTree?: CreationTreeNode[]
}>(), {
  modelValue: false,
  selection: () => ({}),
  optionTree: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', v: CreationTypeSelection): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const selectedPath = ref<string[]>([])

const getChildren = (node?: CreationTreeNode | null) => (Array.isArray(node?.children) ? node.children : [])
const firstNode = (list: CreationTreeNode[]) => list[0]
const findByContent = (list: CreationTreeNode[], content?: string) =>
  list.find((item) => String(item.content || '') === String(content || ''))

const findPathNodeIdsByValues = (pathValues: string[]) => {
  const ids: string[] = []
  let currentNodes: CreationTreeNode[] = Array.isArray(props.optionTree) ? props.optionTree : []
  let depth = 0
  while (currentNodes.length > 0 && depth < pathValues.length && depth < 20) {
    const options =
      currentNodes.length === 1 && getChildren(currentNodes[0]).length > 0
        ? getChildren(currentNodes[0])
        : currentNodes
    const selectedNode = findByContent(options, pathValues[depth]) || firstNode(options)
    ids.push(String(selectedNode?.id ?? ''))
    currentNodes = getChildren(selectedNode)
    depth += 1
  }
  return ids
}

const buildSectionsByPath = (pathValues: string[]) => {
  const result: DynamicSection[] = []
  let currentNodes: CreationTreeNode[] = Array.isArray(props.optionTree) ? props.optionTree : []
  let depth = 0

  while (currentNodes.length > 0 && depth < 20) {
    const isTitleNode = currentNodes.length === 1 && getChildren(currentNodes[0]).length > 0
    const title = isTitleNode ? String(currentNodes[0].content || `第${depth + 1}级`) : `第${depth + 1}级`
    const options: CreationTreeNode[] = isTitleNode ? getChildren(currentNodes[0]) : currentNodes

    if (!options.length) break
    result.push({ title, options })

    const selectedContent = pathValues[depth]
    const selectedNode = findByContent(options, selectedContent) || firstNode(options)
    currentNodes = getChildren(selectedNode)
    depth += 1
  }

  return result
}

const applyPathDefaults = () => {
  const next: string[] = []
  let currentNodes: CreationTreeNode[] = Array.isArray(props.optionTree) ? props.optionTree : []
  let depth = 0

  while (currentNodes.length > 0 && depth < 20) {
    const options =
      currentNodes.length === 1 && getChildren(currentNodes[0]).length > 0
        ? getChildren(currentNodes[0])
        : currentNodes

    if (!options.length) break

    const selectedNode = findByContent(options, selectedPath.value[depth]) || firstNode(options)
    const selectedContent = String(selectedNode?.content || '')
    if (!selectedContent) break

    next.push(selectedContent)
    currentNodes = getChildren(selectedNode)
    depth += 1
  }

  selectedPath.value = next
}

const sections = computed(() => buildSectionsByPath(selectedPath.value))

const selectOption = (sectionIndex: number, content: string) => {
  selectedPath.value = [...selectedPath.value.slice(0, sectionIndex), content]
  applyPathDefaults()
}

watch(
  () => props.selection,
  (v) => {
    if (!v) return
    const fallbackPath = [v.category, v.clothType, v.kind, v.subKind].filter(Boolean) as string[]
    selectedPath.value = Array.isArray(v.pathValues) && v.pathValues.length ? [...v.pathValues] : fallbackPath
    applyPathDefaults()
  },
  { deep: true, immediate: true },
)

watch(
  () => props.optionTree,
  () => {
    applyPathDefaults()
  },
  { deep: true, immediate: true },
)

const currentText = computed(() => selectedPath.value.slice(1).join(' > '))

const handleClose = () => {
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm', {
    category: selectedPath.value[0] || '',
    clothType: selectedPath.value[1] || '',
    kind: selectedPath.value[2] || '',
    subKind: selectedPath.value[selectedPath.value.length - 1] || '',
    pathValues: [...selectedPath.value],
    pathNodeIds: findPathNodeIdsByValues(selectedPath.value),
    displayText: selectedPath.value.join('-'),
  })
  visible.value = false
}
</script>

<style scoped lang="scss">
.creation-type-modal {
  font-family: Inter-medium;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    background: $color-bg-dark-secondary;
    border-radius: 10px 10px 0 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-weight: 600;
      font-size: $font-size-xl;
      color: $color-text-white;

      .header-icon {
        width: 20px;
        height: 21px;
        object-fit: contain;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .modal-body {
    padding: 9px 45px;
    background: $color-bg-black;
    border-radius: 0 0 10px 10px;

    .section {
      margin-bottom: $spacing-xl;
    }

    .section-title {
      font-size: $font-size-base;
      color: $color-text-white;
      margin-bottom: $spacing-md;
    }

    .btn-row {
      display: flex;
      gap: $spacing-md;
      align-items: center;
    }

    .btn-row.wrap {
      flex-wrap: wrap;
      gap: 10px;
    }

    .pill {
      padding: 9px 32px;
      border-radius: $border-radius-sm;
      border: 1px solid rgba(18, 18, 18, 1);
      background: transparent;
      cursor: pointer;
      font-size: $font-size-md;
      color: $color-text-white;

      &.active {
        background: $color-primary-dark;
        border-color: transparent;
        color: $color-text-white;
      }
    }

    .tag {
      padding: 5px 18px;
      border-radius: $border-radius-sm;
      border: 1px solid rgba(18, 18, 18, 1);
      background: transparent;
      color: $color-text-white;
      font-size: $font-size-sm;
      cursor: pointer;

      &.active {
        background: $color-primary-dark;
        border-color: transparent;
      }
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 25px 16px;
    background: $color-bg-dark-secondary;
    border-radius: 0 0 10px 10px;

    .current {
      color: $color-text-tags;
      font-size: 13px;
    }

    .confirm-btn {
      width: 120px;
      height: 42px;
    }
  }
}
</style>
