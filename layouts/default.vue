<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Dalavong Jewelry</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      app
      permanent
      class="bg-grey-lighten-4 rounded-b-xl"
    >
      <v-divider />

      <v-list nav density="comfortable">
        <v-list-item to="/" :class="{ 'active-link': isActive('/') }">
          <template #prepend>
            <v-img src="/icons/Profile.png" width="24" height="24" cover class="mr-2" />
          </template>
          ໂປຣໄຟລ໌
        </v-list-item>

        <v-list-item to="/home" :class="{ 'active-link': isActive('/home') }">
          <template #prepend>
            <v-img src="/icons/Home.png" width="24" height="24" cover class="mr-2" />
          </template>
          ໜ້າຫຼັກ
        </v-list-item>

        <v-list-group value="manage">
          <template #activator="{ props, isOpen }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-img src="/icons/Manage.png" width="24" height="24" cover class="mr-2" />
              </template>
              ຈັດການຂໍ້ມູນ
              <template #append>
                <v-img src="/icons/Arrow.png" width="16" height="16" cover class="ml-auto transition-transform" :class="{ 'rotate-180': isOpen }" />
              </template>
            </v-list-item>
          </template>
          <v-list-item to="/manage/product" title="ຈັດການຂໍ້ມູນສິນຄ້າ" :class="{ 'active-link': isActive('/manage/product') }" />
          <v-list-item to="/manage/goldprice" title="ຈັດການຂໍ້ມູນລາຄາຄຳ" :class="{ 'active-link': isActive('/manage/goldprice') }" />
          <v-list-item to="/manage/customer" title="ຈັດການຂໍ້ມູນລູກຄ້າ" :class="{ 'active-link': isActive('/manage/customer') }" />
          <v-list-item to="/manage/supplier" title="ຈັດການຂໍ້ມູນຜູ້ສະໜອງ" :class="{ 'active-link': isActive('/manage/supplier') }" />
        </v-list-group>

        <v-list-group value="buy">
          <template #activator="{ props, isOpen }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-img src="/icons/purchase.png" width="24" height="24" cover class="mr-2" />
              </template>
              ການຈັດການຊື້
              <template #append>
                <v-img src="/icons/Arrow.png" width="16" height="16" cover class="ml-auto transition-transform" :class="{ 'rotate-180': isOpen }" />
              </template>
            </v-list-item>
          </template>
          <v-list-item to="/buy/orders" title="ຈັດການຂໍ້ມູນການສັ່ງຊື້" :class="{ 'active-link': isActive('/buy/orders') }" />
          <v-list-item to="/buy/delivery" title="ຈັດການຂໍ້ມູນການນໍາສົ່ງສິນຄ້າ" :class="{ 'active-link': isActive('/buy/delivery') }" />
          <v-list-item to="/buy/returns" title="ຈັດການຂໍ້ມູນການຊື້ຄືນສິນຄ້າ" :class="{ 'active-link': isActive('/buy/returns') }" />
        </v-list-group>

        <v-list-group value="sell">
          <template #activator="{ props, isOpen }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-img src="/icons/Sell.png" width="24" height="24" cover class="mr-2" />
              </template>
              ການຈັດການຂາຍ
              <template #append>
                <v-img src="/icons/Arrow.png" width="16" height="16" cover class="ml-auto transition-transform" :class="{ 'rotate-180': isOpen }" />
              </template>
            </v-list-item>
          </template>
          <v-list-item to="/sell/selling" title="ຈັດການຂໍ້ມູນການຂາຍສິນຄ້າ" :class="{ 'active-link': isActive('/sell/selling') }" />
          <v-list-item to="/sell/exchanges" title="ຈັດການຂໍ້ມູນການປ່ຽນສິນຄ້າ" :class="{ 'active-link': isActive('/sell/exchanges') }" />
        </v-list-group>

        <v-list-group value="report">
          <template #activator="{ props, isOpen }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-img src="/icons/Report.png" width="24" height="24" cover class="mr-2" />
              </template>
              ລາຍງານ
              <template #append>
                <v-img src="/icons/Arrow.png" width="16" height="16" cover class="ml-auto transition-transform" :class="{ 'rotate-180': isOpen }" />
              </template>
            </v-list-item>
          </template>
          <v-list-item to="/reports/customers" title="ລາຍງານຂໍ້ມູນລູກຄ້າ" :class="{ 'active-link': isActive('/reports/customers') }" />
          <v-list-item to="/reports/suppliers" title="ລາຍງານຂໍ້ມູນຜູ້ສະໜອງ" :class="{ 'active-link': isActive('/reports/suppliers') }" />
          <v-list-item to="/reports/deliveries" title="ລາຍງານຂໍ້ມູນການນຳສົ່ງສິນຄ້າ" :class="{ 'active-link': isActive('/reports/deliveries') }" />
          <v-list-item to="/reports/sales" title="ລາຍງານຂໍ້ມູນການຂາຍສິນຄ້າ" :class="{ 'active-link': isActive('/reports/sales') }" />
          <v-list-item to="/reports/returns" title="ລາຍງານຂໍ້ມູນການຊື້ຄືນສິນຄ້າ" :class="{ 'active-link': isActive('/reports/returns') }" />
          <v-list-item to="/reports/exchanges" title="ລາຍງານຂໍ້ມູນການປ່ຽນສິນຄ້າ" :class="{ 'active-link': isActive('/reports/exchanges') }" />
          <v-list-item to="/reports/orders" title="ລາຍງານຂໍ້ມູນການສັ່ງຊື້ສິນຄ້າ" :class="{ 'active-link': isActive('/reports/orders') }" />
          <v-list-item to="/reports/income" title="ລາຍງານຂໍ້ມູນລາຍຮັບ" :class="{ 'active-link': isActive('/reports/income') }" />
          <v-list-item to="/reports/expense" title="ລາຍງານຂໍ້ມູນລາຍຈ່າຍ" :class="{ 'active-link': isActive('/reports/expense') }" />
        </v-list-group>
      </v-list>

      <template #append>
        <v-divider></v-divider>
        <v-list>
          <v-list-item @click="logout">
            <template #prepend>
              <v-img src="/icons/Logout.png" width="24" height="24" cover class="mr-2" />
            </template>
            ອອກຈາກລະບົບ
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main class="main-background">
      <v-container fluid>
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const isActive = (path) => route.path.startsWith(path)

const logout = () => {
  console.log("Logout")
}
</script>

<style scoped>
.main-background {
  background-color: #f4f6f8;
}
.active-link {
  background-color: #295396 !important;
  color: white !important;
  border-radius: 8px;
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
