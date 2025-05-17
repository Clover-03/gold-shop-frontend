<template>
  <v-container class="fill-height d-flex align-center justify-center" style="background-color: #1e2d4f;">
    <v-card max-width="400" class="pa-6 text-center" elevation="10" rounded="xl">
      <v-img
        src="/logo.png"
        max-width="100"
        class="mx-auto mb-4"
      ></v-img>

      <h3 class="text-h6 font-weight-bold mb-6">ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບ</h3>

      <v-text-field
        v-model="username"
        label="ຊື່ຜູ້ໃຊ້"
        prepend-inner-icon="mdi-account"
        outlined
        dense
        class="mb-3"
      />

      <v-text-field
        v-model="password"
        label="ລະຫັດຜ່ານ"
        type="password"
        prepend-inner-icon="mdi-lock"
        outlined
        dense
        class="mb-6"
      />

      <v-row>
        <v-col cols="6">
          <v-btn color="red darken-2" block @click="cancel">
            <v-icon start>mdi-close</v-icon>ຍົກເລີກ
          </v-btn>
        </v-col>

        <v-col cols="6">
          <v-btn color="green darken-1" block @click="login">
            <v-icon start>mdi-login</v-icon>ເຂົ້າລະບົບ
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')

const login = () => {
  console.log('ล็อกอินด้วย', username.value, password.value)
  // เพิ่ม logic ตรวจสอบ username/password หรือเรียก API ที่ backend ได้ภายหลัง
}

const cancel = () => {
  username.value = ''
  password.value = ''
}
</script>
