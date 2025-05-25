<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="bg-grey-lighten-4"
    >
      <v-list-item class="bg-blue-darken-4 text-white">
        <v-list-item-content>
          <v-list-item-title class="text-h6 font-weight-bold">
            Dalavong Jelwery
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <v-list nav density="comfortable">
        <v-list-item
          to="/"
          prepend-icon="mdi-account"
          :class="{ 'active-link': isActive('/') }"
        >
          ໂປຣໄຟລ໌
        </v-list-item>
        <v-list-item
          to="/home"
          prepend-icon="mdi-home"
          :class="{ 'active-link': isActive('/home') }"
        >
          ໜ້າຫຼັກ
        </v-list-item>

        <!-- ຈັດການຂໍ້ມູນ -->
        <v-list-group prepend-icon="mdi-folder-cog" value="manage">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="ຈັດການຂໍ້ມູນ" />
          </template>
          <v-list-item to="/manage/product" title="ຈັດການຂໍ້ມູນສິນຄ້າ" :class="{ 'active-link': isActive('/manage/product') }" />
          <v-list-item to="/manage/goldprice" title="ຈັດການຂໍ້ມູນລາຄາຄຳ" :class="{ 'active-link': isActive('/manage/goldprice') }" />
          <v-list-item to="/manage/customer" title="ຈັດການຂໍ້ມູນລູກຄ້າ" :class="{ 'active-link': isActive('/manage/customer') }" />
          <v-list-item to="/manage/supplier" title="ຈັດການຂໍ້ມູນຜູ້ສະໜອງ" :class="{ 'active-link': isActive('/manage/supplier') }" />
        </v-list-group>

        <!-- ການຈັດການຊື້ -->
        <v-list-group prepend-icon="mdi-cart-arrow-down" value="buy">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="ການຈັດການຊື້" />
          </template>
          <v-list-item to="/buy/orders" title="ຈັດການຂໍ້ມູນການສັ່ງຊື້" :class="{ 'active-link': isActive('/buy/orders') }" />
          <v-list-item to="/buy/delivery" title="ຈັດການຂໍ້ມູນການນໍາສົ່ງສິນຄ້າ" :class="{ 'active-link': isActive('/buy/delivery') }" />
          <v-list-item to="/buy/returns" title="ຈັດການຂໍ້ມູນການຊື້ຄືນສິນຄ້າ" :class="{ 'active-link': isActive('/buy/returns') }" />
        </v-list-group>

        <!-- ການຈັດການຂາຍ -->
        <v-list-group prepend-icon="mdi-cart-arrow-right" value="sell">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="ການຈັດການຂາຍ" />
          </template>
          <v-list-item to="/sell/products" title="ຈັດການຂໍ້ມູນການຂາຍສິນຄ້າ" :class="{ 'active-link': isActive('/sell/products') }" />
          <v-list-item to="/sell/exchanges" title="ຈັດການຂໍ້ມູນການປ່ຽນສິນຄ້າ" :class="{ 'active-link': isActive('/sell/exchanges') }" />
        </v-list-group>

        <!-- ລາຍງານ -->
        <v-list-group prepend-icon="mdi-file-chart" value="report">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="ລາຍງານ" />
          </template>
          <v-list-item to="/report/customers" title="ລາຍງານຂໍ້ມູນລູກຄ້າ" :class="{ 'active-link': isActive('/report/customers') }" />
          <v-list-item to="/report/suppliers" title="ລາຍງານຂໍ້ມູນຜູ້ສະໜອງ" :class="{ 'active-link': isActive('/report/suppliers') }" />
          <v-list-item to="/report/deliveries" title="ລາຍງານຂໍ້ມູນການນຳສົ່ງສິນຄ້າ" :class="{ 'active-link': isActive('/report/deliveries') }" />
          <v-list-item to="/report/sales" title="ລາຍງານຂໍ້ມູນການຂາຍສິນຄ້າ" :class="{ 'active-link': isActive('/report/sales') }" />
          <v-list-item to="/report/returns" title="ລາຍງານຂໍ້ມູນການຊື້ຄືນສິນຄ້າ" :class="{ 'active-link': isActive('/report/returns') }" />
          <v-list-item to="/report/exchanges" title="ລາຍງານຂໍ້ມູນການປ່ຽນສິນຄ້າ" :class="{ 'active-link': isActive('/report/exchanges') }" />
          <v-list-item to="/report/orders" title="ລາຍງານຂໍ້ມູນການສັ່ງຊື້ສິນຄ້າ" :class="{ 'active-link': isActive('/report/orders') }" />
          <v-list-item to="/report/income" title="ລາຍງານຂໍ້ມູນລາຍຮັບ" :class="{ 'active-link': isActive('/report/income') }" />
          <v-list-item to="/report/expense" title="ລາຍງານຂໍ້ມູນລາຍຈ່າຍ" :class="{ 'active-link': isActive('/report/expense') }" />
        </v-list-group>
      </v-list>

      <template #append>
        <v-divider></v-divider>
        <v-list>
          <v-list-item prepend-icon="mdi-logout" @click="logout">
            ອອກຈາກລະບົບ
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(true)
const route = useRoute()

const isActive = (path) => route.path === path


const logout = () => {
  console.log("Logout")
}
</script>

<style scoped>
.active-link {
  background-color: #295396 !important;
  color: white !important;
  border-radius: 8px;
}
</style>
