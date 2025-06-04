<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນລູກຄ້າ
    </h2>

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
      <v-btn color="green" class="text-white" rounded @click="onAdd">
        ເພີ່ມ
      </v-btn>
    </v-row>

    <!-- Table -->
    <v-table class="custom-table">
      <thead>
        <tr>
          <th>ລະຫັດລູກຄ້າ</th>
          <th>ຊື່ລູກຄ້າ</th>
          <th>ເບີໂທ</th>
          <th>ທີ່ຢູ່</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredCustomers" :key="index">
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
              width="20"
              height="20"
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
        <v-card-title>ແກ້ໄຂຂໍ້ມູນລູກຄ້າ</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-text-field
              v-model="form.code"
              :rules="[rules.required]"
              label="ລະຫັດລູກຄ້າ"
              dense outlined
            />
            <v-text-field
              v-model="form.name"
              :rules="[rules.required]"
              label="ຊື່ລູກຄ້າ"
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
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">ຍົກເລີກ</v-btn>
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

const customers = ref([
  {
    code: 'C0001',
    name: 'ນາງສຸພິດຕາ ລິດດິແພງ',
    phone: '205555555',
    address: 'ບ້ານຝາຍ ເມືອງໄຊເສດຖາ ມະຫາສາລະຄາມ'
  }
])

const dialog = ref(false)
const form = ref({})
const formValid = ref(false)
const formRef = ref()
const editIndex = ref(-1)

const rules = {
  required: v => !!v || 'ຈຳເປັນຕ້ອງປ້ອນ',
  phone: v => /^\d{8,15}$/.test(v) || 'ເບີໂທບໍ່ຖືກຕ້ອງ'
}

const pageCount = computed(() => Math.ceil(customers.value.length / itemsPerPage))

const filteredCustomers = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return customers.value
    .filter(c => c.code.includes(search.value) || c.name.includes(search.value))
    .slice(start, start + itemsPerPage)
})

const onSearch = () => {
  console.log('Search:', search.value)
}

const onAdd = () => {
  form.value = { code: '', name: '', phone: '', address: '' }
  editIndex.value = -1
  dialog.value = true
}

const onEdit = (index) => {
  const actual = (page.value - 1) * itemsPerPage + index
  form.value = { ...customers.value[actual] }
  editIndex.value = actual
  dialog.value = true
}

const onDelete = (index) => {
  const actual = (page.value - 1) * itemsPerPage + index
  customers.value.splice(actual, 1)
}

const saveEdit = () => {
  if (formRef.value?.validate()) {
    if (editIndex.value === -1) {
      customers.value.push({ ...form.value })
    } else {
      customers.value[editIndex.value] = { ...form.value }
    }
    dialog.value = false
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
  padding: 10px;
}
</style>
