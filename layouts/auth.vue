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
        style="font-family: 'NotoSansLao-SemiCondensed'; color: white;"
      >
        ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບ
      </h3>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <!-- ช่องชื่อผู้ใช้ -->
      <v-text-field
        v-model="username"
        label="ຊື່ຜູ້ໃຊ້"
        outlined
        dense
        rounded="xl"
        class="mb-4"
        color="primary"
        bg-color="white"
        style="color: #1e1e1e;"
      >
        <template #prepend-inner>
          <v-img
            src="/icons/Landlord.png"
            width="20"
            height="20"
            cover
            class="mr-2"
          />
        </template>
      </v-text-field>

      <!-- ช่องรหัสผ่าน -->
      <v-text-field
        v-model="password"
        label="ລະຫັດຜ່ານ"
        type="password"
        outlined
        dense
        rounded="xl"
        class="mb-6"
        color="primary"
        bg-color="white"
        style="color: #1e1e1e;"
      >
        <template #prepend-inner>
          <v-img
            src="/icons/Lock.png"
            width="20"
            height="20"
            cover
            class="mr-2"
          />
        </template>
      </v-text-field>

      <!-- ปุ่ม -->
      <v-row dense>
        <v-col cols="6" class="pr-1">
          <v-btn block color="red darken-2" rounded="xl" @click="cancel" style="color: grey">
            <v-img
              src="/icons/Cancel.png"
              width="20"
              height="20"
              cover
              class="mr-2"
            />
            ຍົກເລີກ
          </v-btn>
        </v-col>
        <v-col cols="6" class="pl-1">
          <v-btn block color="green darken-1" rounded="xl" @click="login" style="color: black">
            <v-img
              src="/icons/Login.png"
              width="20"
              height="20"
              cover
              class="mr-2"
            />
            ເຂົ້າລະບົບ
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const api = useApi()

const login = async () => {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະລະຫັດຜ່ານ'
    return
  }
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })

    const data = response.data

    if (response.status === 200 && data.token) {
      // Handle successful login
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user)) // Store user info
      
      // Redirect to a protected page, e.g., home
      router.push('/home')
    } else {
      // Handle cases where response is ok but login is not successful (e.g. wrong credentials)
      console.error('Login failed:', data.message)
      error.value = data.message || 'An unknown error occurred.'
    }
  } catch (err) {
    console.error('An error occurred during login:', err)
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      error.value = err.response.data.message || 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    } else if (err.request) {
      // The request was made but no response was received
      error.value = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.'
    } else {
      // Something happened in setting up the request that triggered an Error
      error.value = 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ.'
    }
  }
}

const cancel = () => {
  username.value = ''
  password.value = ''
  error.value = ''
}
</script> 