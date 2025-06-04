<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນລາຄາຄຳ
    </h2>

    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          dense
          outlined
          class="flex-grow-1"
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

    <v-table class="custom-table">
      <thead>
        <tr>
          <th>ວັນທີ/ເດືອນ/ປີ</th>
          <th>ລະຫັດລາຄາຄຳ</th>
          <th>ລາຄາຊື້</th>
          <th>ລາຄາຂາຍ</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredPrices" :key="index">
          <td>{{ item.date }}</td>
          <td>{{ item.code }}</td>
          <td>{{ item.buyPrice }}</td>
          <td>{{ item.sellPrice }}</td>
          <td class="d-flex justify-center align-center gap-2">
            <v-img src="/icons/Edit.png" width="20" height="20" cover class="cursor-pointer" @click="onEdit(index)" />
            <v-img src="/icons/Delete.png" width="24" height="24" cover class="cursor-pointer" @click="onDelete(index)" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-pagination v-model="page" :length="pageCount" class="mt-4 d-flex justify-end" />

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">{{ dialogMode === 'edit' ? 'ແກ້ໄຂ' : 'ເພີ່ມ' }} ຂໍ້ມູນລາຄາຄຳ</v-card-title>
        <v-form ref="formRef" @submit.prevent="save" v-model="formValid">
          <v-card-text>
            <v-text-field v-model="form.date" label="ວັນທີ/ເດືອນ/ປີ" dense outlined :rules="[required]" />
            <v-text-field v-model="form.code" label="ລະຫັດລາຄາຄຳ" dense outlined :rules="[required]" />
            <v-text-field v-model="form.buyPrice" label="ລາຄາຊື້" dense outlined :rules="[required, numeric]" />
            <v-text-field v-model="form.sellPrice" label="ລາຄາຂາຍ" dense outlined :rules="[required, numeric]" />
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

const prices = ref([
  { date: '05/07/2025', code: 'S0001', buyPrice: '30,740,000', sellPrice: '31,649,000' }
])

const filteredPrices = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return prices.value
    .filter(p => p.code.includes(search.value))
    .slice(start, start + itemsPerPage)
})

const pageCount = computed(() => Math.ceil(prices.value.length / itemsPerPage))

const dialog = ref(false)
const dialogMode = ref('add')
const form = ref({ date: '', code: '', buyPrice: '', sellPrice: '' })
const editIndex = ref(-1)
const formRef = ref(null)
const formValid = ref(false)

const required = value => !!value || 'ຈຳເປັນຕ້ອງປ້ອນ'
const numeric = value => /^\d+(,\d{3})*(\.\d+)?$/.test(value) || 'ຕ້ອງໃສ່ເປັນຕົວເລກ'

const onOpenAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  dialog.value = true
}

const resetForm = () => {
  form.value = { date: '', code: '', buyPrice: '', sellPrice: '' }
  formRef.value?.resetValidation()
  formValid.value = false
}

const onEdit = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  editIndex.value = actualIndex
  dialogMode.value = 'edit'
  form.value = { ...prices.value[actualIndex] }
  formRef.value?.resetValidation()
  formValid.value = true
  dialog.value = true
}

const save = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  if (dialogMode.value === 'edit' && editIndex.value !== -1) {
    prices.value[editIndex.value] = { ...form.value }
    snackbarMessage.value = 'ແກ້ໄຂລາຄາສຳເລັດ'
  } else {
    prices.value.push({ ...form.value })
    snackbarMessage.value = 'ເພີ່ມລາຄາສຳເລັດ'
  }
  dialog.value = false
  snackbar.value = true
}

const onDelete = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  prices.value.splice(actualIndex, 1)
  snackbarMessage.value = 'ລຶບລາຄາສຳເລັດ'
  snackbar.value = true
}

const onSearch = () => {
  console.log('Search:', search.value)
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
  padding-top: 10px;
  padding-bottom: 10px;
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
