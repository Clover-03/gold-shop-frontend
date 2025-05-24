<template>
  <v-container
    fluid
    class="d-flex align-center justify-center"
    style="min-height: 100vh; background-color: #1e2d4f;"
  >
    <v-col cols="12" sm="8" md="5" lg="4" class="text-center">
      <!-- โลโก้ -->
      <v-avatar size="150" class="mx-auto mb-4" color="white" rounded="circle">
        <v-img src="/logo.png" cover />
      </v-avatar>

      <!-- หัวเรื่อง -->
      <h3
        class="text-h6 font-weight-medium mb-6"
        style="font-family: 'Noto Sans Lao SemiCondensed'; color: white;"
      >
        ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບ
      </h3>

      <!-- ช่องชื่อผู้ใช้ -->
      <v-text-field
        v-model="username"
        label="ຊື່ຜູ້ໃຊ້"
        prepend-inner-icon="mdi-account"
        outlined
        dense
        rounded="xl"
        class="mb-4"
        color="primary"
        bg-color="white"
        style="color: #1e1e1e;"
      />

      <!-- ช่องรหัสผ่าน -->
      <v-text-field
        v-model="password"
        label="ລະຫັດຜ່ານ"
        type="password"
        prepend-inner-icon="mdi-lock"
        outlined
        dense
        rounded="xl"
        class="mb-6"
        color="primary"
        bg-color="white"
        style="color: #1e1e1e;"
      />

      <!-- ปุ่ม -->
      <v-row dense>
        <v-col cols="6" class="pr-1">
          <v-btn block color="red darken-2" rounded="xl" @click="cancel">
            <v-icon start>mdi-close</v-icon>ຍົກເລີກ
          </v-btn>
        </v-col>
        <v-col cols="6" class="pl-1">
          <v-btn block color="green darken-1" rounded="xl" @click="login">
            <v-icon start>mdi-login</v-icon>ເຂົ້າລະບົບ
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')

const login = () => {
  console.log('Login:', username.value, password.value)
}

const cancel = () => {
  username.value = ''
  password.value = ''
}
</script>
