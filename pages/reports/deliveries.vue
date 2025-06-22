<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed';">
      ລາຍງານຂໍ້ມູນການນຳສົ່ງສິນຄ້າ
    </h2>

    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ (ID, ຊື່ຜູ້ສະໜອງ)"
          dense
          outlined
          hide-details
        />
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
      <v-col cols="auto">
        <v-btn color="primary" @click="exportToExcel" prepend-icon="mdi-microsoft-excel">
          Export to Excel
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <v-data-table
      v-else
      :headers="headers"
      :items="paginatedInvoices"
      :items-per-page="-1"
      hide-default-footer
      class="elevation-1"
    >
      <template #[`item.index`]="{ index }">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </template>
      <template #[`item.Inv_Date`]="{ item }">
        {{ formatDate(item.Inv_Date) }}
      </template>
      <template #[`item.Total_Price`]="{ item }">
        {{ formatCurrency(item.Total_Price) }}
      </template>
      <template #[`item.Status`]="{ item }">
        <v-chip :color="getStatusColor(item.Status)" size="small" dark>{{ item.Status }}</v-chip>
      </template>
      <template #no-data>
        <div class="text-center py-4">
          <p>ບໍ່ມີຂໍ້ມູນ</p>
        </div>
      </template>
    </v-data-table>

    <!-- Enhanced Pagination -->
    <div v-if="!isLoading && filteredInvoices.length > 0" class="d-flex justify-center align-center mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredInvoices.length / itemsPerPage)"
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
          <v-list-item v-for="n in Math.ceil(filteredInvoices.length / itemsPerPage)" :key="n" :value="n" @click="page = n">
            <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchInvoices } from '~/services/invoiceApi';
import { fetchOrders } from '~/services/orderApi';
import * as XLSX from 'xlsx';

const isLoading = ref(true);
const search = ref('');
const statusFilter = ref(null);
const page = ref(1);
const itemsPerPage = ref(10);
const pageMenu = ref(false);

const invoices = ref([]);
const statusOptions = ['Pending', 'Completed', 'Cancelled'];

const headers = [
  { title: 'ລຳດັບ', value: 'index', sortable: false },
  { title: 'ID ໃບນຳສົ່ງ', value: 'Inv_ID' },
  { title: 'ID ອໍເດີ', value: 'Order_ID' },
  { title: 'ຜູ່ສະໜອງ', value: 'Sup_name' },
  { title: 'ວັນທີຮັບ', value: 'Inv_Date' },
  { title: 'ຍອດລວມ', value: 'Total_Price' },
  { title: 'ສະຖານະ', value: 'Status' },
];

const loadInitialData = async () => {
  isLoading.value = true;
  try {
    const [invoicesResponse, ordersResponse] = await Promise.all([
      fetchInvoices(),
      fetchOrders(),
    ]);

    const invoicesData = invoicesResponse || [];
    const ordersData = ordersResponse?.orders || [];
    const ordersMap = new Map(ordersData.map(order => [order.Order_ID, order.Sup_name]));

    invoices.value = invoicesData.map(invoice => ({
      ...invoice,
      Sup_name: ordersMap.get(invoice.Order_ID) || 'N/A',
    }));
  } catch (error) {
    console.error("Error fetching initial data:", error);
  } finally {
    isLoading.value = false;
  }
};

const filteredInvoices = computed(() => {
  let filtered = invoices.value;
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    filtered = filtered.filter(inv =>
      (inv.Sup_name?.toLowerCase().includes(searchTerm)) ||
      (inv.Inv_ID?.toString().includes(searchTerm))
    );
  }
  if (statusFilter.value) {
    filtered = filtered.filter(inv => inv.Status === statusFilter.value);
  }
  return filtered;
});

const paginatedInvoices = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInvoices.value.slice(start, end);
});

watch([search, statusFilter], () => {
  page.value = 1;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-CA');
};

const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const getStatusColor = (status) => {
  const map = { 'Completed': 'green', 'Pending': 'orange', 'Cancelled': 'red' };
  return map[status] || 'grey';
};

function goToPreviousPage() {
  if (page.value > 1) page.value--;
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredInvoices.value.length / itemsPerPage.value);
  if (page.value < totalPages) page.value++;
}

const exportToExcel = () => {
  const dataToExport = filteredInvoices.value.map((item, index) => ({
    'ລຳດັບ': (page.value - 1) * itemsPerPage.value + index + 1,
    'ID ໃບນຳສົ່ງ': item.Inv_ID,
    'ID ອໍເດີ': item.Order_ID,
    'ຜູ່ສະໜອງ': item.Sup_name,
    'ວັນທີຮັບ': formatDate(item.Inv_Date),
    'ຍອດລວມ': item.Total_Price,
    'ສະຖານະ': item.Status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deliveries Report');
  XLSX.writeFile(workbook, 'Deliveries_Report.xlsx');
};

onMounted(loadInitialData);
</script>

<style scoped>
/* Add any specific styles for this page */
</style> 