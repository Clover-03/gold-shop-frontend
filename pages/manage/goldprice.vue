<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="color: #1e1e1e">
      ຈັດການຂໍ້ມູນລາຄາຄຳ
    </h2>

    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Modern Filter Panel -->
    <div class="filter-panel-container mb-6">
      <!-- Header Section -->
      <div class="filter-header">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-filter-variant</v-icon>
            <h3 class="filter-title">ຄົ້ນຫາ ແລະ ກັ່ນຕອງຂໍ້ມູນ</h3>
          </div>
          <div class="d-flex align-center gap-3">
            <v-chip
              v-if="hasActiveFilters"
              color="success"
              variant="flat"
              prepend-icon="mdi-check-circle"
              class="results-chip"
            >
              {{ filteredPrices.length }} ລາຍການ
            </v-chip>
            <v-btn
              color="primary"
              variant="elevated"
              class="add-btn"
              @click="onOpenAddDialog"
              prepend-icon="mdi-plus"
            >
              ເພີ່ມລາຄາໃໝ່
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <v-card class="quick-actions-card" elevation="3">
        <v-card-text class="pa-4">
          <div class="quick-actions-grid">
            <v-btn
              class="quick-action-btn today"
              variant="flat"
              @click="setQuickFilter('today')"
              prepend-icon="mdi-calendar-today"
            >
              ມື້ນີ້
            </v-btn>
            <v-btn
              class="quick-action-btn yesterday"
              variant="flat"
              @click="setQuickFilter('yesterday')"
              prepend-icon="mdi-calendar-minus"
            >
              ມື້ວານ
            </v-btn>
            <v-btn
              class="quick-action-btn week"
              variant="flat"
              @click="setQuickFilter('week')"
              prepend-icon="mdi-calendar-week"
            >
              7 ມື້
            </v-btn>
            <v-btn
              class="quick-action-btn month"
              variant="flat"
              @click="setQuickFilter('month')"
              prepend-icon="mdi-calendar-month"
            >
              30 ມື້
            </v-btn>
            <v-btn
              class="quick-action-btn clear"
              variant="flat"
              color="error"
              @click="clearAllFilters"
              prepend-icon="mdi-refresh"
            >
              ລ້າງຟິວເຕີ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Advanced Filters -->
      <v-card class="advanced-filters-card mt-4" elevation="3">
        <v-card-title class="advanced-filter-header">
          <v-btn
            @click="showFilters = !showFilters"
            variant="text"
            class="expand-btn"
          >
            <v-icon class="mr-2">{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            ຕົວເລືອກການກັ່ນຕອງ
          </v-btn>
        </v-card-title>
        
        <v-expand-transition>
          <v-card-text v-show="showFilters" class="advanced-filter-content">
            <v-row>
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-text-field
                  v-model="filters.dateFrom"
                  label="ວັນທີເລີ່ມຕົ້ນ"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-text-field
                  v-model="filters.dateTo"
                  label="ວັນທີສິ້ນສຸດ"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-text-field
                  v-model="filters.minPrice"
                  label="ລາຄາຕ່ຳສຸດ"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="2">
        <v-text-field
                  v-model="filters.maxPrice"
                  label="ລາຄາສູງສຸດ"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-select
                  v-model="filters.priceType"
                  :items="priceTypeOptions"
                  label="ປະເພດລາຄາ"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-select
                  v-model="filters.sortBy"
                  :items="sortOptions"
                  label="ຈັດລຽງຕາມ"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:model-value="applyFilters"
                />
      </v-col>
    </v-row>
          </v-card-text>
        </v-expand-transition>
      </v-card>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="prices.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-currency-usd</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນລາຄາຄຳ</p>
      <p class="text-body-1 text-grey-lighten-1">ລອງກົດປຸ່ມ "ເພີ່ມ" ເພື່ອສ້າງຂໍ້ມູນລາຄາໃໝ່.</p>
    </div>

    <!-- Data Table -->
    <div v-else>
    <v-table class="custom-table">
      <thead>
        <tr>
            <th>ລຳດັບ</th>
            <th>ວັນທີ ແລະ ເວລາ</th>
            <th>ລາຄາຊື້ (ກີບ)</th>
            <th>ລາຄາຂາຍ (ກີບ)</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
          <tr v-for="(item, index) in paginatedPrices" :key="item.id">
            <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>{{ formatCurrency(item.buyPrice) }}</td>
            <td>{{ formatCurrency(item.sellPrice) }}</td>
            <td class="text-center">
              <v-btn icon variant="text" density="comfortable" @click="onEdit(index)">
                <v-img src="/icons/Edit.png" width="20" height="20" />
              </v-btn>
              <v-btn icon variant="text" density="comfortable" @click="onDelete(index)">
                <v-img src="/icons/Delete.png" width="20" height="20" />
              </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

      <!-- Enhanced Pagination from orders.vue -->
      <div class="d-flex justify-center align-center mt-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filteredPrices.length / itemsPerPage)"
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
              v-for="n in Math.ceil(filteredPrices.length / itemsPerPage)"
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

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">{{ dialogMode === 'edit' ? 'ແກ້ໄຂ' : 'ເພີ່ມ' }} ຂໍ້ມູນລາຄາຄຳ</v-card-title>
        <v-form ref="formRef" @submit.prevent="save" v-model="formValid">
          <v-card-text>
            <v-text-field 
              v-model="form.date" 
              label="ວັນທີ ແລະ ເວລາ (ບໍ່ບັງຄັບ)" 
              type="datetime-local"
              dense 
              outlined 
              hint="ຖ້າບໍ່ລະບຸຈະໃຊ້ວັນທີແລະເວລາປັດຈຸບັນ"
              persistent-hint
            />
            <v-text-field
              :model-value="formatForInput(form.buyPrice)"
              @update:model-value="value => form.buyPrice = parseInput(value)"
              label="ລາຄາຊື້"
              dense
              outlined
              :rules="[required]"
              type="text"
            />
            <v-text-field
              :model-value="formatForInput(form.sellPrice)"
              @update:model-value="value => form.sellPrice = parseInput(value)"
              label="ລາຄາຂາຍ"
              dense
              outlined
              :rules="[required]"
              type="text"
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
import { ref, computed, onMounted } from 'vue'
import { 
  fetchPrices as apiFetchPrices, 
  createPrice as apiCreatePrice, 
  updatePrice as apiUpdatePrice, 
  deletePrice as apiDeletePrice 
} from '~/services/priceApi';

const isLoading = ref(true);

const page = ref(1)
const itemsPerPage = ref(8)
const snackbar = ref(false)
const snackbarMessage = ref('')

const prices = ref([])

// Filter System
const showFilters = ref(false)
const filters = ref({
  dateFrom: '',
  dateTo: '',
  minPrice: '',
  maxPrice: '',
  priceType: 'all',
  sortBy: 'date_desc'
})

// Filter options
const priceTypeOptions = [
  { title: 'ທັງໝົດ', value: 'all' },
  { title: 'ລາຄາຊື້', value: 'buy' },
  { title: 'ລາຄາຂາຍ', value: 'sell' }
]

const sortOptions = [
  { title: 'ວັນທີຫຼ້າສຸດກ່ອນ', value: 'date_desc' },
  { title: 'ວັນທີເກົ່າກ່ອນ', value: 'date_asc' },
  { title: 'ລາຄາຊື້ສູງສຸດ', value: 'buy_desc' },
  { title: 'ລາຄາຊື້ຕ່ຳສຸດ', value: 'buy_asc' },
  { title: 'ລາຄາຂາຍສູງສຸດ', value: 'sell_desc' },
  { title: 'ລາຄາຂາຍຕ່ຳສຸດ', value: 'sell_asc' }
]

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.dateFrom ||
    filters.value.dateTo ||
    filters.value.minPrice ||
    filters.value.maxPrice ||
    filters.value.priceType !== 'all' ||
    filters.value.sortBy !== 'date_desc'
  )
})

const filteredPrices = computed(() => {
  let result = [...prices.value]

  // Date range filter
  if (filters.value.dateFrom) {
    // Appending 'T00:00:00' ensures the date is parsed in the local timezone, not UTC.
    const fromDate = new Date(filters.value.dateFrom + 'T00:00:00');
    if (!isNaN(fromDate.getTime())) {
      result = result.filter(price => new Date(price.date) >= fromDate);
    }
  }

  if (filters.value.dateTo) {
    // Appending 'T23:59:59' ensures we cover the entire 'to' date.
    const toDate = new Date(filters.value.dateTo + 'T23:59:59');
    if (!isNaN(toDate.getTime())) {
      result = result.filter(price => new Date(price.date) <= toDate);
    }
  }

  // Price range filter
  if (filters.value.minPrice) {
    const minPrice = parseFloat(filters.value.minPrice)
    if (filters.value.priceType === 'buy') {
      result = result.filter(price => price.buyPrice >= minPrice)
    } else if (filters.value.priceType === 'sell') {
      result = result.filter(price => price.sellPrice >= minPrice)
    } else {
      result = result.filter(price => price.buyPrice >= minPrice || price.sellPrice >= minPrice)
    }
  }

  if (filters.value.maxPrice) {
    const maxPrice = parseFloat(filters.value.maxPrice)
    if (filters.value.priceType === 'buy') {
      result = result.filter(price => price.buyPrice <= maxPrice)
    } else if (filters.value.priceType === 'sell') {
      result = result.filter(price => price.sellPrice <= maxPrice)
    } else {
      result = result.filter(price => price.buyPrice <= maxPrice || price.sellPrice <= maxPrice)
    }
  }

  // Sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'date_asc':
        return new Date(a.date) - new Date(b.date)
      case 'date_desc':
        return new Date(b.date) - new Date(a.date)
      case 'buy_asc':
        return a.buyPrice - b.buyPrice
      case 'buy_desc':
        return b.buyPrice - a.buyPrice
      case 'sell_asc':
        return a.sellPrice - b.sellPrice
      case 'sell_desc':
        return b.sellPrice - a.sellPrice
      default:
        return new Date(b.date) - new Date(a.date)
    }
  })

  return result
})

const paginatedPrices = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPrices.value.slice(start, end)
})

const dialog = ref(false)
const dialogMode = ref('add')
const form = ref({ date: '', buyPrice: '', sellPrice: '' })
const editIndex = ref(-1)
const formRef = ref(null)
const formValid = ref(false)
const pageMenu = ref(false)

const required = value => !!value || 'ຈຳເປັນຕ້ອງປ້ອນ'
const numeric = value => /^\d+(,\d{3})*(\.\d+)?$/.test(value) || 'ຕ້ອງໃສ່ເປັນຕົວເລກ'

const showSnackbar = (message, color = 'success') => {
  snackbarMessage.value = message;
  snackbar.value = true;
}

const fetchPrices = async () => {
  isLoading.value = true;
  try {
    const data = await apiFetchPrices();
    prices.value = data || []; // Handle both paginated and simple response
  } catch (error) {
    console.error('Error fetching prices:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ', 'error');
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchPrices);

const onOpenAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  dialog.value = true
}

const resetForm = () => {
  form.value = { date: '', buyPrice: '', sellPrice: '' }
  formRef.value?.resetValidation()
  formValid.value = false
}

const onEdit = (index) => {
  const actualIndex = (page.value - 1) * itemsPerPage.value + index
  const price = prices.value[actualIndex]
  editIndex.value = price.id
  dialogMode.value = 'edit'
  
  // Format the date for datetime-local input (YYYY-MM-DDTHH:mm)
  const dateObj = new Date(price.date)
  const formattedDate = dateObj.toISOString().slice(0, 16) // Remove seconds and timezone
  
  form.value = { 
    date: formattedDate,
    buyPrice: price.buyPrice,
    sellPrice: price.sellPrice
  }
  formRef.value?.resetValidation()
  formValid.value = true
  dialog.value = true
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const requestData = {
      buyPrice: parseInput(form.value.buyPrice),
      sellPrice: parseInput(form.value.sellPrice)
    };

    if (form.value.date && form.value.date.trim() !== '') {
      try {
        const dateObj = new Date(form.value.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('ຮູບແບບວັນທີບໍ່ຖືກຕ້ອງ');
        }
        requestData.date = dateObj.toISOString();
      } catch (error) {
        throw new Error('ຮູບແບບວັນທີແລະເວລາບໍ່ຖືກຕ້ອງ');
      }
    }
    
    if (dialogMode.value === 'edit' && editIndex.value !== -1) {
      await apiUpdatePrice(editIndex.value, requestData);
    } else {
      await apiCreatePrice(requestData);
    }

    await fetchPrices();
    if (dialogMode.value === 'add') {
      page.value = 1; // Reset to first page after adding new price
    }
    dialog.value = false;
    showSnackbar(dialogMode.value === 'edit' ? 'ແກ້ໄຂລາຄາສຳເລັດ' : 'ເພີ່ມລາຄາສຳເລັດ');
  } catch (error) {
    console.error('Error saving price:', error);
    showSnackbar(error.message || 'An unknown error occurred', 'error');
  }
}

const onDelete = async (index) => {
  const actualIndexInFiltered = (page.value - 1) * itemsPerPage.value + index;
  const priceToDelete = paginatedPrices.value[index];

  if (!priceToDelete || !confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນລາຄານີ້?')) return;

  try {
    await apiDeletePrice(priceToDelete.id);
    await fetchPrices();
    showSnackbar('ລຶບລາຄາສຳເລັດ');
  } catch (error) {
    console.error('Error deleting price:', error);
    showSnackbar(error.message || 'An unknown error occurred', 'error');
  }
}

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredPrices.value.length / itemsPerPage.value)
  if (page.value < totalPages) {
    page.value++
  }
}

// Filter Functions
const applyFilters = () => {
  page.value = 1 // Reset to first page when filters change
}

const setQuickFilter = (type) => {
  const today = new Date()
  const formatDate = (date) => date.toISOString().split('T')[0]
  
  // Clear existing filters first
  clearAllFilters()
  
  switch (type) {
    case 'today':
      filters.value.dateFrom = formatDate(today)
      filters.value.dateTo = formatDate(today)
      break
      
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      filters.value.dateFrom = formatDate(yesterday)
      filters.value.dateTo = formatDate(yesterday)
      break
      
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      filters.value.dateFrom = formatDate(weekAgo)
      filters.value.dateTo = formatDate(today)
      break
      
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filters.value.dateFrom = formatDate(monthAgo)
      filters.value.dateTo = formatDate(today)
      break
  }
  
  applyFilters()
}

const clearAllFilters = () => {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
    priceType: 'all',
    sortBy: 'date_desc'
  }
  applyFilters()
}

// Helper function to format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }); // MM/DD/YYYY HH:mm:ss format
}

// Helper function to format currency
const formatCurrency = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const formatForInput = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseInput = (value) => {
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};
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
/* Make datetime column wider */
.custom-table th:nth-child(2),
.custom-table td:nth-child(2) {
  min-width: 180px;
  font-size: 0.9em;
}
/* Responsive datetime display */
@media (max-width: 768px) {
  .custom-table th:nth-child(2),
  .custom-table td:nth-child(2) {
    font-size: 0.8em;
    min-width: 150px;
  }
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

/* Modern Filter Panel Styles */
.filter-panel-container {
  padding: 0;
}

/* Header Section */
.filter-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.filter-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.results-chip {
  font-weight: 600;
  font-size: 0.9rem;
  height: 32px;
}

.add-btn {
  height: 44px;
  font-weight: 600;
  text-transform: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* Quick Actions Card */
.quick-actions-card {
  border-radius: 0 0 16px 16px;
  border-top: none;
  background: linear-gradient(145deg, #f8f9ff 0%, #e8f0ff 100%);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 8px 0;
}

.quick-action-btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-action-btn.yesterday {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.quick-action-btn.week {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.quick-action-btn.month {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.quick-action-btn.clear {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.quick-action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Advanced Filters Card */
.advanced-filters-card {
  border-radius: 16px;
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #e3f2fd;
}

.advanced-filter-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 1px solid #e1e8ed;
  padding: 16px 24px;
}

.expand-btn {
  font-weight: 600;
  text-transform: none;
  color: #546e7a;
  font-size: 1rem;
}

.advanced-filter-content {
  background: #fafbfc;
  padding: 24px;
}

/* Input Field Enhancements */
.v-text-field .v-field, .v-select .v-field {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover, .v-select .v-field:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-text-field .v-field--focused {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .quick-action-btn {
    height: 44px;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .filter-header {
    padding: 16px 20px;
  }
  
  .filter-title {
    font-size: 1.25rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .quick-action-btn {
    height: 40px;
    font-size: 0.8rem;
  }
  
  .advanced-filter-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .filter-header {
    padding: 12px 16px;
  }
  
  .filter-title {
    font-size: 1.1rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .add-btn {
    height: 40px;
    font-size: 0.85rem;
  }
  
  .results-chip {
    height: 28px;
    font-size: 0.8rem;
  }
}

/* Animation Classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Accessibility */
.quick-action-btn:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}
</style>
