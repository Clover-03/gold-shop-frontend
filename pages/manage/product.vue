<template> 
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed', 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນສິນຄ້າ
    </h2>

    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Search and Add -->
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
          <th>ລະຫັດສິນຄ້າ</th>
          <th>ຊື່ສິນຄ້າ</th>
          <th>ປະເພດສິນຄ້າ</th>
          <th>ນ້ຳຫນັກ</th>
          <th>ລາຄາຮູບປະພັນ</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredProducts" :key="index">
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.weight }}</td>
          <td>{{ item.estimatePrice }}</td>
          <td class="d-flex justify-center align-center gap-2">
            <v-img src="/icons/Edit.png" width="20" height="20" cover class="cursor-pointer" @click="onEdit(index)" />
            <v-img src="/icons/Delete.png" width="24" height="24" cover class="cursor-pointer" @click="onDelete(index)" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-pagination v-model="page" :length="pageCount" class="mt-4 d-flex justify-end" />

    <!-- Add Dialog -->
    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">ເພີ່ມສິນຄ້າ</v-card-title>
        <v-form ref="addForm" @submit.prevent="saveAdd" v-model="addFormValid">
          <v-card-text>
            <v-text-field v-model="addItem.code" label="ລະຫັດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.name" label="ຊື່ສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.category" label="ປະເພດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.weight" label="ນ້ຳຫນັກ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.estimatePrice" label="ລາຄາຮູບປະພັນ" dense outlined :rules="[required, numeric]" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="btn-cancel" @click="cancelAdd">ຍົກເລີກ</v-btn>
            <v-btn class="btn-save" type="submit" :disabled="!addFormValid">ບັນທຶກ</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">ແກ້ໄຂສິນຄ້າ</v-card-title>
        <v-form ref="editForm" @submit.prevent="saveEdit" v-model="editFormValid">
          <v-card-text>
            <v-text-field v-model="editItem.code" label="ລະຫັດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="editItem.name" label="ຊື່ສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="editItem.category" label="ປະເພດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="editItem.weight" label="ນ້ຳຫນັກ" dense outlined :rules="[required]" />
            <v-text-field v-model="editItem.estimatePrice" label="ລາຄາຮູບປະພັນ" dense outlined :rules="[required, numeric]" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="btn-cancel" @click="editDialog = false">ຍົກເລີກ</v-btn>
            <v-btn class="btn-save" type="submit" :disabled="!editFormValid">ບັນທຶກ</v-btn>
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

const products = ref([
  { code: 'P001', name: 'ສາຍຄຳລວນ', category: 'ສາຍຄຳ', weight: '1 ບາດ', estimatePrice: '2,000,000' },
  { code: 'P002', name: 'ສັງຄະລິດຄຳ', category: 'ສັງຄະລິດ', weight: '2 ບາດ', estimatePrice: '4,000,000' }
])

const addDialog = ref(false)
const editDialog = ref(false)
const addItem = ref({ code: '', name: '', category: '', weight: '', estimatePrice: '' })
const editItem = ref({})
const editIndex = ref(-1)

const addForm = ref(null)
const editForm = ref(null)
const addFormValid = ref(false)
const editFormValid = ref(false)

const required = value => !!value || 'ຈຳເປັນຕ້ອງປ້ອນ'
const numeric = value => /^\d+(,\d{3})*(\.\d+)?$/.test(value) || 'ຕ້ອງໃສ່ເປັນຕົວເລກ'

const pageCount = computed(() => Math.ceil(products.value.length / itemsPerPage))

const filteredProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return products.value
    .filter(p => p.code.includes(search.value) || p.name.includes(search.value))
    .slice(start, start + itemsPerPage)
})

const onSearch = () => {
  console.log('Search:', search.value)
}

const onOpenAddDialog = () => {
  resetAddForm()
  addDialog.value = true
}

const cancelAdd = () => {
  resetAddForm()
  addDialog.value = false
}

const resetAddForm = () => {
  addItem.value = { code: '', name: '', category: '', weight: '', estimatePrice: '' }
  addForm.value?.resetValidation()
  addFormValid.value = false
}

const onEdit = (index) => {
  const realIndex = (page.value - 1) * itemsPerPage + index
  editIndex.value = realIndex
  editItem.value = { ...products.value[realIndex] }
  editForm.value?.resetValidation()
  editFormValid.value = true
  editDialog.value = true
}

const saveEdit = async () => {
  const valid = await editForm.value.validate()
  if (valid) {
    products.value[editIndex.value] = { ...editItem.value }
    editDialog.value = false
    snackbarMessage.value = 'ແກ້ໄຂສິນຄ້າສຳເລັດ'
    snackbar.value = true
  }
}

const saveAdd = async () => {
  const valid = await addForm.value.validate()
  if (valid) {
    products.value.push({ ...addItem.value })
    snackbarMessage.value = 'ເພີ່ມສິນຄ້າສຳເລັດ'
    snackbar.value = true
    cancelAdd()
  }
}

const onDelete = (index) => {
  const realIndex = (page.value - 1) * itemsPerPage + index
  products.value.splice(realIndex, 1)
  snackbarMessage.value = 'ລຶບສິນຄ້າສຳເລັດ'
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
.custom-table td,
.custom-table th {
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
