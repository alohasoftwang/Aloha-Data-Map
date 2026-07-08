<template>
  <div class="flags-page">
    <header class="flags-header oswald-chart">
      <h1 class="flags-title">FLAGS BY REGION</h1>
      <p class="flags-subtitle">{{ flagCount }} flags · legal aspect ratios</p>
    </header>

    <section
      v-for="region in FLAG_REGIONS"
      :key="region.id"
      class="flags-region"
    >
      <h2 class="flags-region-title">{{ region.label }}</h2>
      <p class="flags-region-count">{{ region.countries.length }} countries</p>
      <ul class="flags-grid">
        <li
          v-for="country in region.countries"
          :key="country.iso2"
          class="flag-card"
        >
          <div class="flag-card-visual">
            <img
              :src="country.flag"
              :alt="country.name"
              class="flag-image"
              :style="flagImageStyle(country.iso2)"
              loading="lazy"
            />
          </div>
          <span class="flag-name">{{ country.name }}</span>
          <span class="flag-code">{{ country.iso2.toUpperCase() }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { FLAG_COUNT, FLAG_REGIONS } from '../data/flagsByRegion.js'
import {
  FLAG_DISPLAY_HEIGHT_REFERENCE,
  toFlagCssSize
} from '../utils/flagAspectRatios.js'

const flagCount = FLAG_COUNT

function flagImageStyle(iso2) {
  return toFlagCssSize(iso2, FLAG_DISPLAY_HEIGHT_REFERENCE)
}
</script>

<style scoped>
.flags-page {
  height: 100%;
  overflow: auto;
  padding: 28px 32px 48px;
}

.flags-header {
  margin-bottom: 36px;
}

.flags-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--pearl);
}

.flags-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: var(--mist);
}

.flags-region {
  margin-bottom: 40px;
  padding: 24px 28px;
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(16, 22, 36, 0.18);
}

.flags-region-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.03em;
}

.flags-region-count {
  margin-top: 4px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--mist);
}

.flags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 20px;
  list-style: none;
}

.flag-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  padding: 14px 12px 12px;
  background: rgba(30, 39, 56, 0.55);
  border: 1px solid var(--border-glow);
  border-radius: 10px;
  transition: border-color 0.2s, transform 0.2s;
}

.flag-card:hover {
  border-color: rgba(217, 192, 138, 0.35);
  transform: translateY(-2px);
}

.flag-card-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

.flag-image {
  display: block;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}

.flag-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--pearl);
  text-align: center;
  line-height: 1.3;
  max-width: 110px;
}

.flag-code {
  font-size: 11px;
  font-family: Consolas, Monaco, monospace;
  color: var(--mist);
  letter-spacing: 0.08em;
}
</style>
