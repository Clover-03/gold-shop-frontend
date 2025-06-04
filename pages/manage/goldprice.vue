<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນລາຄາຄຳ
    </h2>

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
      <v-btn color="green" class="text-white" rounded @click="onAdd">
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
            <v-img src="/icons/Edit.png" width="20" height="20" cover @click="onEdit(index)" class="cursor-pointer" />
            <v-img src="/icons/Delete.png" width="20" height="20" cover @click="onDelete(index)" class="cursor-pointer" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-pagination
      v-model="page"
      :length="pageCount"
      class="mt-4 d-flex justify-end"
    />

    <!-- dialog add/edit -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogMode === 'edit' ? 'ແກ້ໄຂ' : 'ເພີ່ມ' }} ຂໍ້ມູນລາຄາຄຳ</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.date" label="ວັນທີ/ເດືອນ/ປີ" dense outlined />
          <v-text-field v-model="form.code" label="ລະຫັດລາຄາຄຳ" dense outlined />
          <v-text-field v-model="form.buyPrice" label="ລາຄາຊື້" dense outlined />
          <v-text-field v-model="form.sellPrice" label="ລາຄາຂາຍ" dense outlined />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" text @click="save">ບັນທຶກ</v-btn>
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

const onAdd = () => {
  dialogMode.value = 'add'
  form.value = { date: '', code: '', buyPrice: '', sellPrice: '' }
  dialog.value = true
}

const onEdit = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  editIndex.value = actualIndex
  dialogMode.value = 'edit'
  form.value = { ...prices.value[actualIndex] }
  dialog.value = true
}

const save = () => {
  if (dialogMode.value === 'edit' && editIndex.value !== -1) {
    prices.value[editIndex.value] = { ...form.value }
  } else {
    prices.value.push({ ...form.value })
  }
  dialog.value = false
}

const onDelete = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage + index
  prices.value.splice(actualIndex, 1)
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
</style>
