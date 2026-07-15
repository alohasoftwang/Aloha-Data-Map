<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>{{ t('app.name') }}</h1>
      <p>{{ t('app.tagline') }}</p>
      <LanguageSwitcher placement="sidebar" />
    </div>
    <nav class="menu">
      <div
        v-for="group in NAV_GROUPS"
        :key="group.id"
        class="menu-group"
      >
        <button
          type="button"
          class="menu-group-title"
          :class="{ expanded: isGroupExpanded(group.id) }"
          @click="toggleGroup(group.id)"
        >
          <span>{{ t(group.labelKey) }}</span>
          <svg
            class="menu-group-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div v-show="isGroupExpanded(group.id)" class="menu-sub">
          <template v-for="child in group.children" :key="child.path ?? child.id">
            <router-link
              v-if="child.path"
              :to="child.path"
              class="menu-item menu-sub-item"
              active-class="active"
            >
              {{ t(child.labelKey) }}
            </router-link>
            <div v-else class="menu-sub-group">
              <button
                type="button"
                class="menu-sub-group-title"
                :class="{ expanded: isSubGroupExpanded(child.id) }"
                @click="toggleSubGroup(child.id)"
              >
                <span>{{ t(child.labelKey) }}</span>
                <svg
                  class="menu-group-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div v-show="isSubGroupExpanded(child.id)" class="menu-sub-sub">
                <template v-for="sub in child.children" :key="sub.path ?? sub.id">
                  <router-link
                    v-if="sub.path"
                    :to="sub.path"
                    class="menu-item menu-sub-sub-item"
                    active-class="active"
                  >
                    {{ t(sub.labelKey) }}
                  </router-link>
                  <div v-else class="menu-nested-group">
                    <button
                      type="button"
                      class="menu-nested-group-title"
                      :class="{ expanded: isNestedSubGroupExpanded(sub.id) }"
                      @click="toggleNestedSubGroup(sub.id)"
                    >
                      <span>{{ t(sub.labelKey) }}</span>
                      <svg
                        class="menu-group-arrow"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      v-show="isNestedSubGroupExpanded(sub.id)"
                      class="menu-nested-sub"
                    >
                      <router-link
                        v-for="leaf in sub.children"
                        :key="leaf.path"
                        :to="leaf.path"
                        class="menu-item menu-nested-sub-item"
                        active-class="active"
                      >
                        {{ t(leaf.labelKey) }}
                      </router-link>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { NAV_GROUPS } from '../config/navigation.js'
import LanguageSwitcher from './LanguageSwitcher.vue'

const route = useRoute()
const { t } = useI18n()

/** 一级菜单：同时只展开一个 */
const expandedGroupId = ref(null)
/** 二级菜单：同时只展开一个 */
const expandedSubGroupId = ref(null)
/** 三级菜单：同时只展开一个 */
const expandedNestedSubGroupId = ref(null)

function isGroupExpanded(groupId) {
  return expandedGroupId.value === groupId
}

function isSubGroupExpanded(subGroupId) {
  return expandedSubGroupId.value === subGroupId
}

function isNestedSubGroupExpanded(nestedId) {
  return expandedNestedSubGroupId.value === nestedId
}

function toggleGroup(groupId) {
  if (expandedGroupId.value === groupId) {
    expandedGroupId.value = null
    return
  }
  expandedGroupId.value = groupId
  expandedSubGroupId.value = null
  expandedNestedSubGroupId.value = null
}

function toggleSubGroup(subGroupId) {
  if (expandedSubGroupId.value === subGroupId) {
    expandedSubGroupId.value = null
    expandedNestedSubGroupId.value = null
    return
  }
  expandedSubGroupId.value = subGroupId
  expandedNestedSubGroupId.value = null
}

function toggleNestedSubGroup(nestedId) {
  expandedNestedSubGroupId.value =
    expandedNestedSubGroupId.value === nestedId ? null : nestedId
}

function syncExpandedFromRoute() {
  const groupId = route.meta.menuGroup
  if (groupId) {
    expandedGroupId.value = groupId
  }

  expandedSubGroupId.value = route.meta.menuSubGroup || null
  expandedNestedSubGroupId.value = route.meta.menuNestedSubGroup || null
}

watch(() => route.path, syncExpandedFromRoute, { immediate: true })
</script>
