<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນຜູ້ສະໜອງ
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
          <th>ລະຫັດຜູ້ສະໜອງ</th>
          <th>ຊື່ຜູ້ສະໜອງ</th>
          <th>ເບີໂທ</th>
          <th>ທີ່ຢູ່</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredSuppliers" :key="index">
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.address }}</td>
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
          {{ editIndex === -1 ? 'ເພີ່ມຜູ້ສະໜອງ' : 'ແກ້ໄຂຜູ້ສະໜອງ' }}
        </v-card-title>
        <v-form ref="formRef" @submit.prevent="save" v-model="formValid">
          <v-card-text>
            <v-text-field
              v-model="form.code"
              :rules="[rules.required]"
              label="ລະຫັດຜູ້ສະໜອງ"
              dense outlined
            />
            <v-text-field
              v-model="form.name"
              :rules="[rules.required]"
              label="ຊື່ຜູ້ສະໜອງ"
              dense outlined
            />
            <v-text-field
              v-model="form.phone"
              :rules="[rules.required, rules.phone]"
              label="ເບີໂທ"
              dense outlined
            />
            <v-text-field
              v-model="form.address"
              :rules="[rules.required]"
              label="ທີ່ຢູ່"
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

const suppliers = ref([
  {
    code: 'S0001',
    name: 'ຮ້ານຂາຍຄໍາສະຫວັນ',
    phone: '2066666666',
    address: 'ບ້ານສາຍອົມ ເມືອງວັງວຽງ ມະຫາສາລະຄາມ'
  }
])

const dialog = ref(false)
const form = ref({})
const formValid = ref(false)
const formRef = ref(null)
const editIndex = ref(-1)

const rules = {
  required: v => !!v || 'ຈຳເປັນຕ້ອງປ້ອນ',
  phone: v => /^\d{8,15}$/.test(v) || 'ເບີໂທບໍ່ຖືກຕ້ອງ'
}

const pageCount = computed(() => Math.ceil(suppliers.value.length / itemsPerPage))

const filteredSuppliers = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return suppliers.value
    .filter(c => c.code.includes(search.value) || c.name.includes(search.value))
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
  form.value = { ...suppliers.value[actual] }
  editIndex.value = actual
  dialog.value = true
  formRef.value?.resetValidation()
  formValid.value = true
}

const onDelete = (index) => {
  const actual = (page.value - 1) * itemsPerPage + index
  suppliers.value.splice(actual, 1)
  snackbarMessage.value = 'ລຶບຜູ້ສະໜອງສຳເລັດ'
  snackbar.value = true
}

const resetForm = () => {
  form.value = { code: '', name: '', phone: '', address: '' }
  formRef.value?.resetValidation()
  formValid.value = false
}

const save = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  if (editIndex.value === -1) {
    suppliers.value.push({ ...form.value })
    snackbarMessage.value = 'ເພີ່ມຜູ້ສະໜອງສຳເລັດ'
  } else {
    suppliers.value[editIndex.value] = { ...form.value }
    snackbarMessage.value = 'ແກ້ໄຂຜູ້ສະໜອງສຳເລັດ'
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
