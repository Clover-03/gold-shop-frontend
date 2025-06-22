<template>
    <div>
        <Header title="ຈັດການຂໍ້ມູນການຂາຍສິນຄ້າ" back-route="/sell/selling" />
        <v-card class="mt-4" flat>
            <v-card-title>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="ຄົ້ນຫາ..."
                            single-line
                            hide-details
                            dense
                            outlined
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="8" class="text-right">
                        <v-btn color="primary" @click="openAddDialog">
                            <v-icon left>mdi-plus</v-icon>
                            ເພີ່ມການຂາຍ
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            
            <!-- Loading State -->
            <div v-if="loading.page" class="text-center py-10">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="sells.length === 0" class="text-center py-10">
                <v-icon size="64" color="grey-lighten-2">mdi-cart-off</v-icon>
                <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນການຂາຍ</p>
                <p class="text-body-1 text-grey-lighten-1">ລອງກົດປຸ່ມ "ເພີ່ມການຂາຍ" ເພື່ອສ້າງລາຍການໃໝ່.</p>
            </div>


            <!-- Data Table -->
            <div v-else>
              <v-card class="mt-4">
                <v-table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th @click="sortBy('Tb_Customer.Cust_name')" class="cursor-pointer">ລູກຄ້າ <v-icon>{{ getSortIcon('Tb_Customer.Cust_name') }}</v-icon></th>
                      <th @click="sortBy('Tb_User.username')" class="cursor-pointer">ພະນັກງານ <v-icon>{{ getSortIcon('Tb_User.username') }}</v-icon></th>
                      <th @click="sortBy('Tb_Product.Pd_name')" class="cursor-pointer">ສິນຄ້າ <v-icon>{{ getSortIcon('Tb_Product.Pd_name') }}</v-icon></th>
                      <th @click="sortBy('Sell_Date')" class="cursor-pointer">ວັນທີຂາຍ <v-icon>{{ getSortIcon('Sell_Date') }}</v-icon></th>
                      <th @click="sortBy('Total')" class="cursor-pointer">ຍອດລວມ <v-icon>{{ getSortIcon('Total') }}</v-icon></th>
                      <th class="text-center">ຕົວເລືອກ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in paginatedSells" :key="item.Sell_ID">
                      <td>{{ (page - 1) * itemsPerPage + index + 1 }}</td>
                      <td>{{ item.Tb_Customer?.Cust_name || 'N/A' }}</td>
                      <td>{{ item.Tb_User?.username || 'N/A' }}</td>
                      <td>{{ item.Tb_Product?.Pd_name || 'N/A' }}</td>
                      <td>{{ new Date(item.Sell_Date).toLocaleDateString('lo-LA') }}</td>
                      <td>{{ formatCurrency(item.Total) }}</td>
                      <td class="text-center">
                        <v-tooltip location="top" text="ເບິ່ງໃບບິນ">
                          <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" size="small" color="info" class="mr-2" @click="showReceipt(item)">mdi-receipt-text</v-icon>
                          </template>
                        </v-tooltip>
                        <v-tooltip location="top" text="ແກ້ໄຂ">
                          <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" size="small" color="primary" class="mr-2" @click="openEditDialog(item)">mdi-pencil</v-icon>
                          </template>
                        </v-tooltip>
                        <v-tooltip location="top" text="ລຶບ">
                          <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" size="small" color="error" @click="openDeleteDialog(item)">mdi-delete</v-icon>
                          </template>
                        </v-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
  
              <!-- Pagination from product.vue -->
              <div class="d-flex justify-center align-center mt-4">
                <v-pagination
                  v-model="page"
                  :length="Math.ceil(filteredSells.length / itemsPerPage)"
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
                    v-for="n in Math.ceil(filteredSells.length / itemsPerPage)"
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

            <!-- Receipt Dialog -->
            <v-dialog v-model="receiptDialog.visible" max-width="800px">
                <v-card v-if="receiptDialog.saleData">
                    <v-toolbar color="primary" dark>
                        <v-toolbar-title>ໃບບິນຂາຍສິນຄ້າ</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="receiptDialog.visible = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <ReceiptComponent :sale="receiptDialog.saleData" ref="receiptComponentRef" />
                    <v-card-actions class="justify-end pa-4">
                        <v-btn color="primary" @click="printReceipt">
                            <v-icon left>mdi-printer</v-icon>
                            ພິມ
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Add/Edit Sale Dialog -->
            <v-dialog v-model="saleDialog.visible" max-width="900px" persistent>
              <v-card class="form-card">
                <v-card-title class="headline">{{ saleDialog.isEdit ? 'ແກ້ໄຂຂໍ້ມູນການຂາຍ' : 'ເພີ່ມການຂາຍໃໝ່' }}</v-card-title>
                <v-card-text>
                  <div v-if="latestGoldPrice">
                    <v-alert type="info" class="mb-4">
                      <strong>ລາຄາທອງລ່າສຸດ:</strong> {{ formatCurrency(latestGoldPrice.sellPrice) }} / 1 ບາດ
                    </v-alert>
                  </div>
                  <div v-else>
                    <v-alert type="warning" class="mb-4">ບໍ່ສາມາດດຶງຂໍ້ມູນລາຄາທອງລ່າສຸດໄດ້</v-alert>
                  </div>
                  <v-form ref="form" v-model="valid" lazy-validation>
                    <!-- Add Form -->
                    <div v-if="!saleDialog.isEdit">
                      <v-row>
                          <v-col cols="12" md="6">
                            <v-card variant="outlined" class="h-100">
                                <v-card-title>1. ຂໍ້ມູນລູກຄ້າ ແລະ ວັນທີ</v-card-title>
                                <v-card-text>
                                <v-autocomplete
                                    v-model="sale.customerId"
                                    :items="customers"
                                    item-title="name"
                                    item-value="id"
                                    label="ເລືອກລູກຄ້າ"
                                    :rules="[rules.required]"
                                    prepend-inner-icon="mdi-account-search-outline"
                                    variant="outlined"
                                    dense
                                    :loading="loading.customers"
                                >
                                    <template v-slot:selection="{ item }">
                                        <span class="v-list-item-title">{{ item.raw.name }}</span>
                                    </template>
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.phone"></v-list-item>
                                    </template>
                                </v-autocomplete>
                                <v-text-field
                                    v-model="sale.sellDate"
                                    label="ວັນທີຂາຍ"
                                    type="date"
                                    :rules="[rules.required]"
                                    prepend-inner-icon="mdi-calendar"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                                </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-card variant="outlined" class="h-100">
                                <v-card-title>2. ຂໍ້ມູນສິນຄ້າ</v-card-title>
                                <v-card-text>
                                <v-autocomplete
                                    v-model="sale.productId"
                                    :items="products"
                                    item-title="Pd_name"
                                    item-value="Pd_ID"
                                    label="ເລືອກສິນຄ້າ"
                                    :rules="[rules.required]"
                                    @update:modelValue="onProductSelect"
                                    prepend-inner-icon="mdi-gold"
                                    variant="outlined"
                                    dense
                                    :loading="loading.products"
                                >
                                    <template v-slot:selection="{ item }">
                                        <span class="v-list-item-title">{{ item.raw.Pd_name }}</span>
                                    </template>
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props" :title="item.raw.Pd_name" :subtitle="`ນ້ຳໜັກ: ${formatWeight(item.raw.Weight)}`"></v-list-item>
                                    </template>
                                </v-autocomplete>
                                <v-text-field
                                    v-model.number="sale.quantity"
                                    label="ຈຳນວນ"
                                    type="number"
                                    min="1"
                                    :rules="[rules.required, rules.positive]"
                                    prepend-inner-icon="mdi-counter"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                                </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col cols="12">
                            <v-card class="price-summary-card">
                                <v-card-title>3. ສະຫຼຸບລາຄາ</v-card-title>
                                <v-card-subtitle>ກວດສອບລາຄາຕໍ່ໜ່ວຍ ແລະ ລາຄາລວມທັງໝົດກ່ອນບັນທຶກ</v-card-subtitle>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" sm="6">
                                            <v-text-field
                                                label="ລາຄາຂາຍຕໍ່ໜ່ວຍ (ລາຄາຄຳ + ຄ່າກຳເໜັດ)"
                                                :model-value="formatCurrency(selectedProductPrice)"
                                                readonly
                                                dense
                                                variant="filled"
                                                prepend-inner-icon="mdi-cash"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field
                                                label="ລາຄາລວມທັງໝົດ"
                                                :model-value="formatCurrency(totalPrice)"
                                                readonly
                                                dense
                                                variant="solo"
                                                class="font-weight-bold"
                                                bg-color="light-blue-lighten-5"
                                                prepend-inner-icon="mdi-cash-multiple"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                          </v-col>
                      </v-row>
                    </div>
                    <!-- Edit Form -->
                    <div v-else>
                        <v-card variant="outlined" class="mb-6">
                            <v-card-title>ຂໍ້ມູນຫຼັກ</v-card-title>
                            <v-card-text>
                                <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                    :model-value="sale.customerName"
                                    label="ລູກຄ້າ"
                                    variant="filled"
                                    readonly
                                    prepend-inner-icon="mdi-account"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                    :model-value="sale.productName"
                                    label="ສິນຄ້າ"
                                    variant="filled"
                                    readonly
                                    prepend-inner-icon="mdi-gold"
                                    ></v-text-field>
                                </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                        <v-card variant="outlined" class="mb-6">
                            <v-card-title>ຂໍ້ມູນທີ່ແກ້ໄຂໄດ້</v-card-title>
                            <v-card-text>
                                <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                    v-model.number="sale.quantity"
                                    label="ຈຳນວນ"
                                    type="number"
                                    :rules="[rules.required, rules.positive]"
                                    variant="outlined"
                                    prepend-inner-icon="mdi-counter"
                                    dense
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                    v-model.number="sale.priceAtSale"
                                    label="ລາຄາຂາຍ (ກີບ)"
                                    type="number"
                                    :rules="[rules.required, rules.positive]"
                                    variant="outlined"
                                    prepend-inner-icon="mdi-cash-plus"
                                    dense
                                    ></v-text-field>
                                </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                        <v-card variant="outlined">
                            <v-card-title>ສະຫຼຸບລາຄາ</v-card-title>
                            <v-card-text>
                                <v-text-field
                                    :model-value="formatCurrency(totalPrice)"
                                    label="ລວມທັງໝົດ"
                                    variant="solo"
                                    class="font-weight-bold"
                                    bg-color="light-blue-lighten-5"
                                    readonly
                                    prepend-inner-icon="mdi-cash-multiple"
                                ></v-text-field>
                            </v-card-text>
                        </v-card>
                    </div>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="closeSaleDialog">ຍົກເລີກ</v-btn>
                  <v-btn color="primary" :loading="loading.saving" @click="handleBeforeSave" :disabled="!valid">ບັນທຶກ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Confirm Dialog -->
            <v-dialog v-model="confirmDialog" max-width="500px">
              <v-card>
                <v-card-title class="headline">ຢືນຢັນການຂາຍ</v-card-title>
                <v-card-text>
                  <div class="confirm-summary">
                    <p><strong>ລູກຄ້າ:</strong> {{ getCustomerName(sale.customerId) }}</p>
                    <p><strong>ສິນຄ້າ:</strong> {{ getProductName(sale.productId) }}</p>
                    <p><strong>ຈຳນວນ:</strong> {{ sale.quantity }}</p>
                    <p><strong>ລາຄາຂາຍ/ໜ່ວຍ:</strong> {{ formatCurrency(sale.priceAtSale) }}</p>
                    <p><strong>ລາຄາລວມ:</strong> <span class="text-primary font-weight-bold">{{ formatCurrency(totalPrice) }}</span></p>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="confirmDialog = false">ຍົກເລີກ</v-btn>
                  <v-btn color="primary" :loading="loading.saving" @click="saveSale">ຢືນຢັນ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Delete Confirmation Dialog -->
            <v-dialog v-model="deleteDialog" persistent max-width="400px">
              <v-card>
                <v-card-title class="text-h6 font-weight-bold">ຢືນຢັນການລຶບ</v-card-title>
                <v-card-text>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກລາຍການຂາຍນີ້?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="closeDeleteDialog">ບໍ່</v-btn>
                  <v-btn color="error" @click="confirmDelete">ແມ່ນ, ລຶບ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

        </v-card>

        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
        </v-snackbar>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import useApi from '~/composables/useApi';
import { useRouter } from 'vue-router';
import ReceiptComponent from '~/components/sell/Receipt.vue';
import Header from '~/components/Header.vue';

const api = useApi();
const router = useRouter();

const search = ref('');
const loading = ref({
    page: true,
    customers: false,
    products: false,
    saving: false,
});
const sells = ref([]);
const customers = ref([]);
const products = ref([]);
const latestGoldPrice = ref(null);

const form = ref(null);
const valid = ref(true);

const sale = ref({
    id: null,
    customerId: null,
    customerName: '',
    productId: null,
    productName: '',
    sellDate: new Date().toISOString().substr(0, 10),
    quantity: 1,
    priceAtSale: 0,
    total: 0,
});

const rules = {
    required: value => !!value || 'ກະລຸນາປ້ອນຂໍ້ມູນ',
    positive: value => value > 0 || 'ມູນຄ່າຕ້ອງເປັນຈຳນວນບວກ'
};

// Sorting state
const sortKey = ref('Sell_Date');
const sortDesc = ref(true);

// Pagination state
const page = ref(1);
const itemsPerPage = ref(8);
const pageMenu = ref(false);

// State for Dialogs
const deleteDialog = ref(false);
const saleDialog = ref({
    visible: false,
    isEdit: false
});
const selectedItem = ref(null);

const snackbar = ref({
    visible: false,
    text: '',
    color: '',
});

const confirmDialog = ref(false);
const receiptDialog = ref({
  visible: false,
  saleData: null,
});
const receiptComponentRef = ref(null);

const getProperty = (obj, path) => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const sortedSells = computed(() => {
  const key = sortKey.value;
  const order = sortDesc.value ? -1 : 1;
  
  return [...filteredSells.value].sort((a, b) => {
    let valA = getProperty(a, key);
    let valB = getProperty(b, key);

    // Handle specific data types
    if (key === 'Total') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else if (key === 'Sell_Date') {
      valA = new Date(valA).getTime() || 0;
      valB = new Date(valB).getTime() || 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }
    
    if (valA < valB) return order * -1;
    if (valA > valB) return order * 1;
    return 0;
  });
});

const filteredSells = computed(() => {
  let data = sells.value;
  if (search.value) {
    const lowerSearch = search.value.toLowerCase();
    data = data.filter(s => 
      s.Tb_Customer?.Cust_name.toLowerCase().includes(lowerSearch) ||
      s.Tb_Product?.Pd_name.toLowerCase().includes(lowerSearch) ||
      s.Tb_User?.username.toLowerCase().includes(lowerSearch)
    );
  }
  return data;
});

const paginatedSells = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value;
  return sortedSells.value.slice(start, end)
});

const formatNumber = (value) => {
  if (value === null || typeof value === 'undefined') return '';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('lo-LA');
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortKey.value = key;
    sortDesc.value = false;
  }
  page.value = 1; // Reset to first page
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) {
    return 'mdi-sort';
  }
  return sortDesc.value ? 'mdi-sort-descending' : 'mdi-sort-ascending';
};

const fetchSells = async () => {
    loading.value.page = true;
    try {
        const response = await api.get('/sells');
        sells.value = response.data;
    } catch (error) {
        console.error('Error fetching sells:', error);
        showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ', 'error');
    } finally {
        loading.value.page = false;
    }
};

const fetchCustomers = async () => {
    loading.value.customers = true;
    try {
        const response = await api.get('/customers');
        customers.value = response.data;
    } catch (error) {
        showSnackbar('Failed to load customers', 'error');
    } finally {
        loading.value.customers = false;
    }
};

const fetchProducts = async () => {
    loading.value.products = true;
    try {
        const response = await api.get('/products/available');
        products.value = response.data;
    } catch (error) {
        showSnackbar('Failed to load available products', 'error');
    } finally {
        loading.value.products = false;
    }
};

const fetchLatestGoldPrice = async () => {
    try {
        const response = await api.get('/prices/latest');
        latestGoldPrice.value = response.data;
    } catch (error) {
        showSnackbar('Failed to load latest gold price', 'error');
        console.error(error);
    }
};

const resetSaleForm = () => {
    sale.value = {
        id: null,
        customerId: null,
        customerName: '',
        productId: null,
        productName: '',
        sellDate: new Date().toISOString().substr(0, 10),
        quantity: 1,
        priceAtSale: 0,
        total: 0,
    };
    if (form.value) {
      form.value.resetValidation();
    }
};

const openAddDialog = () => {
    resetSaleForm();
    saleDialog.value = { visible: true, isEdit: false };
};

const openEditDialog = (item) => {
    selectedItem.value = item;
    sale.value = {
        id: item.Sell_ID,
        customerName: item.Tb_Customer?.Cust_name || 'N/A',
        productName: item.Tb_Product?.Pd_name || 'N/A',
        quantity: item.Quantity,
        priceAtSale: parseFloat(item.Price_At_Sale),
        total: parseFloat(item.Total),
    };
    saleDialog.value = { visible: true, isEdit: true };
};

const closeSaleDialog = () => {
    saleDialog.value.visible = false;
};

const onProductSelect = async (productId) => {
    if (!latestGoldPrice.value) {
        await fetchLatestGoldPrice();
    }
    const product = products.value.find(p => p.Pd_ID === productId);
    if (product) {
        sale.value.priceAtSale = calculateSellPrice(product);
    }
};

const convertWeightCodeToGrams = (weightInput) => {
    if (!weightInput) return 0;

    const code = String(weightInput);

    if (code.toUpperCase().startsWith('B')) {
        let weightString = code.substring(1);
        if (weightString.startsWith('_')) {
            weightString = '0.' + weightString.substring(1);
        } else {
            weightString = weightString.replace('_', '.');
        }
        const weightInBaht = parseFloat(weightString);
        if (isNaN(weightInBaht)) return 0;
        
        return weightInBaht * 15.16; // 1 Baht = 15.16 grams
    } else {
        const weightInGrams = parseFloat(code);
        if (isNaN(weightInGrams)) return 0;
        return weightInGrams;
    }
};

const calculateSellPrice = (product) => {
    if (!latestGoldPrice.value || !product) return 0;
    
    const weightInGrams = convertWeightCodeToGrams(product.Weight);
    const craftsmanshipFee = parseFloat(String(product.makingCharge || '0').replace(/,/g, ''));
    const goldSellPrice = latestGoldPrice.value.sellPrice;

    if (isNaN(goldSellPrice) || goldSellPrice <= 0) {
        return craftsmanshipFee;
    }

    const goldValue = (goldSellPrice / 15.16) * weightInGrams;
    return goldValue + craftsmanshipFee;
};

const selectedProductPrice = computed(() => {
    if (!sale.value.productId) return 0;
    return sale.value.priceAtSale;
});

const totalPrice = computed(() => {
    const total = (sale.value.priceAtSale || 0) * (sale.value.quantity || 0);
    sale.value.total = total;
    return total;
});

const handleBeforeSave = async () => {
    const { valid: formValid } = await form.value.validate();
    if (!formValid) {
        showSnackbar('ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງ', 'warning');
        return;
    }

    if (!saleDialog.value.isEdit) {
        const exists = sells.value.some(s => s.Pd_ID === sale.value.productId);
        if (exists) {
            showSnackbar('ສິນຄ້ານີ້ຖູກຂາຍໄປແລ້ວ!', 'error');
            return;
        }
    }
    confirmDialog.value = true;
};

const saveSale = async () => {
    const { valid: formValid } = await form.value.validate();
    if (!formValid) {
        showSnackbar('ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງ', 'warning');
        return;
    }

    loading.value.saving = true;
    try {
        let savedSale;
        if (saleDialog.value.isEdit) {
            const response = await api.put(`/sells/${sale.value.id}`, {
                quantity: sale.value.quantity,
                priceAtSale: sale.value.priceAtSale,
                total: sale.value.total
            });
            savedSale = response.data; // Assuming API returns the updated sale
            showSnackbar('ອັບເດດຂໍ້ມູນສຳເລັດ!', 'success');
        } else {
            const payload = {
                Cust_ID: sale.value.customerId,
                Pd_ID: sale.value.productId,
                Sell_Date: new Date(sale.value.sellDate).toISOString(),
                Quantity: sale.value.quantity,
                Price_At_Sale: sale.value.priceAtSale,
                Total: sale.value.total,
            };
            const response = await api.post('/sells', payload);
            savedSale = response.data;
            showSnackbar('ບັນທຶກການຂາຍສຳເລັດ!', 'success');
        }
        
        // --- Show Receipt ---
        receiptDialog.value.saleData = savedSale;
        receiptDialog.value.visible = true;
        // --- End Show Receipt ---

        await fetchSells(); // Refresh the main data table
    } catch (error) {
        console.error('Save sale error:', error);
        showSnackbar(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error');
    } finally {
        loading.value.saving = false;
        confirmDialog.value = false;
        closeSaleDialog();
    }
};

const printReceipt = () => {
  const receiptEl = receiptComponentRef.value?.$el;
  if (!receiptEl) {
    console.error("Receipt element not found.");
    return;
  }

  const htmlToPrint = receiptEl.innerHTML;
  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Print Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body { 
            font-family: 'Phetsarath OT', 'Noto Sans Lao', sans-serif; 
            margin: 0; 
            padding: 15mm; 
          }
          .receipt-container { 
            width: 100%; 
            margin: auto; 
            height: auto; /* Allow content to determine height */
          }
          .header-section { text-align: center; margin-bottom: 24px; }
          .header-section img { max-width: 120px; margin: 0 auto; }
          .header-section h1 { margin-top: 16px; margin-bottom: 4px; }
          .title-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #000; }
          h2.receipt-title { font-size: 2rem; font-weight: bold; }
          .customer-info { margin-bottom: 24px; }
          table.receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .receipt-table th, .receipt-table td { border-bottom: 1px solid #ccc; padding: 8px 12px; text-align: left; }
          .receipt-table th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
          .footer-section { page-break-inside: avoid; margin-top: 48px; }
          .footer-section > div { display: flex; justify-content: space-between; }
          .footer-section > div > div { width: 45%; text-align: center; }
          .v-row { display: flex; flex-wrap: wrap; margin: 0; }
          .v-col-6 { width: 50%; padding: 0 12px; box-sizing: border-box; }
          .text-grey-darken-1 { color: #757575 !important; }
          .mb-0 { margin-bottom: 0 !important; }
          .mb-1 { margin-bottom: 4px !important; }
          .mb-8 { margin-bottom: 32px !important; }
        </style>
      </head>
      <body>
        ${htmlToPrint}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    document.body.removeChild(printFrame);
  }, 250);
};

const showReceipt = (item) => {
  receiptDialog.value.saleData = item;
  receiptDialog.value.visible = true;
};

const showDetails = (item) => {
  selectedItem.value = item;
  detailsDialog.value = true;
};

const openDeleteDialog = (item) => {
  selectedItem.value = item;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedItem.value) return;
    try {
        await api.delete(`/sells/${selectedItem.value.Sell_ID}`);
        showSnackbar('ລຶບຂໍ້ມູນສຳເລັດ!', 'success');
        closeDeleteDialog();
        fetchSells(); // Refresh data
    } catch (error) {
        console.error('Error deleting sell:', error);
        showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    }
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  selectedItem.value = null;
};

const showSnackbar = (text, color) => {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.visible = true;
};

const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(value);
};

const formatWeight = (weight) => {
     if (!weight) return 'N/A';
    const text = weight.replace('B', '').replace('_', '.');
    return `${text} ບາດ`;
};

// Pagination functions
function goToPreviousPage() {
  if (page.value > 1) {
    page.value--
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredSells.value.length / itemsPerPage.value)
  if (page.value < totalPages) {
    page.value++
  }
}

function getCustomerName(id) {
  const c = customers.value.find(c => c.id === id);
  return c ? c.name : '-';
}

function getProductName(id) {
  const p = products.value.find(p => p.Pd_ID === id);
  return p ? p.Pd_name : '-';
}

onMounted(() => {
    fetchSells();
    fetchCustomers();
    fetchProducts();
    fetchLatestGoldPrice();
});

</script> 

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
.cursor-pointer:hover {
  background-color: rgba(0,0,0,0.05);
}

/* Styles from returns page for details dialog */
.details-card {
  font-family: 'NotoSansLao-Regular', sans-serif;
}
.details-header {
  background: #1976d2;
  color: #fff;
}
.details-header-title {
  font-size: 1.25rem;
  font-weight: bold;
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
.product-table-wrapper {
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
.confirm-summary { background: #f5faff; border-radius: 8px; padding: 16px; border: 1px solid #b3e5fc; }
.text-primary { color: #1976d2; }
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
  padding: 24px 16px;
  opacity: 1;
}
.price-summary-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
  border: 1px solid #b3e5fc;
  padding: 24px 16px;
  opacity: 1;
}
</style> 