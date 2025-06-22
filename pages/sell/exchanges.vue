<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4" style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນການປ່ຽນສິນຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Search and Add Button -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ (ຊື່ລູກຄ້າ, ຊື່ສິນຄ້າ)"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          + ເພີ່ມການປ່ຽນສິນຄ້າ
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <!-- Data Table -->
    <v-data-table
      v-else
      :headers="headers"
      :items="paginatedExchanges"
      :items-per-page="-1"
      hide-default-footer
      class="elevation-1"
      item-value="Exch_ID"
    >
      <template #[`item.index`]="{ index }">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </template>
      
      <template #[`item.Old_Product.Pd_name`]="{ item }">
        {{ item.Old_Product?.Pd_name || 'N/A' }}
      </template>

      <template #[`item.New_Product.Pd_name`]="{ item }">
        {{ item.New_Product?.Pd_name || 'N/A' }}
      </template>

      <template #[`item.Exch_Date`]="{ item }">
        {{ formatDate(item.Exch_Date) }}
      </template>
      
      <template #[`item.Different_price`]="{ item }">
        <v-chip :color="item.Different_price >= 0 ? 'green' : 'red'" class="text-white">
          {{ formatCurrency(item.Different_price) }}
        </v-chip>
      </template>
      
      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-center">
          <v-icon size="small" color="info" class="mr-2" @click="openViewDialog(item)">mdi-eye</v-icon>
          <v-icon size="small" color="primary" class="mr-2" @click="openEditDialog(item)">mdi-pencil</v-icon>
          <v-icon size="small" color="error" @click="openDeleteDialog(item)">mdi-delete</v-icon>
        </div>
      </template>

       <template #no-data>
        <div class="text-center py-4">
          <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-swap-horizontal-bold</v-icon>
          <p class="text-h6 text-grey-lighten-1">ຍັງບໍ່ມີຂໍ້ມູນການປ່ຽນສິນຄ້າ</p>
        </div>
      </template>
    </v-data-table>

    <!-- Pagination -->
    <div v-if="!isLoading && filteredExchanges.length > 0" class="d-flex justify-center align-center mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredExchanges.length / itemsPerPage)"
        :total-visible="7"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="dialog-title">
         {{ isEditMode ? 'ແກ້ໄຂຂໍ້ມູນການປ່ຽນສິນຄ້າ' : 'ເພີ່ມການປ່ຽນສິນຄ້າ' }}
        </v-card-title>
        <v-card-text class="py-4">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <!-- Customer and Date -->
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="form.Cust_ID"
                  :items="customers"
                  item-title="Cust_name"
                  item-value="Cust_ID"
                  label="ເລືອກລູກຄ້າ"
                  outlined dense
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.Exch_Date"
                  label="ວັນທີປ່ຽນ"
                  type="date"
                  outlined dense
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Old Product -->
              <v-col cols="12"> <v-divider class="my-2"/> <h3 class="text-subtitle-1">ຂໍ້ມູນສິນຄ້າເກົ່າ (ຮັບຄືນ)</h3> </v-col>
              <v-col cols="12" md="4">
                 <v-text-field
                  v-model="form.Old_Pd_Description"
                  label="ຊື່ສິນຄ້າເກົ່າ"
                  placeholder="ເຊັ່ນ: ສາຍຄໍ 1 ບາດ ລາຍກະດູກມັງກອນ"
                  outlined dense
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="form.Old_Pd_Type"
                  label="ປະເພດ"
                  placeholder="ເຊັ່ນ: ສາຍຄໍ"
                  outlined dense
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="formatForInput(form.Old_Product_Value)"
                  @update:model-value="form.Old_Product_Value = parseInput($event)"
                  label="ມູນຄ່າປະເມີນ (ຮັບຊື້ຄືນ)"
                  type="text"
                  outlined dense
                  prefix="LAK"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="form.Old_Pd_Actual_Weight"
                  label="ນ້ຳໜັກຈິງ (ກຣັມ)"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.required, rules.isNumber]"
                  hint="ນ້ຳໜັກທີ່ຊັ່ງໄດ້ຕອນຮັບຄືນ"
                />
              </v-col>

              <!-- New Product -->
              <v-col cols="12"> <v-divider class="my-2"/> <h3 class="text-subtitle-1">ຂໍ້ມູນສິນຄ້າໃໝ່ (ຂາຍ)</h3> </v-col>
               <v-col cols="12" md="4">
                 <v-autocomplete
                  v-model="form.New_Pd_ID"
                  :items="availableProducts"
                  :item-title="item => `${item.Pd_name} (${item.Weight || 0}g)`"
                  item-value="Pd_ID"
                  label="ເລືອກສິນຄ້າໃໝ່"
                  outlined dense
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="formatForInput(form.New_Product_Value)"
                  @update:model-value="form.New_Product_Value = parseInput($event)"
                  label="ລາຄາຂາຍສິນຄ້າໃໝ່"
                  type="text"
                  outlined dense
                   prefix="LAK"
                  :rules="[rules.required]"
                />
              </v-col>
               <v-col cols="12" md="4">
                <v-text-field
                  v-model="newProductWeight"
                  label="ນ້ຳໜັກ (ກຣັມ)"
                  readonly
                  variant="filled"
                />
              </v-col>
              
              <!-- Calculation -->
              <v-col cols="12"> <v-divider class="my-2"/> <h3 class="text-subtitle-1">ສະຫຼຸບຍອດ</h3> </v-col>
               <v-col cols="12" md="4">
                <v-text-field
                  :model-value="formatForInput(form.Gold_Change_Fee)"
                  @update:model-value="form.Gold_Change_Fee = parseInput($event)"
                  label="ຄ່າປ່ຽນທອງ"
                  type="text"
                  outlined dense
                   prefix="LAK"
                />
              </v-col>
               <v-col cols="12" md="4">
                <v-text-field
                  :model-value="formatForInput(form.Lost_Weight_Fee)"
                  @update:model-value="form.Lost_Weight_Fee = parseInput($event)"
                  label="ຄ່ານ້ຳໜັກທອງຫຼຸດ"
                  type="text"
                  outlined dense
                   prefix="LAK"
                />
              </v-col>
               <v-col cols="12" md="4">
                <v-text-field
                  :model-value="formatForInput(calculatedDifference)"
                  label="ຍອດສ່ວນຕ່າງ"
                  readonly
                  variant="filled"
                  :hint="differenceHint"
                  persistent-hint
                   prefix="LAK"
                />
              </v-col>
                <v-col cols="12">
                    <v-textarea
                        v-model="form.Notes"
                        label="ໝາຍເຫດ"
                        outlined
                        dense
                        rows="2"
                    />
                </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" text @click="closeDialog" :disabled="isSaving">ຍົກເລີກ</v-btn>
          <v-btn class="btn-save" @click="saveExchange" :loading="isSaving" :disabled="!formValid">ບັນທຶກ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="700px">
        <v-card>
            <v-card-title class="dialog-title">ລາຍລະອຽດການປ່ຽນສິນຄ້າ #{{ selectedExchange?.Exch_ID }}</v-card-title>
            <v-card-text v-if="selectedExchange" class="py-4">
                <v-row>
                    <v-col cols="12" md="6"><strong>ID:</strong> {{ selectedExchange.Exch_ID }}</v-col>
                    <v-col cols="12" md="6"><strong>ວັນທີ:</strong> {{ formatDate(selectedExchange.Exch_Date) }}</v-col>
                    <v-col cols="12"><strong>ລູກຄ້າ:</strong> {{ selectedExchange.Tb_Customer?.Cust_name }}</v-col>
                    <v-col cols="12"><v-divider/></v-col>
                    <v-col cols="12" md="6"><strong>ສິນຄ້າເກົ່າ:</strong> {{ selectedExchange.Old_Product?.Pd_name || 'N/A' }}</v-col>
                    <v-col cols="12" md="6"><strong>ປະເພດ:</strong> {{ selectedExchange.Old_Product?.Type || 'N/A' }}</v-col>
                    <v-col cols="12" md="6"><strong>ນ້ຳໜັກຈິງ:</strong> {{ selectedExchange.Old_Product?.Weight }}g</v-col>
                    <v-col cols="12" md="6"><strong>ມູນຄ່າ (ຮັບຄືນ):</strong> {{ formatCurrency(selectedExchange.Old_Product_Value) }}</v-col>

                    <v-col cols="12" md="4"><strong>ສິນຄ້າໃໝ່:</strong> {{ selectedExchange.New_Product?.Pd_name }}</v-col>
                    <v-col cols="12" md="4"><strong>ນ້ຳໜັກ:</strong> {{ selectedExchange.New_Product?.Weight }}g</v-col>
                    <v-col cols="12" md="4"><strong>ມູນຄ່າ (ຂາຍ):</strong> {{ formatCurrency(selectedExchange.New_Product_Value) }}</v-col>

                    <v-col cols="12"><v-divider/></v-col>
                     <v-col cols="12" md="4"><strong>ຄ່າປ່ຽນທອງ:</strong> {{ formatCurrency(selectedExchange.Gold_Change_Fee) }}</v-col>
                     <v-col cols="12" md="4"><strong>ຄ່ານ້ຳໜັກທອງຫຼຸດ:</strong> {{ formatCurrency(selectedExchange.Lost_Weight_Fee) }}</v-col>
                    <v-col cols="12" md="4"><strong>ສ່ວນຕ່າງ:</strong> <v-chip :color="selectedExchange.Different_price >= 0 ? 'green' : 'red'" class="text-white">{{ formatCurrency(selectedExchange.Different_price) }}</v-chip></v-col>
                    <v-col cols="12" v-if="selectedExchange.Notes"><strong>ໝາຍເຫດ:</strong> {{ selectedExchange.Notes }}</v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="viewDialog = false">ປິດ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px" persistent>
        <v-card>
            <v-card-title class="dialog-title">ຢືນຢັນການລຶບ</v-card-title>
            <v-card-text>
                ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນການປ່ຽນສິນຄ້າ #{{ selectedExchange?.Exch_ID }}? <br/>
                <strong class="text-error">ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້!</strong>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn class="btn-cancel" @click="deleteDialog = false" :disabled="isSaving">ບໍ່</v-btn>
                <v-btn color="error" @click="deleteExchange" :loading="isSaving">ແມ່ນ, ລຶບເລີຍ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// ----- Utils -----
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('lo-LA', options);
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(value);
}

const formatForInput = (value) => {
    if (value === null || value === undefined) return null;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseInput = (value) => {
    if (!value) return null;
    const num = Number(String(value).replace(/,/g, ''));
    return isNaN(num) ? null : num;
};

// --- State Management ---
const search = ref('');
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const selectedExchange = ref(null);
const selectedExchangeId = ref(null);
const formValid = ref(false);
const formRef = ref(null);
const snackbar = ref({ show: false, message: '', color: '' });

// Pagination
const page = ref(1);
const itemsPerPage = ref(10);

const emptyForm = () => ({
  Exch_ID: null,
  Cust_ID: '',
  Old_Pd_ID: null,
  Old_Pd_Description: '',
  Old_Pd_Type: '',
  New_Pd_ID: '',
  Exch_Date: new Date().toISOString().split('T')[0],
  Old_Pd_Actual_Weight: 0,
  Old_Product_Value: 0,
  New_Product_Value: 0,
  Gold_Change_Fee: 0,
  Lost_Weight_Fee: 0,
  Different_price: 0,
  Notes: '',
});

const form = ref(emptyForm());

const { data: exchanges, pending: isLoading, refresh: refreshExchanges } = useAsyncData('exchanges', () => $fetch('/api/exchanges'), { initialCache: false });
const { data: customers } = useAsyncData('customers', () => $fetch('/api/customers'), { lazy: true, initialCache: false });
const { data: products } = useAsyncData('products', () => $fetch('/api/products'), { lazy: true, initialCache: false });
const { data: latestPrice } = useAsyncData('latestPrice', () => $fetch('/api/prices/latest'), { lazy: true });

// ----- Computed Properties -----
const filteredExchanges = computed(() => {
  if (!exchanges.value) return [];
  if (!search.value) return exchanges.value;
  const lowerCaseSearch = search.value.toLowerCase();
  return exchanges.value.filter(ex => {
    const customerName = ex.Tb_Customer?.Cust_name?.toLowerCase() || '';
    const oldProductDesc = ex.Old_Pd_Description?.toLowerCase() || '';
    const newProductName = ex.New_Product?.Pd_name?.toLowerCase() || '';
    return customerName.includes(lowerCaseSearch) || oldProductDesc.includes(lowerCaseSearch) || newProductName.includes(lowerCaseSearch);
  });
});

const paginatedExchanges = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredExchanges.value.slice(start, end);
});

const availableProducts = computed(() => {
  if (!products.value) return [];
  return products.value;
});

const calculatedDifference = computed(() => {
  const oldValue = Number(form.value.Old_Product_Value) || 0;
  const newValue = Number(form.value.New_Product_Value) || 0;
  const goldChangeFee = Number(form.value.Gold_Change_Fee) || 0;
  const lostWeightFee = Number(form.value.Lost_Weight_Fee) || 0;
  return (newValue + goldChangeFee + lostWeightFee) - oldValue;
});

const differenceHint = computed(() => {
  const diff = calculatedDifference.value;
  if (diff > 0) return 'ລູກຄ້າຕ້ອງຈ່າຍເພີ່ມ';
  if (diff < 0) return 'ຮ້ານຕ້ອງຈ່າຍຄືນລູກຄ້າ';
  return 'ບໍ່ມີສ່ວນຕ່າງ';
});

const oldProductWeight = computed(() => {
  if (!form.value.Old_Pd_ID || !products.value) return 0;
  const product = products.value.find(p => p.Pd_ID === form.value.Old_Pd_ID);
  return product?.Weight ?? 0;
});

const newProductWeight = computed(() => {
  if (!form.value.New_Pd_ID || !products.value) return 0;
  const product = products.value.find(p => p.Pd_ID === form.value.New_Pd_ID);
  return product?.Weight ?? 0;
});


// ----- Watchers -----
watch(() => form.value.Old_Pd_ID, (newId) => {
  if (newId) {
    const selectedProduct = products.value?.find(p => p.Pd_ID === newId);
    if (selectedProduct) {
        form.value.Old_Pd_Actual_Weight = selectedProduct.Weight ?? 0;
    }
    if (newId === form.value.New_Pd_ID) {
        form.value.New_Pd_ID = null;
        form.value.New_Product_Value = 0;
    }
  } else {
    form.value.Old_Pd_Actual_Weight = 0;
  }
});

watch(() => form.value.New_Pd_ID, (newId) => {
  if (newId && latestPrice.value && products.value) {
    const selectedProduct = products.value.find(p => p.Pd_ID === newId);
    if (selectedProduct) {
      const sellPricePerBaht = Number(latestPrice.value.Sell_price) || 0;
      const weightInGrams = Number(selectedProduct.Weight) || 0;
      const patternValue = Number(selectedProduct.Pattern_value) || 0;
      
      if (sellPricePerBaht > 0) {
        const pricePerGram = sellPricePerBaht / 15.16;
        const goldValue = pricePerGram * weightInGrams;
        // Round to nearest 1000 LAK as is common
        form.value.New_Product_Value = Math.round((goldValue + patternValue) / 1000) * 1000;
      } else {
        // Fallback to pattern value if no price is set
        form.value.New_Product_Value = patternValue;
      }
    }
  } else {
     form.value.New_Product_Value = 0;
  }
});

// ----- Dialog and Form Logic -----
const openAddDialog = () => {
  isEditMode.value = false;
  form.value = emptyForm();
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditMode.value = true;
  selectedExchangeId.value = item.Exch_ID;
  form.value = {
    Exch_ID: item.Exch_ID,
    Cust_ID: item.Cust_ID,
    New_Pd_ID: item.New_Pd_ID,
    Old_Pd_ID: item.Old_Pd_ID,
    Exch_Date: item.Exch_Date ? new Date(item.Exch_Date).toISOString().split('T')[0] : '',
    Notes: item.Notes ?? '',
    
    Old_Pd_Description: item.Old_Product?.Pd_name ?? '',
    Old_Pd_Type: item.Old_Product?.Type ?? '',
    Old_Pd_Actual_Weight: Number(item.Old_Product?.Weight) ?? 0,

    Old_Product_Value: item.Old_Product_Value ?? 0,
    New_Product_Value: item.New_Product_Value ?? 0,
    Gold_Change_Fee: item.Gold_Change_Fee ?? 0,
    Lost_Weight_Fee: item.Lost_Weight_Fee ?? 0,
    Different_price: item.Different_price ?? 0,
  };
  dialog.value = true;
};

const openViewDialog = (item) => {
  selectedExchange.value = item;
  viewDialog.value = true;
};

const openDeleteDialog = (item) => {
  selectedExchange.value = item;
  deleteDialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  setTimeout(() => {
    form.value = emptyForm();
    isEditMode.value = false;
    selectedExchangeId.value = null;
    formRef.value?.resetValidation();
  }, 300);
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  selectedExchange.value = null;
};

// ----- API Calls -----
const saveExchange = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSaving.value = true;

  const payload = {
    ...form.value,
    Different_price: calculatedDifference.value,
    Gold_Change_Fee: Number(form.value.Gold_Change_Fee) || 0,
    Lost_Weight_Fee: Number(form.value.Lost_Weight_Fee) || 0,
    Old_Product_Value: Number(form.value.Old_Product_Value) || 0,
    New_Product_Value: Number(form.value.New_Product_Value) || 0,
    // Pass the old product details for creation on the backend
    Old_Pd_Description: form.value.Old_Pd_Description,
    Old_Pd_Type: form.value.Old_Pd_Type,
    Old_Pd_Actual_Weight: Number(form.value.Old_Pd_Actual_Weight) || 0,
  };
  
  try {
    if (isEditMode.value) {
      await $fetch(`/api/exchanges/${selectedExchangeId.value}`, {
        method: 'PUT',
        body: payload,
      });
      snackbar.value = { show: true, message: 'ອັບເດດຂໍ້ມູນສຳເລັດ', color: 'success' };
    } else {
      await $fetch('/api/exchanges', {
        method: 'POST',
        body: payload,
      });
      snackbar.value = { show: true, message: 'ເພີ່ມຂໍ້ມູນການປ່ຽນສິນຄ້າໃໝ່ສຳເລັດ', color: 'success' };
    }
    await refreshExchanges();
    closeDialog();
  } catch (error) {
    const errorMessage = error.data?.message || error.message || 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ';
    console.error('Error saving exchange:', error);
    snackbar.value = { show: true, message: `ເກີດຂໍ້ຜິດພາດ: ${errorMessage}`, color: 'error' };
  } finally {
    isSaving.value = false;
  }
};

const deleteExchange = async () => {
    if (!selectedExchange.value) return;
    isSaving.value = true;
    try {
        await $fetch(`/api/exchanges/${selectedExchange.value.Exch_ID}`, {
            method: 'DELETE',
        });
        await refreshExchanges();
        snackbar.value = { show: true, message: 'ລຶບຂໍ້ມູນສຳເລັດ', color: 'success' };
        closeDeleteDialog();
    } catch (error) {
        console.error('Error deleting exchange:', error);
        snackbar.value = { show: true, message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', color: 'error' };
    } finally {
        isSaving.value = false;
    }
};

// ----- Headers -----
const headers = [
  { title: 'ລ/ດ', key: 'index', sortable: false, align: 'center' },
  { title: 'ລູກຄ້າ', key: 'Tb_Customer.Cust_name', sortable: true },
  { title: 'ວັນທີ', key: 'Exch_Date', sortable: true },
  { title: 'ສິນຄ້າເກົ່າ (ຮັບຄືນ)', key: 'Old_Product.Pd_name', sortable: true },
  { title: 'ສິນຄ້າໃໝ່ (ຂາຍ)', key: 'New_Product.Pd_name', sortable: true },
  { title: 'ສ່ວນຕ່າງ', key: 'Different_price', sortable: true, align: 'end' },
  { title: 'ການກະທຳ', key: 'actions', sortable: false, align: 'center' },
];

const rules = {
    required: v => !!v || 'ກະລຸນາປ້ອນຂໍ້ມູນ',
    isNumber: v => !isNaN(parseFloat(v)) && isFinite(v) || 'ກະລຸນາປ້ອນຕົວເລກ',
};

// ----- Lifecycle Hooks -----
onMounted(() => {
  // Data is fetched via useAsyncData
});
</script>

<style scoped>
.dialog-title { background-color: #365a76; color: white; font-weight: bold; }
.btn-cancel { background-color: #f44336 !important; color: white !important; }
.btn-save { background-color: #4caf50 !important; color: white !important; }
</style>