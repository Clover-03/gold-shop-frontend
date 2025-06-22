<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ລາຍງານຂໍ້ມູນລູກຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Search and Export -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາລູກຄ້າ"
          dense
          outlined
          hide-details
          class="flex-grow-1"
        >
          <template #append-inner>
            <v-img src="/icons/Search.png" width="20" height="20" cover class="cursor-pointer" />
          </template>
        </v-text-field>
      </v-col>
      <v-spacer />
      <v-btn color="primary" @click="exportToExcel">Export Excel</v-btn>
    </v-row>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="customers.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-account-off-outline</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນລູກຄ້າ</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <v-table class="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ລະຫັດ</th>
            <th>ຊື່ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ທີ່ຢູ່</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedCustomers" :key="item.id">
            <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.address }}</td>
          </tr>
        </tbody>
      </v-table>

       <!-- Enhanced Pagination -->
      <div class="d-flex justify-center align-center mt-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filteredCustomers.length / itemsPerPage)"
          :total-visible="7"
        >
          <template #prev="{ props }">
            <v-btn variant="text" v-bind="props" class="px-0" @click="goToPreviousPage">
              <v-img src="/icons/Arrow.png" width="20" height="20" style="transform: rotate(90deg);" class="cursor-pointer" />
            </v-btn>
          </template>
          <template #next="{ props }">
            <v-btn variant="text" v-bind="props" class="px-0" @click="goToNextPage">
              <v-img src="/icons/Arrow.png" width="20" height="20" style="transform: rotate(270deg);" class="cursor-pointer" />
            </v-btn>
          </template>
        </v-pagination>
        <v-menu v-model="pageMenu" :close-on-content-click="true" location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="ml-2">
              <v-img src="/icons/more.png" width="24" height="24" class="cursor-pointer" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="n in Math.ceil(filteredCustomers.length / itemsPerPage)" :key="n" :value="n" @click="page = n">
              <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { fetchCustomers } from '~/services/customerApi';

const customers = ref([]);
const search = ref('');
const isLoading = ref(true);
const page = ref(1);
const itemsPerPage = ref(10);
const pageMenu = ref(false);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const filteredCustomers = computed(() => {
  if (!search.value) return customers.value;
  const lowerSearch = search.value.toLowerCase();
  return customers.value.filter(c =>
    c.name?.toLowerCase().includes(lowerSearch) ||
    c.code?.toLowerCase().includes(lowerSearch) ||
    c.phone?.toLowerCase().includes(lowerSearch) ||
    c.address?.toLowerCase().includes(lowerSearch)
  );
});

const paginatedCustomers = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCustomers.value.slice(start, end);
});

onMounted(async () => {
  isLoading.value = true;
  try {
    customers.value = await fetchCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
    showSnackbar(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
});

function exportToExcel() {
  try {
    if (filteredCustomers.value.length === 0) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນທີ່ຈະສົ່ງອອກ', 'warning');
      return;
    }
    const dataToExport = filteredCustomers.value.map((item, index) => ({
      '#': (page.value - 1) * itemsPerPage.value + index + 1,
      'ລະຫັດ': item.code,
      'ຊື່ລູກຄ້າ': item.name,
      'ເບີໂທ': item.phone,
      'ທີ່ຢູ່': item.address,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customers_report.xlsx');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ Excel', 'error');
  }
}

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--;
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredCustomers.value.length / itemsPerPage.value);
  if (page.value < totalPages) {
    page.value++;
  }
}
</script>

<style scoped>
.custom-table td,
.custom-table th {
  vertical-align: middle;
  padding-top: 10px;
  padding-bottom: 10px;
}
.cursor-pointer {
  cursor: pointer;
}
</style> 