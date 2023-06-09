<script setup lang="ts">
import { ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'

const searchAll = ref('')
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>User</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'User' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex items-center gap-4">
            <div class="w-full flex space-x-2">
              <button class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <router-link to="/user/create">Add New</router-link>
              </button>
              <component
                :is="BaseInput"
                v-model="searchAll"
                placeholder="Search"
                border="full"
                class="flex-1"
              >
                <template #prefix>
                  <i class="i-far-magnifying-glass mx-3 block"></i>
                </template>
              </component>
            </div>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Name</p>
                    </div>
                  </th>
                  <th class="basic-table-head">
                    <div class="flex items-center justify-between">
                      <p>Role</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="basic-table-row">
                  <td class="basic-table-body">
                    <router-link to="/user/1" class="text-info">Ganderton lorem</router-link>
                  </td>
                  <td class="basic-table-body">Admin</td>
                </tr>
                <tr class="basic-table-row">
                  <td class="basic-table-body">
                    <router-link to="/user/1" class="text-info">John Doe</router-link>
                  </td>
                  <td class="basic-table-body">Cashier</td>
                </tr>
                <tr class="basic-table-row">
                  <td class="basic-table-body">
                    <router-link to="/user/1" class="text-info">Adrenalo Tate</router-link>
                  </td>
                  <td class="basic-table-body">Cashier</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="w-full flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Showing 1 to 10 of 23 entries
              </p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-light-dark rounded-r-none">
                <i class="i-fas-angle-left block"></i>
              </button>
              <button type="button" class="btn btn-secondary rounded border-r-none">1</button>
              <button type="button" class="btn btn-light-dark rounded-none border-r-none">2</button>
              <button type="button" class="btn btn-light-dark rounded-none border-r-none">3</button>
              <button type="button" class="btn btn-light-dark rounded-none border-r-none">4</button>
              <button type="button" class="btn btn-light-dark rounded-none border-r-none">5</button>
              <button type="button" class="btn btn-light-dark rounded-l-none">
                <i class="i-fas-angle-right block"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
