<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>Aloha Data Map</h1>
      <p>Data Visualization</p>
    </div>
    <nav class="menu">
      <div
        v-for="group in menuGroups"
        :key="group.id"
        class="menu-group"
      >
        <button
          type="button"
          class="menu-group-title"
          :class="{ expanded: isGroupExpanded(group.id) }"
          @click="toggleGroup(group.id)"
        >
          <span>{{ group.label }}</span>
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
              {{ child.label }}
            </router-link>
            <div v-else class="menu-sub-group">
              <button
                type="button"
                class="menu-sub-group-title"
                :class="{ expanded: isSubGroupExpanded(child.id) }"
                @click="toggleSubGroup(child.id)"
              >
                <span>{{ child.label }}</span>
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
                <router-link
                  v-for="sub in child.children"
                  :key="sub.path"
                  :to="sub.path"
                  class="menu-item menu-sub-sub-item"
                  active-class="active"
                >
                  {{ sub.label }}
                </router-link>
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
import { useRoute } from 'vue-router'

const route = useRoute()

const menuGroups = [
  {
    id: 'bar-chart-race',
    label: 'Bar Chart Race',
    children: [
      { path: '/world-gdp/top15', label: 'World GDP TOP 15' },
      { path: '/asia-gdp/top15', label: 'Asia GDP TOP 15' },
      { path: '/bar-race/china-g7', label: 'China vs G7' },
      { path: '/bar-race/south-asia', label: 'South Asia GDP' }
    ]
  },
  {
    id: 'line-race',
    label: 'Line Race',
    children: [
      { path: '/line-race/world-top15', label: 'World GDP TOP 15' },
      { path: '/world-gdp/dual', label: 'GDP Dual Curve Race' },
      { path: '/line-race/asia-top15', label: 'Asia GDP TOP 15' },
      { path: '/world-gdp/line-race/cjk', label: 'China vs Japan vs Korea vs India' },
      { path: '/world-gdp/line-race/china-g7', label: 'China vs G7' },
      { path: '/world-gdp/line-race/india-g7-kr', label: 'India vs G7 ex-US + Korea' },
      { path: '/line-race/south-asia', label: 'South Asia GDP' }
    ]
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [
      { path: '/world-gdp/treemap-top10', label: 'World GDP TOP 10 Treemap' }
    ]
  },
  {
    id: 'reference',
    label: 'Reference',
    children: [
      { path: '/flags/by-region', label: 'Flags by Region' }
    ]
  },
  {
    id: 'data-admin',
    label: 'Data Admin',
    children: [
      { path: '/admin/data', label: 'WB Tables' }
    ]
  }
]

const expandedGroups = ref({
  'bar-chart-race': true,
  'line-race': true,
  'charts': true,
  'reference': true,
  'data-admin': true
})

const expandedSubGroups = ref({})

function isGroupExpanded(groupId) {
  return expandedGroups.value[groupId]
}

function isSubGroupExpanded(subGroupId) {
  return expandedSubGroups.value[subGroupId]
}

function toggleGroup(groupId) {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId]
}

function toggleSubGroup(subGroupId) {
  expandedSubGroups.value[subGroupId] = !expandedSubGroups.value[subGroupId]
}

function syncExpandedFromRoute() {
  const groupId = route.meta.menuGroup
  if (groupId) {
    expandedGroups.value[groupId] = true
  }

  const subGroupId = route.meta.menuSubGroup
  if (subGroupId) {
    expandedSubGroups.value[subGroupId] = true
  }
}

watch(() => route.path, syncExpandedFromRoute, { immediate: true })
</script>
