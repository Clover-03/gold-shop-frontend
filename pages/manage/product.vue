<template> 
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed', 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນສິນຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Search and Add -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          dense
          outlined
          hide-details
          class="flex-grow-1"
        >
          <template #append-inner>
            <v-img
              src="/icons/Search.png"
              width="20"
              height="20"
              cover
              class="cursor-pointer"
            />
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="ກອງຕາມສະຖານະ"
          outlined
          dense
          hide-details
          clearable
        />
      </v-col>
      <v-spacer />
      <v-btn color="green" class="text-white" rounded @click="onOpenAddDialog">
        ເພີ່ມ
      </v-btn>
    </v-row>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-package-variant-closed-remove</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນສິນຄ້າ</p>
      <p class="text-body-1 text-grey-lighten-1">ລອງກົດປຸ່ມ "ເພີ່ມ" ເພື່ອສ້າງສິນຄ້າໃໝ່.</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <v-table class="custom-table">
        <thead>
          <tr>
            <th>ລຳດັບ</th>
            <th @click="sortBy('code')" class="cursor-pointer">
              ລະຫັດສິນຄ້າ <v-icon>{{ getSortIcon('code') }}</v-icon>
            </th>
            <th @click="sortBy('name')" class="cursor-pointer">
              ຊື່ສິນຄ້າ <v-icon>{{ getSortIcon('name') }}</v-icon>
            </th>
            <th @click="sortBy('category')" class="cursor-pointer">
              ປະເພດສິນຄ້າ <v-icon>{{ getSortIcon('category') }}</v-icon>
            </th>
            <th @click="sortBy('weight')" class="cursor-pointer">
              ນ້ຳຫນັກ <v-icon>{{ getSortIcon('weight') }}</v-icon>
            </th>
            <th @click="sortBy('estimatePrice')" class="cursor-pointer">
              ລາຄາຮູບປະພັນ <v-icon>{{ getSortIcon('estimatePrice') }}</v-icon>
            </th>
            <th @click="sortBy('status')" class="cursor-pointer">
              ສະຖານະ <v-icon>{{ getSortIcon('status') }}</v-icon>
            </th>
            <th class="text-center">Option</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedProducts" :key="item.id">
            <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ getWeightText(item.weight) }}</td>
            <td>{{ formatCurrency(item.estimatePrice) }}</td>
            <td>
              <v-chip :color="getStatusColor(item.status)" size="small" dark>
                {{ item.status }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn icon variant="text" density="comfortable" @click="onEdit(item)">
                <v-img src="/icons/Edit.png" width="20" height="20" />
              </v-btn>
              <v-btn icon variant="text" density="comfortable" @click="onDelete(item)">
                <v-img src="/icons/Delete.png" width="20" height="20" />
              </v-btn>
              <v-btn v-if="item.status === 'REPURCHASED' || item.status === 'DAMAGED'" icon variant="text" density="comfortable" @click="markAsAvailable(item)">
                <v-icon color="green">mdi-check-circle</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Enhanced Pagination from orders.vue -->
      <div class="d-flex justify-center align-center mt-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filteredProducts.length / itemsPerPage)"
          :total-visible="7"
        >
          <template #prev="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="px-0"
              @click="goToPreviousPage"
            >
              <v-img
                src="/icons/Arrow.png"
                width="20"
                height="20"
                style="transform: rotate(90deg);"
                class="cursor-pointer"
              />
            </v-btn>
          </template>
          <template #next="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="px-0"
              @click="goToNextPage"
            >
              <v-img
                src="/icons/Arrow.png"
                width="20"
                height="20"
                style="transform: rotate(270deg);"
                class="cursor-pointer"
              />
            </v-btn>
          </template>
        </v-pagination>

        <!-- More Pages Menu -->
        <v-menu
          v-model="pageMenu"
          :close-on-content-click="true"
          location="bottom end"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              v-bind="props"
              class="ml-2"
            >
              <v-img
                src="/icons/more.png"
                width="24"
                height="24"
                class="cursor-pointer"
              />
            </v-btn>
          </template>
          <v-list>
                      <v-list-item
            v-for="n in Math.ceil(filteredProducts.length / itemsPerPage)"
            :key="n"
            :value="n"
            @click="page = n"
          >
              <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Add Dialog -->
    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">ເພີ່ມສິນຄ້າ</v-card-title>
        <v-form ref="addForm" @submit.prevent="saveAdd" v-model="addFormValid">
          <v-card-text>
            <v-text-field v-model="addItem.code" label="ລະຫັດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.name" label="ຊື່ສິນຄ້າ" dense outlined :rules="[required]" />
            <v-text-field v-model="addItem.category" label="ປະເພດສິນຄ້າ" dense outlined :rules="[required]" />
            <v-select
              v-model="addItem.weight"
              :items="weightOptions"
              item-title="text"
              item-value="value"
              label="ນ້ຳຫນັກ"
              dense outlined :rules="[required]"
            />
            <v-text-field
              :model-value="formatForInput(addItem.estimatePrice)"
              @update:model-value="value => addItem.estimatePrice = parseInput(value)"
              label="ຄ່າກຳເຫນັດ" 
              dense 
              outlined 
              :rules="[required]"
              type="text"
            />
            <v-text-field :model-value="formatCurrency(calculatedSellPrice)" label="ລາຄາຂາຍໂດຍປະມານ" dense outlined readonly disabled />
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
            <v-select
              v-model="editItem.weight"
              :items="weightOptions"
              item-title="text"
              item-value="value"
              label="ນ້ຳຫນັກ"
              dense outlined :rules="[required]"
            />
            <v-text-field
              :model-value="formatForInput(editItem.estimatePrice)"
              @update:model-value="value => editItem.estimatePrice = parseInput(value)"
              label="ຄ່າກຳເຫນັດ" 
              dense 
              outlined 
              :rules="[required]"
              type="text"
            />
            <v-text-field :model-value="formatCurrency(calculatedEditSellPrice)" label="ລາຄາຂາຍໂດຍປະມານ" dense outlined readonly disabled />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="btn-cancel" @click="editDialog = false">ຍົກເລີກ</v-btn>
            <v-btn class="btn-save" type="submit" :disabled="!editFormValid">ບັນທຶກ</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="dialog-title">ຢືນຢັນການລຶບ</v-card-title>
        <v-card-text>
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້າ "{{ itemToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" @click="deleteDialog = false">ບໍ່</v-btn>
          <v-btn class="btn-save" @click="confirmDelete">ແມ່ນ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '~/services/productApi';
import { fetchLatestPrice } from '~/services/priceApi';

const apiUrl = 'http://localhost:3001/api/products';
const pricesApiUrl = 'http://localhost:3001/api/prices/latest';

const isLoading = ref(true);
const isSaving = ref(false);
const latestGoldPrice = ref(null);
const sortKey = ref('name');
const sortDesc = ref(false);

const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const products = ref([])
const statusFilter = ref(null);
const statusOptions = [
  { text: 'ສິນຄ້າທັງໝົດ', value: null },
  { text: 'ພ້ອມຂາຍ', value: 'AVAILABLE' },
  { text: 'ຂາຍແລ້ວ', value: 'SOLD' },
  { text: 'ຊື້ຄືນແລ້ວ', value: 'REPURCHASED' },
  { text: 'ເສຍຫາຍ', value: 'DAMAGED' },
];

const addDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)

const weightOptions = ref([
  { text: '0.25 ບາດ', value: 'B0_25' },
  { text: '0.5 ບາດ', value: 'B0_5' },
  { text: '1 ບາດ', value: 'B1' },
  { text: '2 ບາດ', value: 'B2' },
  { text: '3 ບາດ', value: 'B3' },
  { text: '5 ບາດ', value: 'B5' },
  { text: '10 ບາດ', value: 'B10' },
]);

const defaultProduct = {
  code: '', name: '', category: '', weight: null, estimatePrice: ''
}

const addItem = ref({ ...defaultProduct })
const editItem = ref({})
const itemToDelete = ref(null)

const addForm = ref(null)
const editForm = ref(null)
const addFormValid = ref(false)
const editFormValid = ref(false)

const required = value => !!value || 'ຈຳເປັນຕ້ອງປ້ອນ'
// const numeric = value => /^\d+(,\d{3})*(\.\d+)?$/.test(value) || 'ຕ້ອງໃສ່ເປັນຕົວເລກ'

const calculatedSellPrice = computed(() => {
  if (!latestGoldPrice.value || !addItem.value.weight || !addItem.value.estimatePrice) {
    return 0;
  }
  const weightInGrams = convertWeightCodeToGrams(addItem.value.weight);
  const craftsmanshipFee = parseFloat(String(addItem.value.estimatePrice).replace(/,/g, '')) || 0;
  const goldSellPrice = latestGoldPrice.value.sellPrice;
  
  const calculatedPrice = ((goldSellPrice / 15.16) * weightInGrams) + craftsmanshipFee;
  return calculatedPrice;
});

const calculatedEditSellPrice = computed(() => {
  if (!latestGoldPrice.value || !editItem.value.weight || !editItem.value.estimatePrice) {
    return 0;
  }
  const weightInGrams = convertWeightCodeToGrams(editItem.value.weight);
  const craftsmanshipFee = parseFloat(String(editItem.value.estimatePrice).replace(/,/g, '')) || 0;
  const goldSellPrice = latestGoldPrice.value.sellPrice;
  
  const calculatedPrice = ((goldSellPrice / 15.16) * weightInGrams) + craftsmanshipFee;
  return calculatedPrice;
});

const sortedProducts = computed(() => {
  const key = sortKey.value;
  const order = sortDesc.value ? -1 : 1;
  
  return [...products.value].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    if (key === 'estimatePrice') {
      valA = parseFloat(String(valA).replace(/,/g, '')) || 0;
      valB = parseFloat(String(valB).replace(/,/g, '')) || 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }
    
    if (valA < valB) return order * -1;
    if (valA > valB) return order * 1;
    
    return 0;
  });
});

const filteredProducts = computed(() => {
  let data = sortedProducts.value;
  if (search.value) {
    const lowerSearch = search.value.toLowerCase();
    data = data.filter(p => 
      p.code.toLowerCase().includes(lowerSearch) || 
      p.name.toLowerCase().includes(lowerSearch)
    );
  }
  if (statusFilter.value) {
    data = data.filter(p => p.status === statusFilter.value);
  }
  return data;
})

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end)
})

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortKey.value = key;
    sortDesc.value = false;
  }
  page.value = 1;
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) {
    return 'mdi-sort';
  }
  return sortDesc.value ? 'mdi-sort-descending' : 'mdi-sort-ascending';
};

const getToken = () => localStorage.getItem('token');

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
}

const fetchLatestGoldPrice = async () => {
  try {
    const token = getToken();
    const response = await fetch(pricesApiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch latest gold price');
    latestGoldPrice.value = await response.json();
  } catch (error) {
    console.error('Error fetching latest gold price:', error);
    showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນລາຄາຄຳລ່າສຸດໄດ້', 'error');
  }
};

const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    const [productsData, priceData] = await Promise.all([
      fetchProducts(),
      fetchLatestPrice()
    ]);
    products.value = productsData;
    latestGoldPrice.value = priceData.latestPrice;
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInitialData);

const onOpenAddDialog = () => {
  editItem.value = null;
  addItem.value = { ...defaultProduct };
  addForm.value?.resetValidation();
  addFormValid.value = false;
  addDialog.value = true;
}

const cancelAdd = () => {
  addItem.value = { ...defaultProduct };
  addForm.value?.resetValidation();
  addFormValid.value = false;
  addDialog.value = false;
}

const onEdit = (item) => {
  editItem.value = { ...item };
  editForm.value?.resetValidation();
  editFormValid.value = false;
  editDialog.value = true;
}

const saveEdit = async () => {
  const { valid } = await editForm.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const token = getToken();
    const { id, createdAt, updatedAt, ...dataToUpdate } = editItem.value;
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataToUpdate)
    });
    if (!response.ok) throw new Error('Failed to update product');
    await fetchInitialData();
    editDialog.value = false;
    showSnackbar('ແກ້ໄຂສິນຄ້າສຳເລັດ');
  } catch (error) {
    console.error('Error updating product:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂ', 'error');
  } finally {
    isSaving.value = false;
  }
}

const saveAdd = async () => {
  const { valid } = await addForm.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const token = getToken();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addItem.value)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
    
    await fetchInitialData();
    page.value = 1;
    cancelAdd();
    showSnackbar('ເພີ່ມສິນຄ້າສຳເລັດ');
  } catch (error) {
    console.error('Error in saveAdd:', error.message);
    showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

const onDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return;

  isSaving.value = true;
  try {
    const token = getToken();
    const response = await fetch(`${apiUrl}/${itemToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    await fetchInitialData();
    deleteDialog.value = false;
    itemToDelete.value = null;
    showSnackbar('ລຶບສິນຄ້າສຳເລັດ');
  } catch (error) {
    console.error('Error deleting product:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບ', 'error');
  } finally {
    isSaving.value = false;
  }
}

const getWeightText = (value) => {
  const option = weightOptions.value.find(opt => opt.value === value);
  return option ? option.text : value;
};

const formatCurrency = (value) => {
  if (!value) return '0';
  const num = parseFloat(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('lo-LA').format(num);
};

const formatForInput = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseInput = (value) => {
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const pageMenu = ref(false);

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredProducts.value.length / itemsPerPage.value)
  if (page.value < totalPages) {
    page.value++
  }
}

const convertWeightCodeToGrams = (code) => {
  if (!code) return 0;
  const parts = code.split('B');
  if (parts.length < 2) return 0;
  const numericPart = parts[1].replace('_', '.');
  const weightInBaht = parseFloat(numericPart);
  if (isNaN(weightInBaht)) return 0;
  return weightInBaht * 15.16;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'AVAILABLE': return 'green';
    case 'SOLD': return 'red';
    case 'REPURCHASED': return 'blue';
    case 'DAMAGED': return 'orange';
    default: return 'grey';
  }
};

const markAsAvailable = async (item) => {
  if (item.status === 'AVAILABLE') {
    showSnackbar('ສິນຄ້າຢູ່ໃນສະຖານະພ້ອມຂາຍແລ້ວ', 'info');
    return;
  }
  try {
    const token = getToken();
    const response = await fetch(`${apiUrl}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...item, status: 'AVAILABLE' })
    });
    if (!response.ok) throw new Error('Failed to mark product as available');
    await fetchInitialData();
    showSnackbar('ປ່ຽນສະຖານະສິນຄ້າເປັນພ້ອມຂາຍສຳເລັດ', 'success');
  } catch (error) {
    console.error('Error marking product as available:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ', 'error');
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
.cursor-pointer {
  cursor: pointer;
}
th.cursor-pointer {
  user-select: none;
}
th.cursor-pointer:hover {
  background-color: rgba(0,0,0,0.05);
}
</style>
