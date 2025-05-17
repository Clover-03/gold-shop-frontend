<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-4">ระบบจัดการร้านทอง</h1>

    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="menu in menus" :key="menu.title">
        <v-card class="pa-4" elevation="2" @click="goTo(menu.route)" style="cursor: pointer;">
          <v-card-title>{{ menu.title }}</v-card-title>
          <v-card-text>{{ menu.description }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const menus = [
  { title: 'จัดการสินค้า', description: 'เพิ่ม/แก้ไขทอง', route: '/products' },
  { title: 'ลูกค้า', description: 'ข้อมูลลูกค้า', route: '/customers' },
  { title: 'ซื้อขายทอง', description: 'บันทึกรายการซื้อขาย', route: '/transactions' },
  { title: 'รายงาน', description: 'สรุปรายรับรายจ่าย', route: '/reports' }
]

const router = useRouter()
const goTo = (path) => {
  router.push(path)
}
</script>
