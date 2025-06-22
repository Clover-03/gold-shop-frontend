<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed', 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການຊື້ຄືນສິນຄ້າ
    </h2>
    
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
      <v-spacer />
      <v-btn color="primary" class="text-white" rounded to="/buy/returns/add">
        <v-icon left>mdi-plus</v-icon>
        ເພີ່ມລາຍການຊື້ຄືນ
      </v-btn>
    </v-row>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="repurchases.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-package-variant-closed-remove</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນການຊື້ຄືນ</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <v-table class="custom-table">
        <thead>
          <tr>
            <th>ລຳດັບ</th>
            <th>ລູກຄ້າ</th>
            <th>ພະນັກງານ</th>
            <th>ວັນທີ</th>
            <th>ລາຄາສະເໜີ</th>
            <th>ຈຳນວນສິນຄ້າ</th>
            <th class="text-center">Option</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedRepurchases" :key="item.Re_ID">
            <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ item.Tb_Customer?.Cust_name || 'N/A' }}</td>
            <td>{{ item.Tb_User?.username || 'N/A' }}</td>
            <td>{{ new Date(item.Re_date).toLocaleDateString('lo-LA') }}</td>
            <td>{{ formatCurrency(item.Repurchase_Price) }}</td>
            <td>{{ item.Tb_Product?.length || 0 }}</td>
            <td class="text-center">
              <v-icon size="small" color="info" class="mr-2" @click="showDetails(item)">mdi-eye</v-icon>
              <v-icon size="small" color="primary" class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
              <v-icon size="small" color="error" @click="deleteItem(item)">mdi-delete</v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Enhanced Pagination -->
      <div class="d-flex justify-center align-center mt-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filteredRepurchases.length / itemsPerPage)"
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
            <v-list-item v-for="n in Math.ceil(filteredRepurchases.length / itemsPerPage)" :key="n" :value="n" @click="page = n">
              <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="700px" persistent>
      <v-card v-if="selectedItem" class="details-card">
        <v-card-title class="details-header d-flex align-center pa-4">
          <v-icon color="white" class="mr-3">mdi-receipt-text-clock-outline</v-icon>
          <span class="details-header-title">ລາຍລະອຽດການຊື້ຄືນ #{{ selectedItem.Re_ID }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="closeDetailsDialog" color="white"></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-5">
          <!-- Customer & Repurchase Info -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-section">
                <p class="section-title"><v-icon class="mr-2">mdi-account-circle-outline</v-icon>ຂໍ້ມູນລູກຄ້າ</p>
                <v-divider class="my-2"></v-divider>
                <p><strong>ຊື່:</strong> {{ selectedItem.Tb_Customer?.Cust_name || 'N/A' }}</p>
                <p><strong>ເບີໂທ:</strong> {{ selectedItem.Tb_Customer?.Phone || 'N/A' }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-section">
                <p class="section-title"><v-icon class="mr-2">mdi-information-outline</v-icon>ຂໍ້ມູນທຸລະກຳ</p>
                <v-divider class="my-2"></v-divider>
                <p><strong>ພະນັກງານ:</strong> {{ selectedItem.Tb_User?.username || 'N/A' }}</p>
                <p><strong>ວັນທີ:</strong> {{ new Date(selectedItem.Re_date).toLocaleDateString('lo-LA') }}</p>
                <p><strong>ລາຄາຊື້ຄືນ:</strong> <span class="font-weight-bold" style="color: #c02d2d;">{{ formatCurrency(selectedItem.Repurchase_Price) }} ກີບ</span></p>
                <p><strong>ຄ່າເສຍຫາຍຮູບປະພັນ:</strong> {{ formatCurrency(selectedItem.Damage_Cost) }} ກີບ</p>
                <p><strong>ຄ່າທອງຫຼຸດ:</strong> {{ formatCurrency(selectedItem.Loose_Gold_Cost) }} ກີບ</p>
                <p><strong>ລາຄາຊື້ຄືນສຸດທິ:</strong> {{ formatCurrency(selectedItem.Net_Repurchase_Price) }} ກີບ</p>
              </div>
            </v-col>
          </v-row>
          
          <!-- Products List -->
          <div class="mt-6">
            <p class="section-title"><v-icon class="mr-2">mdi-package-variant-closed</v-icon>ລາຍການສິນຄ້າທີ່ຊື້ຄືນ</p>
            <v-divider class="my-2"></v-divider>
            <v-table class="product-table mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ຊື່ສິນຄ້າ</th>
                  <th>ປະເພດ</th>
                  <th>ນ້ຳໜັກ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!selectedItem.Tb_Product || selectedItem.Tb_Product.length === 0">
                  <td colspan="4" class="text-center text-grey-darken-1 py-4">ບໍ່ມີລາຍການສິນຄ້າ</td>
                </tr>
                <tr v-for="(product, index) in selectedItem.Tb_Product" :key="product.Pd_ID">
                  <td>{{ index + 1 }}</td>
                  <td>{{ product.Pd_name || 'N/A' }}</td>
                  <td>{{ product.Type || 'N/A' }}</td>
                  <td>{{ product.Weight || 'N/A' }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4" style="background-color: #f7f7f7;">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil" @click="editItem(selectedItem)">
            ແກ້ໄຂຂໍ້ມູນ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" persistent max-width="380">
      <v-card style="font-family: 'NotoSansLao-Regular', sans-serif;">
        <v-card-title class="text-h6 font-weight-bold">ຢືນຢັນການລຶບ</v-card-title>
        <v-card-text>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການຊື້ຄືນນີ້?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDeleteDialog">ຍົກເລີກ</v-btn>
          <v-btn color="red-darken-1" text @click="confirmDeleteItem">ລຶບ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="3000">
        {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useApi from '~/composables/useApi';

const api = useApi();
const router = useRouter();
const search = ref('');
const loading = ref(true);
const repurchases = ref([]);
const page = ref(1);
const itemsPerPage = ref(8);
const pageMenu = ref(false);

// State for Details Dialog
const detailsDialog = ref(false);
const selectedItem = ref(null);

// State for Delete Dialog
const deleteDialog = ref(false);
const itemToDelete = ref(null);

// Snackbar
const snackbar = ref({
    visible: false,
    text: '',
    color: '',
});

const showSnackbar = (text, color) => {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.visible = true;
};

const filteredRepurchases = computed(() => {
  if (!search.value) {
    return repurchases.value;
  }
  const lowerSearch = search.value.toLowerCase();
  return repurchases.value.filter(item =>
    item.Tb_Customer?.Cust_name.toLowerCase().includes(lowerSearch) ||
    item.Tb_User?.username.toLowerCase().includes(lowerSearch)
  );
});

const paginatedRepurchases = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRepurchases.value.slice(start, end);
});

const fetchRepurchases = async () => {
  loading.value = true;
  try {
    const response = await api.get('/repurchases');
    repurchases.value = response.data;
  } catch (error) {
    console.error('Error fetching repurchases:', error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRepurchases);

// --- Dialog and Item Actions ---

const showDetails = (item) => {
  selectedItem.value = item;
  detailsDialog.value = true;
};

const closeDetailsDialog = () => {
  detailsDialog.value = false;
  selectedItem.value = null; // Clear selection
};

const editItem = (item) => {
  router.push(`/buy/returns/edit/${item.Re_ID}`);
};

const deleteItem = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  itemToDelete.value = null; // Clear selection
};

const confirmDeleteItem = async () => {
  if (!itemToDelete.value) return;
  try {
    await api.delete(`/repurchases/${itemToDelete.value.Re_ID}`);
    await fetchRepurchases(); // Refresh the list
  } catch (error) {
    console.error('Failed to delete repurchase:', error);
    showSnackbar(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ', 'error');
  } finally {
    closeDeleteDialog();
  }
};

const formatCurrency = (value) => {
  if (!value) return '0';
  const num = parseFloat(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('lo-LA').format(num);
};

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--;
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredRepurchases.value.length / itemsPerPage.value);
  if (page.value < totalPages) {
    page.value++;
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'NotoSansLao-Regular';
  src: url('/fonts/NotoSansLao-SemiCondensed.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.v-application {
  font-family: 'NotoSansLao-Regular', sans-serif;
}

.custom-table {
  font-family: 'NotoSansLao-Regular', sans-serif;
}

.custom-table td,
.custom-table th {
  vertical-align: middle;
  padding-top: 10px;
  padding-bottom: 10px;
}
.cursor-pointer {
  cursor: pointer;
}

/* New Styles for Details Dialog */
.details-card {
  font-family: 'NotoSansLao-Regular', sans-serif;
}

.info-section {
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}

.info-section p {
  margin-bottom: 8px;
}

.product-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.product-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.product-table td, .product-table th {
  padding: 12px 16px;
}

.details-header {
  background: #1976d2;
  color: #fff;
  font-family: 'NotoSansLao-Regular', sans-serif;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.details-header-title {
  font-size: 1.25rem;
  font-weight: bold;
  font-family: 'NotoSansLao-Regular', sans-serif;
  color: #fff;
}
</style> 