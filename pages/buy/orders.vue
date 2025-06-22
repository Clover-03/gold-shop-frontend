<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການສັ່ງຊື້
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          dense
          outlined
          hide-details
        >
          <template #append-inner>
            <v-img
              src="/icons/Search.png"
              width="20"
              height="20"
              class="cursor-pointer"
            />
          </template>
        </v-text-field>
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
        <v-btn color="primary" @click="openAddDialog">+ ເພີ່ມການສັ່ງຊື້</v-btn>
      </v-col>
    </v-row>
    
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <v-data-table
      v-else
      :headers="headers"
      :items="paginatedOrders"
      :items-per-page="-1"
      hide-default-footer
      class="elevation-1"
      item-value="Order_ID"
    >
      <template #[`item.index`]="{ index }">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </template>

      <template #[`item.Order_Date`]="{ item }">
        {{ formatDate(item.Order_Date) }}
      </template>
      
      <template #[`item.products`]="{ item }">
        {{ item.products.length }} ລາຍການ
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)" class="text-white" dark style="border-radius: 16px;">
          {{ item.status }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-start">
          <v-icon
            size="20"
            color="info"
            class="mr-2"
            @click="viewProducts(item)"
          >
           <v-img src="/icons/buy_order.png" width="20" height="20" />
          </v-icon>
          <v-tooltip text="ເບິ່ງໃບສັ່ງຊື້">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                size="20"
                color="teal"
                class="mr-2"
                @click="viewPurchaseOrder(item)"
              >
                <v-img src="/icons/purchase.png" width="20" height="20" />
              </v-icon>
            </template>
          </v-tooltip>
          <v-icon
            size="20"
            color="primary"
            class="mr-2"
            @click="editOrder(item)"
          >
             <v-img src="/icons/Edit.png" width="20" height="20" />
          </v-icon>
          <v-icon
            size="20"
            color="error"
            @click="deleteOrderDialog(item)"
          >
             <v-img src="/icons/Delete.png" width="20" height="20" />
          </v-icon>
        </div>
      </template>
    </v-data-table>

    <!-- Enhanced Pagination from product.vue -->
    <div v-if="!isLoading" class="d-flex justify-center align-center mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredOrders.length / itemsPerPage)"
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
            v-for="n in Math.ceil(filteredOrders.length / itemsPerPage)"
            :key="n"
            :value="n"
            @click="page = n"
          >
            <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Dialog: Add/Edit Order -->
    <v-dialog v-model="dialog" max-width="1200px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ isEditMode ? 'ແກ້ໄຂການສັ່ງຊື້' : 'ເພີ່ມການສັ່ງຊື້' }}
        </v-card-title>
          <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  :model-value="isEditMode ? `#${form.Order_ID}` : '[ສ້າງໃໝ່ອັດຕະໂນມັດ]'"
                  label="ເລກທີໃບສັ່ງຊື້"
                  readonly
                  disabled
                  dense
                  outlined
                  class="order-id-field"
                  style="color: #222; font-weight: bold; background: #f5f5f5;"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
            <v-text-field
                  v-model="form.Order_Date"
                      label="ວັນທີສັ່ງ"
                  type="date"
                      outlined dense
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.Sup_ID"
                  :items="suppliers"
                  item-title="name"
                  item-value="id"
                  label="ເລືອກຜູ້ສະໜອງ"
                  outlined dense clearable
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.status"
                  :items="['Pending', 'Completed', 'Cancelled']"
                  label="ສະຖານະ"
                  outlined dense clearable
                   :rules="[rules.required]"
                />
              </v-col>
            </v-row>
            <v-card class="mt-4" variant="outlined">
              <v-card-title class="text-subtitle-1">
                ເລືອກສິນຄ້າ
                <v-spacer />
                <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="productSelectionDialog = true">
                  ເພີ່ມສິນຄ້າ
                </v-btn>
              </v-card-title>
              
              <v-card-text>
                <v-table v-if="form.products?.length" class="items-table">
                  <thead>
                    <tr>
                      <th class="text-left" style="width: 15%;">ຊື່ສິນຄ້າ</th>
                      <th class="text-left" style="width: 10%;">ນ້ຳໜັກ</th>
                      <th class="text-center" style="width: 10%;">ຈຳນວນ</th>
                      <th class="text-right" style="width: 18%;">ລາຄາຊື້</th>
                      <th class="text-right" style="width: 18%;">ຄ່າກຳເໜັດ</th>
                      <th class="text-right" style="width: 15%;">ສ່ວນຫຼຸດ</th>
                      <th class="text-right" style="width: 9%;">ລວມ</th>
                      <th style="width: 5%;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.products" :key="index">
                      <td>{{ item.name }}</td>
                      <td>{{ getWeightText(item.weight) }}</td>
                      <td class="text-center">
                        <v-text-field
                          v-model.number="item.quantity"
                          type="number"
                          min="1"
                          density="compact"
                          hide-details
                          variant="outlined"
                          class="text-center"
                        />
                      </td>
                      <td class="text-right">
                        <v-text-field
                          :model-value="formatForInput(item.goldValue)"
                          @update:model-value="value => { item.goldValue = parseInput(value); }"
                          type="text"
                          min="0"
                          density="compact"
                          hide-details
                          variant="outlined"
                          class="text-right"
                        />
                      </td>
                      <td class="text-right">
                        <v-text-field
                          :model-value="formatForInput(item.craftsmanshipFee)"
                          @update:model-value="value => { item.craftsmanshipFee = parseInput(value); }"
                          type="text"
                          min="0"
                          density="compact"
                          hide-details
                          variant="outlined"
                          class="text-right"
                        />
                      </td>
                      <td class="text-right">
                        <v-text-field
                          :model-value="formatForInput(item.discount)"
                          @update:model-value="value => { item.discount = parseInput(value); }"
                          type="text"
                          min="0"
                          density="compact"
                          hide-details
                          variant="outlined"
                          class="text-right"
                        />
                      </td>
                      <td class="text-right">{{ formatCurrency(((item.quantity * (item.goldValue + item.craftsmanshipFee)) - item.discount) || 0) }}</td>
                      <td class="text-center">
                        <v-btn color="error" size="small" icon variant="text" @click="removeProduct(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="6" class="text-right font-weight-bold">ລວມກ່ອນສ່ວນຫຼຸດ:</td>
                      <td class="text-right">{{ formatCurrency(totalAmountBeforeDiscount) }}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-right font-weight-bold">ສ່ວນຫຼຸດທັງໝົດ:</td>
                      <td class="text-right">{{ formatCurrency(totalDiscount) }}</td>
                      <td></td>
                    </tr>
                    <tr class="font-weight-bold bg-grey-lighten-2">
                      <td colspan="6" class="text-right font-weight-bold">ລວມທັງໝົດສຸດທິ:</td>
                      <td class="text-right">{{ formatCurrency(grandTotal) }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </v-table>
                <v-alert v-else type="info" text class="mt-2"> ກະລຸນາເພີ່ມສິນຄ້າ </v-alert>
              </v-card-text>
            </v-card>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" text @click="dialog = false" :disabled="isSaving">ຍົກເລີກ</v-btn>
          <v-btn class="btn-save" @click="saveOrder" :loading="isSaving" :disabled="!formValid">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Product List Viewer -->
    <v-dialog v-model="productDialog" max-width="800px">
      <v-card>
        <v-card-title class="dialog-title">ລາຍການສິນຄ້າໃນອໍເດີ #{{ selectedOrder?.Order_ID }}</v-card-title>
        <v-card-text>
          <v-table v-if="selectedOrder?.products.length > 0">
            <thead>
              <tr>
                <th>ຊື່ສິນຄ້າ</th>
                <th>ຈຳນວນ</th>
                <th>ລາຄາຊື້/ໜ່ວຍ</th>
                <th>ສ່ວນຫຼຸດ</th>
                <th>ລວມ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in selectedOrder.products" :key="product.Pd_ID">
                <td>{{ product.Pd_name }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ formatCurrency(product.buyPrice) }}</td>
                <td>{{ formatCurrency(product.discount || 0) }}</td>
                <td>{{ formatCurrency((product.quantity * product.buyPrice) - (product.discount || 0)) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right"><strong>ລວມທັງໝົດ:</strong></td>
                <td><strong>{{ formatCurrency(calculateGrandTotal(selectedOrder.products)) }}</strong></td>
              </tr>
            </tfoot>
          </v-table>
          <v-alert v-else type="info" text> ບໍ່ມີສິນຄ້າໃນການສັ່ງຊື້ນີ້ </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="productDialog = false">ປິດ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Purchase Order Viewer -->
    <v-dialog v-model="purchaseOrderDialog" max-width="900px">
        <v-card>
            <PurchaseOrderComponent v-if="selectedOrder" :order="selectedOrder" @close="purchaseOrderDialog = false" />
      </v-card>
    </v-dialog>

    <!-- Product Selection Dialog -->
    <v-dialog v-model="productSelectionDialog" max-width="600px">
      <v-card>
        <v-card-title class="dialog-title">ເລືອກສິນຄ້າ</v-card-title>
        <v-card-text>
          <v-text-field v-model="productSearch" label="ຄົ້ນຫາສິນຄ້າ" prepend-inner-icon="mdi-magnify" outlined dense class="mt-4" />
          <v-table>
            <thead> <tr> <th>ຊື່ສິນຄ້າ</th> <th>ປະເພດ</th> <th>ນ້ຳໜັກ</th> <th></th> </tr> </thead>
            <tbody>
              <tr v-for="product in filteredAvailableProducts" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.category }}</td>
                <td>{{ product.weight }}</td>
                <td>
                  <v-btn color="primary" size="small" @click="selectProduct(product)"> ເລືອກ </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="dialog-title">ຢືນຢັນການລຶບ</v-card-title>
        <v-card-text> ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບອໍເດີ #{{ orderToDelete?.Order_ID }}? </v-card-text>
          <v-card-actions>
            <v-spacer />
          <v-btn class="btn-cancel" text @click="confirmDeleteDialog = false" :disabled="isSaving">ບໍ່</v-btn>
          <v-btn class="btn-save" @click="confirmDelete" :loading="isSaving">ແມ່ນ</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useApi from '~/composables/useApi';
import PurchaseOrderComponent from '~/components/buy/PurchaseOrder.vue';

const api = useApi();
const router = useRouter();
const isLoading = ref(true);
const isSaving = ref(false);
const snackbar = ref({ show: false, message: '', color: 'success' });

const orders = ref([]);
const suppliers = ref([]);
const allProducts = ref([]);
const latestPrice = ref(null);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);

const dialog = ref(false);
const isEditMode = ref(false);
const form = ref({ products: [] });
const formRef = ref(null);
const formValid = ref(false);

const productDialog = ref(false);
const selectedOrder = ref(null);

const purchaseOrderDialog = ref(false);

const productSelectionDialog = ref(false);
const productSearch = ref('');

const confirmDeleteDialog = ref(false);
const orderToDelete = ref(null);

const pageMenu = ref(false);

const weightOptions = ref([
  { text: '0.25 ບາດ', value: 'B0_25' },
  { text: '0.5 ບາດ', value: 'B0_5' },
  { text: '1 ບາດ', value: 'B1' },
  { text: '2 ບາດ', value: 'B2' },
  { text: '3 ບາດ', value: 'B3' },
  { text: '5 ບາດ', value: 'B5' },
  { text: '10 ບາດ', value: 'B10' },
]);

const rules = {
  required: v => !!v || 'Required.'
};

const headers = [
  { title: 'ລຳດັບ', value: 'index', sortable: false },
  { title: 'ວັນທີສັ່ງ', value: 'Order_Date' },
  { title: 'ຜູ້ສະໜອງ', value: 'Tb_Supplier.Sup_name' },
  { title: 'ລາຍການ', value: 'products' },
  { title: 'ສະຖານະ', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'start' }
];

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const formatForInput = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseInput = (value) => {
  return Number(String(value).replace(/,/g, '')) || 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

const getStatusColor = (status) => {
  const map = { 'Completed': 'green', 'Pending': 'orange', 'Cancelled': 'red' };
  return map[status] || 'grey';
};

const statusFilter = ref(null);
const statusOptions = ['Pending', 'Completed', 'Cancelled'];

const filteredOrders = computed(() => {
  let filtered = orders.value;

  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    filtered = filtered.filter(order =>
      order.Tb_Supplier?.Sup_name?.toLowerCase().includes(searchTerm) ||
      order.Order_ID.toString().includes(searchTerm)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }

  return filtered;
});

const paginatedOrders = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredOrders.value.slice(start, end);
});

const totalAmountBeforeDiscount = computed(() => {
  return form.value.products.reduce((sum, item) => {
    const itemTotal = item.quantity * (item.goldValue + item.craftsmanshipFee);
    return sum + (itemTotal || 0);
  }, 0);
});

const totalDiscount = computed(() => {
  return form.value.products.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
});

const grandTotal = computed(() => {
  return totalAmountBeforeDiscount.value - totalDiscount.value;
});

const filteredAvailableProducts = computed(() => {
  if (!productSearch.value) return allProducts.value;
  return allProducts.value.filter(p => p.name.toLowerCase().includes(productSearch.value.toLowerCase()));
});

const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    const [ordersResponse, suppliersResponse, productsResponse] = await Promise.all([
      api.get('/orders'),
      api.get('/suppliers'),
      api.get('/products')
    ]);
    
    orders.value = ordersResponse.data.orders;
    latestPrice.value = ordersResponse.data.latestPrice;

    suppliers.value = suppliersResponse.data;
    allProducts.value = productsResponse.data;

  } catch (error) {
    showSnackbar('Failed to fetch initial data', 'error');
    console.error("Error fetching initial data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInitialData);

const resetForm = () => {
  form.value = {
    Order_Date: formatDate(new Date()),
    Sup_ID: null,
    status: 'Pending',
    products: []
  };
  formRef.value?.resetValidation();
};

const openAddDialog = () => {
  isEditMode.value = false;
  resetForm();
  dialog.value = true;
};

const editOrder = (order) => {
  isEditMode.value = true;
  form.value = {
      ...order,
      Order_Date: formatDate(order.Order_Date),
    products: order.products.map(p => {
      const weightInGrams = convertWeightCodeToGrams(p.weight);
      let goldValue = 0;
      if (latestPrice.value && latestPrice.value.Buy_price) {
          const buyPrice = Number(latestPrice.value.Buy_price);
          if (!isNaN(buyPrice) && buyPrice > 0 && weightInGrams > 0) {
            const goldPricePerGram = buyPrice / 15.16;
            goldValue = goldPricePerGram * weightInGrams;
          }
      }
      const craftsmanshipFee = p.buyPrice - goldValue;

      return {
        id: p.Pd_ID,
        name: p.Pd_name,
        quantity: p.quantity,
        weight: p.weight,
        discount: p.discount || 0,
        goldValue: Math.round(goldValue),
        craftsmanshipFee: Math.round(craftsmanshipFee > 0 ? craftsmanshipFee : (p.buyPrice || 0))
      }
    })
  };
  dialog.value = true;
};

const saveOrder = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    const payload = {
        ...form.value,
        products: form.value.products.map(p => ({
          id: p.id,
          quantity: p.quantity,
          buyPrice: p.goldValue + p.craftsmanshipFee,
          discount: p.discount
        }))
    };
    
    if (isEditMode.value) {
      await api.put(`/orders/${form.value.Order_ID}`, payload);
      showSnackbar('ອັບເດດການສັ່ງຊື້ສຳເລັດ');
    } else {
      await api.post('/orders', payload);
      showSnackbar('ສ້າງການສັ່ງຊື້ສຳເລັດ');
    }
    dialog.value = false;
    await fetchInitialData();
  } catch (error) {
    showSnackbar(error.message, 'error');
  }
};

const deleteOrderDialog = (order) => {
  orderToDelete.value = order;
  confirmDeleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/orders/${orderToDelete.value.Order_ID}`);
    showSnackbar('ລຶບອໍເດີສຳເລັດ');
    confirmDeleteDialog.value = false;
    await fetchInitialData(); // Refresh data
  } catch (error) {
    showSnackbar(error.message, 'error');
  }
};

const viewProducts = (order) => {
  selectedOrder.value = order;
  productDialog.value = true;
};

const viewPurchaseOrder = (order) => {
  selectedOrder.value = order;
  purchaseOrderDialog.value = true;
}

const calculateGrandTotal = (products) => {
  if (!products) return 0;
  return products.reduce((sum, p) => {
    const lineTotal = (p.quantity * p.buyPrice) - (p.discount || 0);
    return sum + lineTotal;
  }, 0);
};

const convertWeightCodeToGrams = (code) => {
  if (code === null || code === undefined) return 0;
  const codeStr = String(code);

  const directWeight = parseFloat(codeStr);
  if (!isNaN(directWeight) && !codeStr.startsWith('B')) {
    // If it's a direct number, assume it's already in grams
    return directWeight;
  }

  // If not a direct float, try to parse as a weight code (e.g., 'B1', 'B0_5')
  const parts = codeStr.split('B');
  if (parts.length < 2) return 0;

  const numericPart = parts[1].replace('_', '.');
  const weightInBaht = parseFloat(numericPart);

  if (isNaN(weightInBaht)) return 0;

  // 1 Baht of gold is 15.16 grams
  return weightInBaht * 15.16;
};

const getWeightText = (value) => {
  const option = weightOptions.value.find(opt => opt.value === value);
  return option ? option.text : value;
};

const selectProduct = (product) => {
  const exists = form.value.products.some(p => p.id === product.id);
  if (exists) {
    showSnackbar('ສິນຄ້ານີ້ຖູກເພີ່ມແລ້ວ', 'warning');
    return;
  }

  const calculatedDiscount = 0; // Set default discount to 0
  const craftsmanshipFee = parseFloat(product.estimatePrice) || 0;
  let goldValue = 0;

  console.log('selectProduct: latestPrice.value:', latestPrice.value);
  console.log('selectProduct: latestPrice.value?.Buy_price:', latestPrice.value?.Buy_price);

  if (latestPrice.value && latestPrice.value.Buy_price) {
    const buyPrice = Number(latestPrice.value.Buy_price);
    console.log('selectProduct: converted buyPrice:', buyPrice);

    if (!isNaN(buyPrice) && buyPrice > 0) {
    const weightInGrams = convertWeightCodeToGrams(product.weight);
      console.log('selectProduct: weightInGrams:', weightInGrams);
    
    if (weightInGrams > 0) {
        const goldPricePerGram = buyPrice / 15.16;
        goldValue = goldPricePerGram * weightInGrams;
        console.log('selectProduct: calculated goldValue:', goldValue);
      } else {
        console.log('selectProduct: weightInGrams is 0 or invalid.');
      }
    } else {
        console.log('selectProduct: Converted buyPrice is NaN or 0.');
        showSnackbar('ບໍ່ສາມາດດຶງລາຄາຄຳລ່າສຸດໄດ້, ລາຄາຊື້ຈະສະແດງເປັນ 0', 'error');
    }
  } else {
     console.log('selectProduct: latestPrice or latestPrice.Buy_price is missing.');
     showSnackbar('ບໍ່ສາມາດດຶງລາຄາຄຳລ່າສຸດໄດ້, ລາຄາຊື້ຈະສະແດງເປັນ 0', 'error');
  }

  const newProduct = {
    id: product.id,
    name: product.name,
    quantity: 1, // default quantity to 1
    weight: product.weight,
    discount: calculatedDiscount, // Use the new default
    goldValue: Math.round(goldValue),
    craftsmanshipFee: craftsmanshipFee
  };

  form.value.products.push(newProduct);
  productSelectionDialog.value = false;
};

const removeProduct = (index) => {
  form.value.products.splice(index, 1);
};

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredOrders.value.length / itemsPerPage.value)
  if (page.value < totalPages) {
    page.value++
  }
}

watch([search, statusFilter], () => {
  page.value = 1;
});
</script>

<style scoped>
.dialog-title { background-color: #365a76; color: white; font-weight: bold; }
.btn-cancel { background-color: #f44336 !important; color: white !important; }
.btn-save { background-color: #4caf50 !important; color: white !important; }
.cursor-pointer { cursor: pointer; }
.order-id-field .v-field__input {
  background-color: #f5f5f5;
  color: #222 !important;
  font-weight: bold;
  opacity: 1 !important;
}
.order-id-field.v-input--is-disabled .v-field__input {
  background-color: #e0e0e0;
  color: #222 !important;
  font-weight: bold;
  opacity: 1 !important;
}

.items-table th {
  font-weight: bold;
}

.items-table td, .items-table th {
  padding: 8px 12px;
}
</style>

