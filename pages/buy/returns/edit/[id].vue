<template>
    <div class="page-background">
        <Header title="ແກ້ໄຂຂໍ້ມູນການຊື້ຄືນ" back-route="/buy/returns" />

        <div v-if="loading.page" class="text-center py-10">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
        </div>

        <v-card v-else class="mt-4 pa-4">
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                    <!-- Readonly Info Section -->
                    <v-col cols="12">
                         <v-card variant="tonal" color="blue-grey-lighten-5">
                            <v-card-title class="text-primary font-weight-bold">ຂໍ້ມູນການຊື້ຄືນ (ບໍ່ສາມາດແກ້ໄຂໄດ້)</v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12" sm="4">
                                        <v-text-field
                                            v-model="repurchase.customerName"
                                            label="ລູກຄ້າ"
                                            readonly
                                            variant="solo"
                                            dense
                                            prepend-inner-icon="mdi-account-outline"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field
                                            v-model="repurchase.repurchaseDate"
                                            label="ວັນທີຊື້ຄືນ"
                                            readonly
                                            variant="solo"
                                            dense
                                            prepend-inner-icon="mdi-calendar"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field
                                            v-model="repurchase.userName"
                                            label="ພະນັກງານ"
                                            readonly
                                            variant="solo"
                                            dense
                                            prepend-inner-icon="mdi-account-tie-outline"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>

                     <!-- Editable Fields Section -->
                    <v-col cols="12">
                        <v-card variant="outlined">
                            <v-card-title class="text-primary font-weight-bold">ປັບປຸງຂໍ້ມູນ</v-card-title>
                            <v-card-text>
                                <v-autocomplete
                                    v-model="repurchase.productIds"
                                    :items="availableProducts"
                                    item-title="name"
                                    item-value="id"
                                    label="ເລືອກສິນຄ້າທີ່ຊື້ຄືນ"
                                    :loading="loading.products"
                                    multiple
                                    chips
                                    deletable-chips
                                    :rules="[rules.arrayNotEmpty]"
                                    prepend-inner-icon="mdi-gold"
                                    variant="outlined"
                                    dense
                                    :no-data-text="noDataTextForProducts"
                                >
                                     <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props" :title="item.raw.name" :subtitle="`ນ້ຳໜັກ: ${formatWeight(item.raw.weight)}`"></v-list-item>
                                    </template>
                                </v-autocomplete>
                                <v-text-field
                                    :model-value="formatForInput(repurchase.repurchasePrice)"
                                    @update:model-value="value => repurchase.repurchasePrice = parseInput(value)"
                                    label="ລາຄາຊື້ຄືນ (ກີບ)"
                                    type="text"
                                    :rules="[rules.required, rules.positive]"
                                    prepend-inner-icon="mdi-cash"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                                <v-text-field
                                    :model-value="formatForInput(repurchase.damageCost)"
                                    @update:model-value="value => repurchase.damageCost = parseInput(value)"
                                    label="ຄ່າເສຍຫາຍຮູບປະພັນ (ກີບ)"
                                    type="text"
                                    :rules="[rules.nonNegative]"
                                    prepend-inner-icon="mdi-scissors-cutting"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                                <v-text-field
                                    :model-value="formatForInput(repurchase.looseGoldCost)"
                                    @update:model-value="value => repurchase.looseGoldCost = parseInput(value)"
                                    label="ຄ່າທອງຫຼຸດ (ກີບ)"
                                    type="text"
                                    :rules="[rules.nonNegative]"
                                    prepend-inner-icon="mdi-weight-kilogram"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                                <v-text-field
                                    :model-value="formatCurrency(netRepurchasePrice)"
                                    label="ລາຄາຊື້ຄືນສຸດທິ (ກີບ)"
                                    readonly
                                    prepend-inner-icon="mdi-cash-multiple"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                
                <!-- Selected Products Details Section -->
                <v-row v-if="selectedProducts.length > 0" class="mt-4">
                    <v-col cols="12">
                        <v-card variant="tonal" color="blue-grey-lighten-5">
                             <v-card-title class="text-primary font-weight-bold">ລາຍລະອຽດສິນຄ້າທີ່ເລືອກ</v-card-title>
                             <v-card-text>
                                 <v-data-table
                                    :headers="productTableHeaders"
                                    :items="selectedProducts"
                                    item-value="id"
                                    density="compact"
                                    class="elevation-1"
                                    hide-default-footer
                                >
                                <!-- eslint-disable-next-line vue/valid-v-slot -->
                                <template #item.weight="{ item }">
                                    {{ formatWeight(item.weight) }}
                                </template>
                                <!-- eslint-disable-next-line vue/valid-v-slot -->
                                <template #item.patternValue="{ item }">
                                    {{ formatCurrency(item.patternValue) }}
                                </template>
                                 <template #bottom></template>
                                </v-data-table>
                             </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                 <v-card-actions class="mt-6 pa-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="grey" @click="cancel">ຍົກເລີກ</v-btn>
                    <v-btn color="primary" :loading="loading.saving" @click="save" :disabled="!valid">
                        <v-icon left>mdi-content-save</v-icon>
                        ບັນທຶກການແກ້ໄຂ
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
        
        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
        </v-snackbar>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useApi from '~/composables/useApi';
import { formatCurrency, formatWeight, parseCurrency } from '~/utils/format';

const api = useApi();
const router = useRouter();
const route = useRoute();

const form = ref(null);
const valid = ref(true);
const loading = ref({
    page: true,
    products: false,
    saving: false,
});
const repurchaseId = route.params.id;

const repurchase = ref({
  custId: null,
  customerName: '',
  userName: '',
  repurchaseDate: '',
  productIds: [],
  repurchasePrice: null,
  damageCost: null,
  looseGoldCost: null,
  reReason: '',
});

const availableProducts = ref([]);

const rules = {
    required: value => !!value || 'ກະລຸນາປ້ອນຂໍ້ມູນ',
    positive: value => (parseCurrency(value) > 0) || 'ຕ້ອງເປັນຄ່າບວກ',
    nonNegative: value => (parseCurrency(value) >= 0) || 'ຕ້ອງເປັນຄ່າບວກ ຫຼື ສູນ',
    arrayNotEmpty: value => value.length > 0 || 'ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ລາຍການ',
};

const snackbar = ref({
    visible: false,
    text: '',
    color: '',
});

const productTableHeaders = [
    { title: 'ຊື່ສິນຄ້າ', key: 'name', sortable: false },
    { title: 'ປະເພດ', key: 'type', sortable: false },
    { title: 'ນ້ຳໜັກ', key: 'weight', sortable: false },
    { title: 'ຄ່າກຳເໜັດ', key: 'patternValue', sortable: false, align: 'end' },
];

const noDataTextForProducts = computed(() => {
  if (loading.value.products) return 'ກຳລັງໂຫລດ...';
  return 'ບໍ່ພົບສິນຄ້າ';
});

const selectedProducts = computed(() => {
    return availableProducts.value.filter(p => repurchase.value.productIds.includes(p.id));
});

const netRepurchasePrice = computed(() => {
  const initial = parseCurrency(repurchase.value.repurchasePrice) || 0;
  const damage = parseCurrency(repurchase.value.damageCost) || 0;
  const loose = parseCurrency(repurchase.value.looseGoldCost) || 0;
  const net = initial - damage - loose;
  return net >= 0 ? net : 0;
});

const formatForInput = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseInput = (value) => {
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? null : parsed;
};

const fetchRepurchaseData = async () => {
  try {
    const { data } = await api.get(`/repurchases/${repurchaseId}`);
    
    // Use the actual field names from the API response (Pascal_Case)
    repurchase.value.custId = data.Tb_Customer?.Cust_ID || null;
    repurchase.value.customerName = data.Tb_Customer?.Cust_name || 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ';
    repurchase.value.userName = data.Tb_User?.username || 'N/A';
    repurchase.value.repurchaseDate = new Date(data.Re_date).toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Populate editable fields
    repurchase.value.repurchasePrice = data.Repurchase_Price;
    repurchase.value.damageCost = data.Damage_Cost || 0;
    repurchase.value.looseGoldCost = data.Loose_Gold_Cost || 0;
    
    // Map product IDs using the correct property names
    const initialProductIds = data.Tb_Product?.map(p => p.Pd_ID) || [];

    // Fetch all products available for this customer to populate the autocomplete
    const customerId = data.Tb_Customer?.Cust_ID;
    if (customerId) {
        await fetchProductsForCustomer(customerId, initialProductIds);
    } else {
        // If there's no customer, there are no products to fetch or select
        loading.value.products = false;
        availableProducts.value = [];
        repurchase.value.productIds = [];
    }

  } catch (error) {
    showSnackbar('Failed to load repurchase data', 'error');
    console.error('Error fetching repurchase data:', error);
    router.push('/buy/returns');
  } finally {
    loading.value.page = false;
  }
};

const fetchProductsForCustomer = async (customerId, initialProductIds = []) => {
  if (!customerId) {
    loading.value.products = false;
    return;
  }
  loading.value.products = true;
  try {
    // 1. Fetch all products that are eligible for repurchase for this customer
    const { data: eligibleProducts } = await api.get(`/customers/${customerId}/products`);

    // 2. Fetch the full details of the current repurchase to get the products already associated with it
    const { data: repurchaseData } = await api.get(`/repurchases/${repurchaseId}`);
    const currentProducts = repurchaseData.Tb_Product || [];

    // 3. Create a map of all possible products to handle duplicates and combine lists
    const productMap = new Map();

    // Add eligible products to the map, formatting them to a consistent structure
    eligibleProducts.forEach(p => {
        productMap.set(p.id, { // Assuming this endpoint returns { id, name, type, weight, ... }
            id: p.id,
            name: p.name,
            type: p.type || '',
            weight: p.weight,
            patternValue: p.patternValue || 0
        });
    });

    // Add products already in the current repurchase to the map, formatting them as well
    // This ensures they are available in the dropdown even if they are no longer "eligible"
    currentProducts.forEach(p => {
        if (!productMap.has(p.Pd_ID)) {
            productMap.set(p.Pd_ID, {
                id: p.Pd_ID,
                name: p.Pd_name,
                type: p.Type || '',
                weight: p.Weight,
                patternValue: p.Pattern_value || 0
            });
        }
    });
    
    // 4. Set the combined list of unique products to the reactive ref
    availableProducts.value = Array.from(productMap.values());
    
    // 5. Set the model to the initially selected product IDs
    repurchase.value.productIds = initialProductIds;

  } catch (error) {
    showSnackbar('Failed to load product list for customer', 'error');
    console.error('Error fetching products for customer:', error);
  } finally {
    loading.value.products = false;
  }
};

onMounted(fetchRepurchaseData);

const save = async () => {
  const { valid: formValid } = await form.value.validate();
  if (!formValid) {
    showSnackbar('ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງ', 'warning');
    return;
  }
  
  loading.value.saving = true;
  try {
    const payload = {
      custId: repurchase.value.custId,
      productIds: repurchase.value.productIds,
      repurchasePrice: parseCurrency(repurchase.value.repurchasePrice),
      damageCost: parseCurrency(repurchase.value.damageCost),
      looseGoldCost: parseCurrency(repurchase.value.looseGoldCost),
      repurchaseDate: repurchase.value.repurchaseDate,
      reReason: repurchase.value.reReason,
    };
    await api.put(`/repurchases/${route.params.id}`, payload);
    showSnackbar('ອັບເດດຂໍ້ມູນສຳເລັດ!', 'success');
    router.push('/buy/returns');
  } catch (error) {
    console.error('Error updating repurchase:', error);
    showSnackbar(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ', 'error');
  } finally {
    loading.value.saving = false;
  }
};

const cancel = () => {
  router.push('/buy/returns');
};

const showSnackbar = (text, color) => {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.visible = true;
};

watch(
  () => repurchase.value.productIds,
  (newProductIds) => {
    //
  },
  { deep: true }
);

</script>

<style scoped>
.page-background {
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 16px;
}
.h-100 {
    height: 100%;
}
</style> 