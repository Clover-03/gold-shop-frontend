<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ລາຍງານຂໍ້ມູນການຂາຍສິນຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Filters and Export -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="3">
        <v-text-field v-model="startDate" label="ວັນທີເລີ່ມຕົ້ນ" type="date" dense outlined hide-details />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="endDate" label="ວັນທີสิ้นສຸດ" type="date" dense outlined hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="search" label="ຄົ້ນหา (ລູກຄ້າ, ສິນຄ້າ)" dense outlined hide-details prepend-inner-icon="mdi-magnify" />
      </v-col>
      <v-spacer />
      <v-col cols="12" md="2" class="text-right">
        <v-btn color="success" @click="exportToExcel">Export Excel</v-btn>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="paginatedSales.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-text-box-remove-outline</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນການຂາຍ</p>
      <p class="text-body-1 text-grey-lighten-1">ລອງປ່ຽນຕົວກອງ ຫຼື ຄົ້ນຫາใหມ່</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <v-table class="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ເລກທີໃບຂາຍ</th>
            <th>ວັນທີຂາຍ</th>
            <th>ລູກຄ້າ</th>
            <th>ສິນຄ້າ</th>
            <th>ຜູ້ຂາຍ</th>
            <th class="text-right">ລວມເງິນ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in paginatedSales" :key="sale.Sell_ID">
            <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ sale.Sell_ID }}</td>
            <td>{{ formatDate(sale.Sell_Date) }}</td>
            <td>{{ sale.Tb_Customer?.Cust_name || 'N/A' }}</td>
            <td>{{ sale.Tb_Product?.Pd_name || 'N/A' }}</td>
            <td>{{ sale.Tb_User?.username || 'N/A' }}</td>
            <td class="text-right">{{ formatCurrency(sale.Total) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-weight-bold bg-grey-lighten-4">
            <td :colspan="6" class="text-right">ຍອດລວມທັງໝົດ:</td>
            <td class="text-right">{{ formatCurrency(totalSalesValue) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <!-- Pagination -->
      <div class="d-flex justify-center align-center mt-4">
        <v-pagination v-model="page" :length="totalPages" :total-visible="7" />
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import useApi from '~/composables/useApi';

const api = useApi();
const allSales = ref([]);
const filteredSales = ref([]);
const isLoading = ref(true);
const page = ref(1);
const itemsPerPage = ref(10);
const startDate = ref('');
const endDate = ref('');
const search = ref('');

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const totalPages = computed(() => Math.ceil(filteredSales.value.length / itemsPerPage.value));

const paginatedSales = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSales.value.slice(start, end);
});

const totalSalesValue = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + Number(sale.Total), 0);
});

const fetchSales = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/sells');
    allSales.value = response.data;
    applyFilters(); // Apply initial filters
  } catch (error) {
    console.error('Error fetching sales:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSales);

const applyFilters = () => {
  let result = allSales.value;

  // Date filtering
  if (startDate.value) {
    const start = new Date(startDate.value);
    start.setHours(0, 0, 0, 0);
    result = result.filter(s => new Date(s.Sell_Date) >= start);
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    result = result.filter(s => new Date(s.Sell_Date) <= end);
  }

  // Search filtering
  if (search.value) {
    const lowerSearch = search.value.toLowerCase();
    result = result.filter(s =>
      s.Tb_Customer?.Cust_name?.toLowerCase().includes(lowerSearch) ||
      s.Tb_Product?.Pd_name?.toLowerCase().includes(lowerSearch)
    );
  }
  
  filteredSales.value = result;
  page.value = 1; // Reset to first page after filtering
};

// Watch for changes in filters and re-apply
watch([startDate, endDate, search], applyFilters);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-CA', options); // YYYY-MM-DD format
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(value);
};

const exportToExcel = () => {
  if (filteredSales.value.length === 0) {
    showSnackbar('ບໍ່ມີຂໍ້ມູນທີ່ຈະສົ່ງອອກ', 'warning');
    return;
  }
  const dataToExport = filteredSales.value.map((sale) => ({
    'ເລກທີໃບຂາຍ': sale.Sell_ID,
    'ວັນທີຂາຍ': formatDate(sale.Sell_Date),
    'ລູກຄ້າ': sale.Tb_Customer?.Cust_name || 'N/A',
    'ສິນຄ້າ': sale.Tb_Product?.Pd_name || 'N/A',
    'ຜູ້ຂາຍ': sale.Tb_User?.username || 'N/A',
    'ລວມເງິນ (LAK)': sale.Total,
  }));
  
  // Add total row
  const totalRow = {
    'ເລກທີໃບຂາຍ': 'ຍອດລວມທັງໝົດ',
    'ລວມເງິນ (LAK)': totalSalesValue.value
  };

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  XLSX.utils.sheet_add_json(ws, [totalRow], { origin: -1, skipHeader: true });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
  XLSX.writeFile(wb, 'sales_report.xlsx');
};
</script>

<style scoped>
.custom-table td,
.custom-table th {
  vertical-align: middle;
}
</style> 