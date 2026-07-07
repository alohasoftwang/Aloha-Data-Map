<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>Aloha Data Map</h1>
      <p>Data Visualization</p>
    </div>
    <nav class="menu">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        active-class="active"
      >
        {{ item.label }}
      </router-link>

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
          <router-link
            v-for="child in group.children"
            :key="child.path"
            :to="child.path"
            class="menu-item menu-sub-item"
            active-class="active"
          >
            {{ child.label }}
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/asia-gdp', label: 'Asia GDP' }
]

const menuGroups = [
  {
    id: 'world-gdp',
    label: 'World GDP',
    children: [
      { path: '/world-gdp/top15', label: 'World GDP TOP 15' }
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
  'world-gdp': true,
  'data-admin': true
})

function isGroupExpanded(groupId) {
  return expandedGroups.value[groupId]
}

function toggleGroup(groupId) {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId]
}

function syncExpandedFromRoute() {
  const groupId = route.meta.menuGroup
  if (groupId) {
    expandedGroups.value[groupId] = true
  }
}

watch(() => route.path, syncExpandedFromRoute, { immediate: true })
</script>
