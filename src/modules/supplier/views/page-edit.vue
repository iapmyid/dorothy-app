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
      <h1>Supplier</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Supplier', path: '/supplier' }, { name: '1', path: '/supplier/1' }, { name: 'Edit' }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Edit Supplier</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form action="" method="post" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.name" label="name"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
