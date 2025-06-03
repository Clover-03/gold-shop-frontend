<template> 
  <v-container fluid>
    <!-- หัวเรื่อง -->
    <h2 class="text-h6 font-weight-bold mb-4"
    style="font-family: 'NotoSansLao-SemiCondensed', 'NotoSansLao-SemiCondensed'; color: #1e1e1e">ຈັດການຂໍ້ມູນສິນຄ້າ</h2>

    <!-- ค้นหา -->
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
      <v-btn color="green" class="text-white" rounded @click="addDialog = true">
        ເພີ່ມ
      </v-btn>
    </v-row>

    <!-- ตารางแสดงข้อมูล -->
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
            <v-img
              src="/icons/Edit.png"
              width="20"
              height="20"
              cover
              @click="onEdit(index)"
              class="cursor-pointer"
              style="min-width: 26px; max-width: 20px;"
            />
            <v-img
              src="/icons/Delete.png"
              width="24"
              height="24"
              cover
              @click="onDelete(index)"
              class="cursor-pointer"
              style="min-width: 20px; max-width: 20px;"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- pagination -->
    <v-pagination
      v-model="page"
      :length="pageCount"
      class="mt-4 d-flex justify-end"
    />

    <!-- dialog add -->
    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title>ເພີ່ມຂໍ້ມູນສິນຄ້າ</v-card-title>
        <v-card-text>
          <v-text-field v-model="newProduct.code" label="ລະຫັດສິນຄ້າ" dense outlined />
          <v-text-field v-model="newProduct.name" label="ຊື່ສິນຄ້າ" dense outlined />
          <v-text-field v-model="newProduct.category" label="ປະເພດສິນຄ້າ" dense outlined />
          <v-text-field v-model="newProduct.weight" label="ນ້ຳຫນັກ" dense outlined />
          <v-text-field v-model="newProduct.estimatePrice" label="ລາຄາຮູບປະພັນ" dense outlined />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="addDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" text @click="saveNewProduct">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog edit -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>ແກ້ໄຂຂໍ້ມູນສິນຄ້າ</v-card-title>
        <v-card-text>
          <v-text-field v-model="editItem.code" label="ລະຫັດສິນຄ້າ" dense outlined />
          <v-text-field v-model="editItem.name" label="ຊື່ສິນຄ້າ" dense outlined />
          <v-text-field v-model="editItem.category" label="ປະເພດສິນຄ້າ" dense outlined />
          <v-text-field v-model="editItem.weight" label="ນ້ຳຫນັກ" dense outlined />
          <v-text-field v-model="editItem.estimatePrice" label="ລາຄາຮູບປະພັນ" dense outlined />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" text @click="saveEdit">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const page = ref(1)
const itemsPerPage = 5

const products = ref([
  {
    code: 'P001',
    name: 'ສາຍຄຳລວນ',
    category: 'ສາຍຄຳ',
    weight: '1 ບາດ',
    estimatePrice: '2,000,000'
  },
  {
    code: 'P002',
    name: 'ສັງຄະລິດຄຳ',
    category: 'ສັງຄະລິດ',
    weight: '2 ບາດ',
    estimatePrice: '4,000,000'
  }
])

const newProduct = ref({
  code: '', name: '', category: '', weight: '', estimatePrice: ''
})

const addDialog = ref(false)
const editDialog = ref(false)
const editItem = ref({})
const editIndex = ref(-1)

const pageCount = computed(() => Math.ceil(products.value.length / itemsPerPage))

const filteredProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return products.value
    .filter(p => p.code.includes(search.value) || p.name.includes(search.value))
    .slice(start, start + itemsPerPage)
})

const onSearch = () => {
  console.log('Searching for:', search.value)
}

const onEdit = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  editIndex.value = actualIndex
  editItem.value = { ...products.value[actualIndex] }
  editDialog.value = true
}

const saveEdit = () => {
  if (editIndex.value !== -1) {
    products.value[editIndex.value] = { ...editItem.value }
    editDialog.value = false
  }
}

const onDelete = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  products.value.splice(actualIndex, 1)
}

const saveNewProduct = () => {
  if (newProduct.value.code) {
    products.value.push({ ...newProduct.value })
    addDialog.value = false
    newProduct.value = { code: '', name: '', category: '', weight: '', estimatePrice: '' }
  }
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
</style>
