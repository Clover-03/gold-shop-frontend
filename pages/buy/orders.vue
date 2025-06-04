<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການສັ່ງຊື້
    </h2>

    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາຊື່ຜູ້ສະໜອງ / ສະຖານະ"
          dense
          outlined
        />
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn color="primary" @click="openDialog">+ ເພີ່ມການສັ່ງຊື້</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredOrders"
      :items-per-page="itemsPerPage"
      show-current-page
      show-select
      :items-per-page-options="[5, 10, 20, 50]"
      class="elevation-1"
      item-value="Order_ID"
    >
      <template #[`item.index`]="{ index }">
        {{ index + 1 }}
      </template>

      <template #[`item.Order_Date`]="{ item }">
        {{ formatDate(item.Order_Date) }}
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)" class="text-white" dark style="border-radius: 16px;">
          {{ item.status }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn small color="info" @click="viewProducts(item.Order_ID)">ເບິ່ງສິນຄ້າ</v-btn>
        <v-btn small color="primary" @click="editOrder(item)">ແກ້ໄຂ</v-btn>
        <v-btn small color="error" @click="deleteOrder(item.Order_ID)">ລຶບ</v-btn>
      </template>
    </v-data-table>

    <!-- Dialog: Add/Edit Order -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editIndex === -1 ? 'ເພີ່ມການສັ່ງຊື້' : 'ແກ້ໄຂການສັ່ງຊື້' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-menu
              v-model="datePickerMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="displayDate"
                  label="ວັນທີສັ່ງ"
                  readonly
                  v-bind="props"
                  outlined dense
                />
              </template>
              <v-date-picker
                v-model="form.Order_Date"
                @update:model-value="handleDateSelect"
              />
            </v-menu>

            <v-select
              v-model="form.Sup_ID"
              :items="suppliers"
              item-title="Sup_name"
              item-value="Sup_ID"
              label="ເລືອກຜູ້ສະໜອງ"
              outlined dense clearable
            />

            <v-select
              v-model="form.status"
              :items="['ສົ່ງແລ້ວ', 'ລໍຖ້າສົ່ງ', 'ຍົກເລີກ']"
              label="ສະຖານະ"
              outlined dense clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn class="btn-cancel" text @click="dialog = false">ຍົກເລີກ</v-btn>
          <v-btn class="btn-save" @click="saveOrder">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Product List -->
    <v-dialog v-model="productDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">ລາຍການສິນຄ້າ</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="product in selectedProducts" :key="product.Pd_ID">
              <v-list-item-content>
                <v-list-item-title>{{ product.Pd_name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-alert v-if="selectedProducts.length === 0" type="info" text>
              ບໍ່ມີສິນຄ້າໃນການສັ່ງຊື້ນີ້
            </v-alert>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="productDialog = false">ປິດ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const snackbar = ref(false)
const snackbarMessage = ref('')
const dialog = ref(false)
const productDialog = ref(false)
const datePickerMenu = ref(false)
const search = ref('')
const itemsPerPage = ref(10)
const editIndex = ref(-1)

const formRef = ref(null)
const form = ref({
  Order_Date: '',
  Sup_ID: '',
  status: ''
})

const suppliers = ref([
  { Sup_ID: 'S001', Sup_name: 'ຜູ້ສະໜອງ A' },
  { Sup_ID: 'S002', Sup_name: 'ຜູ້ສະໜອງ B' }
])

const orders = ref([
  {
    Order_ID: 1,
    Order_Date: '2025-06-01',
    Sup_ID: 'S001',
    Sup_name: 'ຜູ້ສະໜອງ A',
    status: 'ສົ່ງແລ້ວ'
  },
  {
    Order_ID: 2,
    Order_Date: '2025-06-03',
    Sup_ID: 'S002',
    Sup_name: 'ຜູ້ສະໜອງ B',
    status: 'ຍົກເລີກ'
  }
])

const allProducts = ref([
  { Pd_ID: 'P001', Pd_name: 'ສາຍຄໍທອງ', Order_ID: 1 },
  { Pd_ID: 'P002', Pd_name: 'ສາຍຂ້ອມມື', Order_ID: 1 },
  { Pd_ID: 'P003', Pd_name: 'ຕຸ້ມຫູທອງ', Order_ID: 2 }
])

const selectedProducts = ref([])

const displayDate = ref('')

function openDialog() {
  dialog.value = true
  form.value = {
    Order_Date: '',
    Sup_ID: '',
    status: ''
  }
  displayDate.value = ''
  editIndex.value = -1
}

function editOrder(item) {
  form.value = { ...item }
  displayDate.value = formatDate(item.Order_Date)
  editIndex.value = orders.value.findIndex(o => o.Order_ID === item.Order_ID)
  dialog.value = true
}

function saveOrder() {
  if (!form.value.Order_Date || !form.value.Sup_ID || !form.value.status) {
    snackbarMessage.value = 'ກະລຸນາກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ'
    snackbar.value = true
    return
  }

  const sup = suppliers.value.find(s => s.Sup_ID === form.value.Sup_ID)
  form.value.Sup_name = sup?.Sup_name || ''

  if (editIndex.value !== -1) {
    orders.value[editIndex.value] = { ...form.value }
    snackbarMessage.value = 'ແກ້ໄຂຂໍ້ມູນແລ້ວ'
  } else {
    orders.value.push({
      Order_ID: orders.value.length + 1,
      ...form.value
    })
    snackbarMessage.value = 'ບັນທຶກຂໍ້ມູນແລ້ວ'
  }

  dialog.value = false
  snackbar.value = true
}

function deleteOrder(id) {
  orders.value = orders.value.filter(order => order.Order_ID !== id)
  snackbarMessage.value = 'ລຶບຄຳສັ່ງຊື້ແລ້ວ'
  snackbar.value = true
}

function viewProducts(orderId) {
  selectedProducts.value = allProducts.value.filter(p => p.Order_ID === orderId)
  productDialog.value = true
}

function handleDateSelect(date) {
  form.value.Order_Date = date
  displayDate.value = formatDate(date)
  datePickerMenu.value = false
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}/${d.getFullYear()}`
}

function getStatusColor(status) {
  switch (status) {
    case 'ສົ່ງແລ້ວ': return 'green'
    case 'ລໍຖ້າສົ່ງ': return 'orange'
    case 'ຍົກເລີກ': return 'red'
    default: return 'grey'
  }
}

const headers = [
  { title: 'ລຳດັບ', value: 'index', sortable: false },
  { title: 'ວັນທີສັ່ງ', value: 'Order_Date' },
  { title: 'ຜູ້ສະໜອງ', value: 'Sup_name' },
  { title: 'ສະຖານະ', value: 'status' },
  { title: 'ເບິ່ງສິນຄ້າ', value: 'actions', sortable: false }
]

const filteredOrders = computed(() => {
  if (!search.value) return orders.value
  return orders.value.filter(order =>
    order.Sup_name.includes(search.value) ||
    order.status.includes(search.value)
  )
})
</script>

<style scoped>
.dialog-title {
  background-color: #365a76;
  color: white;
  font-weight: bold;
  padding: 16px;
}
.btn-cancel {
  background-color: #f44336 !important;
  color: white !important;
  margin-right: 8px;
}
.btn-save {
  background-color: #4caf50 !important;
  color: white !important;
}
</style>
