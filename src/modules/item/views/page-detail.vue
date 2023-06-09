<script setup lang="ts">
import { ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'

const form = ref({
  name: ''
})
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Item', path: '/item' }, { name: '1' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Show Item</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/item/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add </span>
              </router-link>
            </div>
            <div>
              <router-link to="/item/1/edit" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <span>Edit</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.name" label="name"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
