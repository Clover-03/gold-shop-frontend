<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການສັ່ງຊື້
    </h2>

    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Search + Add -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          dense
          outlined
        >
          <template #append-inner>
            <v-img
              src="/icons/Search.png"
              width="20"
              height="20"
              cover
              class="cursor-pointer"
              @click="onSearch"
            />
          </template>
        </v-text-field>
      </v-col>
      <v-spacer />
      <v-btn color="green" class="text-white" rounded @click="onOpenAddDialog">
        ເພີ່ມ
      </v-btn>
    </v-row>

    <!-- Table -->
    <v-table class="custom-table">
      <thead>
        <tr>
          <th>ລະຫັດການສັ່ງຊື້</th>
          <th>ວັນທີສັ່ງຊື້</th>
          <th>ຊື່ສິນຄ້າ</th>
          <th>ນ້ຳຫນັກ</th>
          <th>ຈຳນວນ</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredOrders" :key="index">
          <td>{{ item.code }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.product }}</td>
          <td>{{ item.weight }}</td>
          <td>{{ item.quantity }}</td>
          <td class="d-flex justify-center align-center gap-2">
            <v-img
              src="/icons/Edit.png"
              width="20"
              height="20"
              cover
              @click="onEdit(index)"
              class="cursor-pointer"
            />
            <v-img
              src="/icons/Delete.png"
              width="24"
              height="24"
              cover
              @click="onDelete(index)"
              class="cursor-pointer"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <v-pagination
      v-model="page"
      :length="pageCount"
      class="mt-4 d-flex justify-end"
    />

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editIndex === -1 ? 'ເພີ່ມການສັ່ງຊື້' : 'ແກ້ໄຂການສັ່ງຊື້' }}
        </v-card-title>
        <v-form ref="formRef" @submit.prevent="save" v-model="formValid">
          <v-card-text>
            <v-text-field
              v-model="form.code"
              :rules="[rules.required]"
              label="ລະຫັດການສັ່ງຊື້"
              dense outlined
            />
            <v-text-field
              v-model="form.date"
              :rules="[rules.required]"
              label="ວັນທີສັ່ງຊື້"
              dense outlined
            />
            <v-text-field
              v-model="form.product"
              :rules="[rules.required]"
              label="ຊື່ສິນຄ້າ"
              dense outlined
            />
            <v-text-field
              v-model="form.weight"
              :rules="[rules.required]"
              label="ນ້ຳຫນັກ"
              dense outlined
            />
            <v-text-field
              v-model="form.quantity"
              :rules="[rules.required, rules.numeric]"
              label="ຈຳນວນ"
              dense outlined
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="btn-cancel" @click="dialog = false">ຍົກເລີກ</v-btn>
            <v-btn class="btn-save" type="submit" :disabled="!formValid">ບັນທຶກ</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const page = ref(1)
const itemsPerPage = 5
const snackbar = ref(false)
const snackbarMessage = ref('')

const orders = ref([
  {
    code: '0rd0001',
    date: '26/02/2025',
    product: 'ແຫວນທຳລຽບ',
    weight: '2 ສະຫມິດ',
    quantity: 1
  },
  {
    code: '0rd0001',
    date: '26/02/2025',
    product: 'ສາຍຂ້ອຍອວຍໄຊ',
    weight: '1 ບາດ',
    quantity: 1
  }
])

const dialog = ref(false)
const form = ref({})
const formValid = ref(false)
const formRef = ref(null)
const editIndex = ref(-1)

const rules = {
  required: v => !!v || 'ຈຳເປັນຕ້ອງປ້ອນ',
  numeric: v => /^\d+$/.test(v) || 'ຕ້ອງເປັນຕົວເລກ'
}

const pageCount = computed(() => Math.ceil(orders.value.length / itemsPerPage))

const filteredOrders = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return orders.value
    .filter(c => c.code.includes(search.value) || c.product.includes(search.value))
    .slice(start, start + itemsPerPage)
})

const onSearch = () => {
  console.log('Search:', search.value)
}

const onOpenAddDialog = () => {
  resetForm()
  editIndex.value = -1
  dialog.value = true
}

const onEdit = (index) => {
  const actual = (page.value - 1) * itemsPerPage + index
  form.value = { ...orders.value[actual] }
  editIndex.value = actual
  dialog.value = true
  formRef.value?.resetValidation()
  formValid.value = true
}

const onDelete = (index) => {
  const actual = (page.value - 1) * itemsPerPage + index
  orders.value.splice(actual, 1)
  snackbarMessage.value = 'ລຶບການສັ່ງຊື້ສຳເລັດ'
  snackbar.value = true
}

const resetForm = () => {
  form.value = { code: '', date: '', product: '', weight: '', quantity: '' }
  formRef.value?.resetValidation()
  formValid.value = false
}

const save = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  if (editIndex.value === -1) {
    orders.value.push({ ...form.value })
    snackbarMessage.value = 'ເພີ່ມການສັ່ງຊື້ສຳເລັດ'
  } else {
    orders.value[editIndex.value] = { ...form.value }
    snackbarMessage.value = 'ແກ້ໄຂການສັ່ງຊື້ສຳເລັດ'
  }
  dialog.value = false
  snackbar.value = true
}
</script>

<style scoped>
th {
  font-weight: bold;
}
.gap-2 {
  gap: 8px;
}
.custom-table td, .custom-table th {
  vertical-align: middle;
  padding: 10px;
}
.dialog-title {
  background-color: #365a76;
  color: white;
  font-weight: bold;
}
.btn-cancel {
  background-color: #f44336 !important;
  color: white !important;
}
.btn-save {
  background-color: #4caf50 !important;
  color: white !important;
}
</style>
