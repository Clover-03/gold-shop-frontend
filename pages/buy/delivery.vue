<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການນຳສົ່ງສິນຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ (ID, ຊື່ຜູ້ສະໜອງ)"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
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
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          + ເພີ່ມໃບນຳສົ່ງ
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
      item-value="Inv_ID"
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
        <v-chip :color="getStatusColor(item.Status)" class="text-white" dark small>
          {{ item.Status }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-center">
          <v-icon size="small" color="info" class="mr-2" @click="openViewDialog(item)">mdi-eye</v-icon>
          <v-icon size="small" color="primary" class="mr-2" @click="openEditDialog(item)">mdi-pencil</v-icon>
          <v-tooltip text="ຍົກເລີກໃບນຳສົ່ງ">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="small" color="error" @click="openDeleteDialog(item)">mdi-cancel</v-icon>
            </template>
          </v-tooltip>
        </div>
      </template>
       <template #no-data>
        <div class="text-center py-4">
          <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-receipt-text-remove-outline</v-icon>
          <p class="text-h6 text-grey-lighten-1">ຍັງບໍ່ມີຂໍ້ມູນການນຳສົ່ງສິນຄ້າ</p>
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
            v-for="n in Math.ceil(filteredInvoices.length / itemsPerPage)"
            :key="n"
            :value="n"
            @click="page = n"
          >
            <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="addDialog" max-width="700px" persistent>
      <v-card>
        <v-card-title class="dialog-title">
         ເພີ່ມໃບນຳສົ່ງ
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.orderId"
                  :items="pendingOrders"
                  item-title="Order_ID"
                  item-value="Order_ID"
                  label="ເລືອກອໍເດີທີ່ຕ້ອງການຮັບ"
                  outlined dense
                  :rules="[rules.required]"
                  @update:modelValue="onOrderSelected"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="`ອໍເດີ #${item.raw.Order_ID} - ${item.raw.Sup_name}`" />
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.invoiceDate"
                  label="ວັນທີຮັບສິນຄ້າ"
                  type="date"
                  outlined dense
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>
            <div v-if="selectedOrderDetails" class="mt-4 pa-3 border rounded">
                <h3 class="text-subtitle-1">ລາຍລະອຽດອໍເດີ #{{ selectedOrderDetails.Order_ID }}</h3>
                <p><strong>ຜູ່ສະໜອງ:</strong> {{ selectedOrderDetails.Sup_name }}</p>
                <p><strong>ລວມທັງໝົດ:</strong> {{ formatCurrency(selectedOrderDetails.products.reduce((acc, p) => acc + p.buyPrice * p.quantity, 0)) }}</p>
                <v-table density="compact" class="mt-2">
                    <thead>
                        <tr><th>ສິນຄ້າ</th><th>ຈຳນວນ</th><th>ລາຄາຊື້</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in selectedOrderDetails.products" :key="p.id">
                            <td>{{ p.Pd_name }}</td>
                            <td>{{ p.quantity }}</td>
                            <td>{{ formatCurrency(p.buyPrice) }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" text @click="addDialog = false" :disabled="isSaving">ຍົກເລີກ</v-btn>
          <v-btn class="btn-save" @click="saveInvoice" :loading="isSaving" :disabled="!formValid">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="800px">
        <v-card>
            <v-card-title class="dialog-title">ລາຍລະອຽດໃບນຳສົ່ງ #{{ selectedInvoice?.Inv_ID }}</v-card-title>
            <v-card-text v-if="selectedInvoice">
                <v-row>
                    <v-col cols="12" md="6">
                <p><strong>ID ໃບນຳສົ່ງ:</strong> {{ selectedInvoice.Inv_ID }}</p>
                <p><strong>ID ອໍເດີ:</strong> {{ selectedInvoice.Order_ID }}</p>
                        <p><strong>ຜູ່ສະໜອງ:</strong> {{ selectedInvoice.Sup_name }}</p>
                    </v-col>
                    <v-col cols="12" md="6">
                <p><strong>ວັນທີຮັບ:</strong> {{ formatDate(selectedInvoice.Inv_Date) }}</p>
                <p><strong>ສະຖານະ:</strong> <v-chip :color="getStatusColor(selectedInvoice.Status)" size="small">{{ selectedInvoice.Status }}</v-chip></p>
                <p><strong>ຍອດລວມ:</strong> {{ formatCurrency(selectedInvoice.Total_Price) }}</p>
                    </v-col>
                </v-row>

                 <h3 class="text-subtitle-1 mt-4">ລາຍການສິນຄ້າ</h3>
                <v-table density="compact" class="mt-2">
                    <thead>
                        <tr>
                            <th class="text-left">ຊື່ສິນຄ້າ</th>
                            <th class="text-right">ນ້ຳໜັກ(g)</th>
                            <th class="text-right">ຈຳນວນ</th>
                            <th class="text-right">ລາຄາຊື້</th>
                            <th class="text-right">ສ່ວນຫຼຸດ</th>
                            <th class="text-right">ລວມ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in selectedInvoice.products" :key="p.Pd_ID">
                            <td class="text-left">{{ p.Pd_name }}</td>
                            <td class="text-right">{{ p.weight }}</td>
                            <td class="text-right">{{ p.quantity }}</td>
                            <td class="text-right">{{ formatCurrency(p.buyPrice) }}</td>
                            <td class="text-right">{{ formatCurrency(p.discount) }}</td>
                            <td class="text-right">{{ formatCurrency((p.buyPrice * p.quantity) - p.discount) }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="viewDialog = false">ປິດ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="dialog-title">ແກ້ໄຂໃບນຳສົ່ງ #{{ form.Inv_ID }}</v-card-title>
        <v-card-text>
          <v-form ref="editFormRef" v-model="editFormValid">
            <v-text-field
              v-model="form.invoiceDate"
              label="ວັນທີຮັບສິນຄ້າ"
              type="date"
              outlined dense
              class="mb-4"
              :rules="[rules.required]"
            />
            <v-select
              v-model="form.status"
              :items="invoiceStatusOptions"
              label="ສະຖານະ"
              outlined dense
              :rules="[rules.required]"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" text @click="editDialog = false" :disabled="isSaving">ຍົກເລີກ</v-btn>
          <v-btn class="btn-save" @click="saveEdit" :loading="isSaving" :disabled="!editFormValid">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px" persistent>
        <v-card>
            <v-card-title class="dialog-title">ຢືນຢັນການຍົກເລີກ</v-card-title>
            <v-card-text>
                ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກໃບນຳສົ່ງ #{{ selectedInvoice?.Inv_ID }}? <br/>
                ການກະທຳນີ້ຈະປ່ຽນສະຖານະອໍເດີຄືນເປັນ "Pending".
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn class="btn-cancel" @click="deleteDialog = false" :disabled="isSaving">ບໍ່</v-btn>
                <v-btn color="error" @click="confirmDelete" :loading="isSaving">ແມ່ນ, ຍົກເລີກ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>


  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fetchInvoices, createInvoice, fetchPendingOrders, updateInvoice, deleteInvoice } from '~/services/invoiceApi';
import { fetchOrders } from '~/services/orderApi';

const isLoading = ref(true);
const isSaving = ref(false);
const snackbar = ref({ show: false, message: '', color: 'success' });
const search = ref('');
const statusFilter = ref(null);
const page = ref(1);
const itemsPerPage = ref(10);
const pageMenu = ref(false);

const invoices = ref([]);
const pendingOrders = ref([]);
const addDialog = ref(false);
const editDialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);

const form = ref({});
const formRef = ref(null);
const formValid = ref(false);
const editFormRef = ref(null);
const editFormValid = ref(false);

const selectedInvoice = ref(null);
const selectedOrderDetails = ref(null);

const statusOptions = ['Pending', 'Completed', 'Cancelled'];
const invoiceStatusOptions = ['Pending', 'Completed', 'Cancelled'];

const rules = {
  required: v => !!v || 'Required.'
};

const headers = [
  { title: 'ລຳດັບ', value: 'index', sortable: false },
  { title: 'ID ໃບນຳສົ່ງ', value: 'Inv_ID' },
  { title: 'ID ອໍເດີ', value: 'Order_ID' },
  { title: 'ຜູ່ສະໜອງ', value: 'Sup_name' },
  { title: 'ວັນທີຮັບ', value: 'Inv_Date' },
  { title: 'ຍອດລວມ', value: 'Total_Price' },
  { title: 'ສະຖານະ', value: 'Status' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
];

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

const getStatusColor = (status) => {
  const map = { 
    'Completed': 'green', 
    'SENT': 'green', // Keep SENT for backward compatibility if needed
    'Pending': 'orange', 
    'PENDING': 'orange',
    'Cancelled': 'red',
    'CANCELED': 'red' 
  };
  return map[status] || 'grey';
};

const validateForm = () => {
  return formRef.value.validate();
};

const filteredInvoices = computed(() => {
  let filtered = invoices.value;

  // Filter by search term
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    filtered = filtered.filter(inv =>
      inv.Sup_name?.toLowerCase().includes(searchTerm) ||
    inv.Inv_ID.toString().includes(search.value)
  );
  }

  // Filter by status
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
    showSnackbar(error.message || 'Failed to load data', 'error');
    console.error("Error fetching initial data in delivery.vue:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadInitialData);

// Watch for filter changes to reset pagination
watch([search, statusFilter], () => {
  page.value = 1;
});

// Pagination Navigation Functions
function goToPreviousPage() {
  if (page.value > 1) {
    page.value--;
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredInvoices.value.length / itemsPerPage.value);
  if (page.value < totalPages) {
    page.value++;
  }
}

// --- Add Dialog Logic ---
const resetAddForm = () => {
  form.value = {
    orderId: null,
    invoiceDate: new Date().toISOString().split('T')[0]
  };
  selectedOrderDetails.value = null;
  formRef.value?.resetValidation();
}

const openAddDialog = async () => {
  resetAddForm();
  isSaving.value = true; // Show loading state while fetching
  try {
    const response = await fetchPendingOrders();
    pendingOrders.value = response?.orders || [];
    
    if (pendingOrders.value.length === 0) {
      showSnackbar('ບໍ່ມີອໍເດີທີ່ລໍຖ້າການນຳສົ່ງ', 'info');
      return; // Stop if no pending orders
    }
    
    addDialog.value = true;
  } catch (error) {
    showSnackbar(error.message || 'Failed to fetch pending orders.', 'error');
    console.error("Error fetching pending orders in delivery.vue:", error);
  } finally {
    isSaving.value = false; // Hide loading state
  }
}

const onOrderSelected = (orderId) => {
  selectedOrderDetails.value = pendingOrders.value.find(o => o.Order_ID === orderId);
}

const saveInvoice = async () => {
  if (!validateForm()) return;
  isSaving.value = true;
  try {
    console.log('saveInvoice: payload being sent', form.value);
    await createInvoice(form.value);
    showSnackbar('ສ້າງໃບນຳສົ່ງສຳເລັດ', 'success');
    addDialog.value = false;
    await loadInitialData();
  } catch (error) {
     showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

// --- View Dialog Logic ---
const openViewDialog = (item) => {
    selectedInvoice.value = item;
    viewDialog.value = true;
}

// --- Edit Dialog Logic ---
const openEditDialog = (item) => {
  form.value = {
    Inv_ID: item.Inv_ID,
    invoiceDate: formatDate(item.Inv_Date),
    status: item.Status
  };
  editFormRef.value?.resetValidation();
  editDialog.value = true;
}

const saveEdit = async () => {
  editFormRef.value.validate();
  if(!editFormValid.value) return;

  isSaving.value = true;
  try {
    await updateInvoice(form.value.Inv_ID, {
      invoiceDate: form.value.invoiceDate,
      status: form.value.status
    });
    showSnackbar('ອັບເດດສຳເລັດ', 'success');
    editDialog.value = false;
    await loadInitialData();
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

// --- Delete Dialog Logic ---
const openDeleteDialog = (item) => {
  selectedInvoice.value = item;
  deleteDialog.value = true;
}

const confirmDelete = async () => {
  isSaving.value = true;
  try {
    await deleteInvoice(selectedInvoice.value.Inv_ID);
    showSnackbar('ຍົກເລີກໃບນຳສົ່ງສຳເລັດ', 'success');
    deleteDialog.value = false;
    await loadInitialData();
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

</script>

<style scoped>
.dialog-title { background-color: #365a76; color: white; font-weight: bold; }
.btn-cancel { background-color: #f44336 !important; color: white !important; }
.btn-save { background-color: #4caf50 !important; color: white !important; }
.border {
  border: 1px solid #e0e0e0;
}
</style> 