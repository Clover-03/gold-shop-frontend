<template>
    <div class="page-background">
        <Header title="ເພີ່ມລາຍການຊື້ຄືນໃໝ່" back-route="/buy/returns" />
        <v-card class="mt-4 pa-4">
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                    <!-- Repurchase Info Section -->
                    <v-col cols="12" md="6">
                        <v-card variant="outlined" class="h-100">
                            <v-card-title>1. ຂໍ້ມູນການຊື້ຄືນ</v-card-title>
                            <v-card-text>
                                <v-select
                                    v-model="repurchaseType"
                                    :items="repurchaseTypes"
                                    label="ປະເພດການຊື້ຄືນ"
                                    :rules="[rules.required]"
                                    prepend-inner-icon="mdi-format-list-bulleted-type"
                                    variant="outlined"
                                    dense
                                ></v-select>

                                <div v-if="repurchaseType === 'existingProduct'">
              <v-autocomplete
                v-model="repurchase.custId"
                :items="customers"
                                        item-title="name"
                                        item-value="id"
                label="ເລືອກລູກຄ້າ"
                                        :rules="[rules.requiredIfExistingProduct]"
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
                                </div>
                                <div v-else-if="repurchaseType === 'newGold'">
                                    <v-autocomplete
                                        v-model="repurchase.newCustomer.id"
                                        :items="customers"
                                        item-title="name"
                                        item-value="id"
                                        label="ເລືອກລູກຄ້າ (ມີແລ້ວ)"
                                        prepend-inner-icon="mdi-account-search-outline"
                                        variant="outlined"
                                        dense
                                        :loading="loading.customers"
                                        clearable
                                    >
                                        <template v-slot:selection="{ item }">
                                            <span class="v-list-item-title">{{ item.raw.name }}</span>
                                        </template>
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.phone"></v-list-item>
                                        </template>
                                    </v-autocomplete>
                                    <v-text-field
                                        v-model="repurchase.newCustomer.name"
                                        label="ຊື່ລູກຄ້າໃໝ່"
                                        :rules="[rules.requiredIfNewCustomerName]"
                                        prepend-inner-icon="mdi-account"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="repurchase.newCustomer.phone"
                                        label="ເບີໂທລູກຄ້າໃໝ່"
                                        :rules="[rules.requiredIfNewCustomerName]"
                                        prepend-inner-icon="mdi-phone"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
                                    <v-textarea
                                        v-model="repurchase.newCustomer.address"
                                        label="ທີ່ຢູ່ລູກຄ້າໃໝ່"
                                        rows="2"
                                        prepend-inner-icon="mdi-map-marker"
                                        variant="outlined"
                                        dense
                                    ></v-textarea>
                                </div>

                                <v-text-field
                                    v-model="repurchase.repurchaseDate"
                                    label="ວັນທີຊື້ຄືນ"
                                    type="date"
                                    :rules="[rules.required]"
                                    prepend-inner-icon="mdi-calendar"
                                    variant="outlined"
                                    dense
                                ></v-text-field>
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
                                    :model-value="formatForInput(repurchase.lostWeightFee)"
                                    @update:model-value="value => repurchase.lostWeightFee = parseInput(value)"
                                    label="ຄ່ານ້ຳໜັກທອງຫຼຸດ (ກີບ)"
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
                                <v-textarea
                                    v-model="repurchase.reReason"
                                    label="ເຫດຜົນການຊື້ຄືນ"
                                    rows="3"
                                    variant="outlined"
                dense
                                ></v-textarea>
                            </v-card-text>
                        </v-card>
            </v-col>

                    <!-- Product Selection Section -->
                    <v-col cols="12" md="6">
                        <v-card variant="outlined" class="h-100">
                            <v-card-title>2. ເລືອກສິນຄ້າ</v-card-title>
                            <v-card-text>
                                <div v-if="repurchaseType === 'existingProduct'">
          <v-autocomplete
            v-model="repurchase.productIds"
                                        :items="availableProducts"
                                        item-title="name"
                                        item-value="id"
            label="ເລືອກສິນຄ້າທີ່ຊື້ຄືນ"
            :disabled="!repurchase.custId"
                                        :loading="loading.products"
            multiple
            chips
            deletable-chips
                                        :rules="[rules.arrayNotEmptyIfExistingProduct]"
                                        prepend-inner-icon="mdi-gold"
                                        variant="outlined"
            dense
            :no-data-text="noDataTextForProducts"
                                    >
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="`ນ້ຳໜັກ: ${formatWeight(item.raw.weight)}`"></v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </div>
                                <div v-else-if="repurchaseType === 'newGold'">
                                    <v-text-field
                                        v-model="repurchase.newProduct.Pd_ID"
                                        label="ລະຫັດສິນຄ້າໃໝ່"
                                        :rules="[rules.requiredIfNewProduct]"
                                        prepend-inner-icon="mdi-barcode"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="repurchase.newProduct.Pd_Name"
                                        label="ຊື່ສິນຄ້າໃໝ່"
                                        :rules="[rules.requiredIfNewProduct]"
                                        prepend-inner-icon="mdi-gold"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="repurchase.newProduct.Type_Name"
                                        label="ປະເພດສິນຄ້າໃໝ່"
                                        :rules="[rules.requiredIfNewProduct]"
                                        prepend-inner-icon="mdi-shape"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
                                    <v-text-field
                                        v-model.number="repurchase.newProduct.Weight"
                                        label="ນ້ຳໜັກ (ກຣາມ)"
                                        type="number"
                                        :rules="[rules.requiredIfNewProduct, rules.positive]"
                                        prepend-inner-icon="mdi-weight"
                                        variant="outlined"
                                        dense
                                    ></v-text-field>
          <v-text-field
                                        :model-value="formatForInput(repurchase.newProduct.Pattern_Value)"
                                        @update:model-value="value => repurchase.newProduct.Pattern_Value = parseInput(value)"
                                        label="ຄ່າກຳເໜັດ (ກີບ)"
            type="text"
                                        :rules="[rules.nonNegative]"
                                        prepend-inner-icon="mdi-hand-coin"
                                        variant="outlined"
            dense
          ></v-text-field>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Selected Products Details Section (only for existing products) -->
                <v-row v-if="repurchaseType === 'existingProduct' && selectedProducts.length > 0" class="mt-4">
                    <v-col cols="12">
                        <v-card variant="tonal" color="blue-grey-lighten-5">
                            <v-card-title>3. ລາຍລະອຽດສິນຄ້າທີ່ເລືອກ</v-card-title>
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
                        ບັນທຶກ
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
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import useApi from '~/composables/useApi';
import { formatCurrency, formatWeight, parseCurrency } from '~/utils/format';

const api = useApi();
const router = useRouter();

const form = ref(null);
const valid = ref(true);
const loading = ref({
    customers: false,
    products: false,
    saving: false,
});

const repurchaseType = ref(null); // 'existingProduct' or 'newGold'

const repurchaseTypes = ref([
    { title: 'ຊື້ຄືນສິນຄ້າທີ່ມີຢູ່ແລ້ວ', value: 'existingProduct' },
    { title: 'ຊື້ຄືນທອງໃໝ່ / ຈາກລູກຄ້າໃໝ່', value: 'newGold' },
]);

const repurchase = ref({
  custId: null,
  productIds: [],
    repurchasePrice: null,
    damageCost: 0, // New field
    lostWeightFee: 0, // New field
    repurchaseDate: new Date().toISOString().substr(0, 10),
    reReason: '',
    newCustomer: {
        id: null, // For selecting existing customer if newGold type
        name: '',
        phone: '',
        address: '',
    },
    newProduct: {
        Pd_ID: '',
        Pd_Name: '',
        Type_Name: '',
        Weight: null,
        Pattern_Value: 0,
    },
});

const customers = ref([]);
const availableProducts = ref([]);

const rules = {
    required: value => !!value || 'ກະລຸນາປ້ອນຂໍ້ມູນ',
    positive: value => (parseCurrency(value) > 0) || 'ຕ້ອງເປັນຄ່າບວກ',
    nonNegative: value => (parseCurrency(value) >= 0) || 'ຕ້ອງເປັນຄ່າບວກ ຫຼື ສູນ',
    requiredIfExistingProduct: value => (repurchaseType.value === 'existingProduct' ? !!value || 'ກະລຸນາເລືອກລູກຄ້າ' : true),
    arrayNotEmptyIfExistingProduct: value => (repurchaseType.value === 'existingProduct' ? (value && value.length > 0) || 'ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ລາຍການ' : true),
    requiredIfNewCustomerName: value => (repurchaseType.value === 'newGold' && !repurchase.value.newCustomer.id ? !!value || 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ' : true),
    requiredIfNewProduct: value => (repurchaseType.value === 'newGold' ? !!value || 'ກະລຸນາປ້ອນຂໍ້ມູນສິນຄ້າ' : true),
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
    if (!repurchase.value.custId) return 'ກະລຸນາເລືອກລູກຄ້າກ່ອນ';
  return 'ບໍ່ພົບສິນຄ້າທີ່ລູກຄ້ານີ້ເຄີຍຊື້ (ຫຼື ສິນຄ້າຖືກຊື້ຄືນແລ້ວ)';
});

const selectedProducts = computed(() => {
    return availableProducts.value.filter(p => repurchase.value.productIds.includes(p.id));
});

const netRepurchasePrice = computed(() => {
    const initial = parseFloat(repurchase.value.repurchasePrice) || 0;
    const damage = parseFloat(repurchase.value.damageCost) || 0;
    const loose = parseFloat(repurchase.value.lostWeightFee) || 0;
    const net = initial - damage - loose;
    return net >= 0 ? net : 0;
});

const formatForInput = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseInput = (value) => {
  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

watch(() => repurchase.value.custId, (newCustId) => {
    if (repurchaseType.value === 'existingProduct' && newCustId) {
        repurchase.value.productIds = [];
    fetchProductsForCustomer(newCustId);
    } else if (repurchaseType.value === 'existingProduct') {
        availableProducts.value = [];
        repurchase.value.productIds = [];
    }
});

watch(repurchaseType, (newType) => {
    // Reset relevant fields when repurchase type changes
    repurchase.value.custId = null;
    repurchase.value.productIds = [];
    repurchase.value.newCustomer = { id: null, name: '', phone: '', address: '' };
    repurchase.value.newProduct = { Pd_ID: '', Pd_Name: '', Type_Name: '', Weight: null, Pattern_Value: 0 };
    availableProducts.value = [];
    // If switching to existingProduct type, we might need to pre-fetch customers if not already loaded
    if (newType === 'existingProduct' && customers.value.length === 0) {
        fetchCustomers();
    }
});

watch(() => repurchase.value.newCustomer.id, (newCustId) => {
    if (newCustId) {
        // If an existing customer is selected, clear new customer input fields
        repurchase.value.newCustomer.name = '';
        repurchase.value.newCustomer.phone = '';
        repurchase.value.newCustomer.address = '';
  }
});

const fetchCustomers = async () => {
    loading.value.customers = true;
  try {
    const response = await api.get('/customers');
    customers.value = response.data;
  } catch (error) {
        showSnackbar('Failed to load customers', 'error');
    console.error('Error fetching customers:', error);
    } finally {
        loading.value.customers = false;
  }
};

const fetchProductsForCustomer = async (customerId) => {
    loading.value.products = true;
    availableProducts.value = [];
  try {
    const response = await api.get(`/customers/${customerId}/products`);
        availableProducts.value = response.data;
  } catch (error) {
        showSnackbar('Failed to load products for customer', 'error');
    console.error('Error fetching products for customer:', error);
  } finally {
        loading.value.products = false;
    }
};

const save = async () => {
  const { valid } = await form.value.validate();
    if (!valid) {
        showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
        return;
    }

    loading.value.saving = true;
    try {
        let payload = {
            repurchasePrice: repurchase.value.repurchasePrice,
            damageCost: repurchase.value.damageCost, // New field
            lostWeightFee: repurchase.value.lostWeightFee, // New field
            repurchaseDate: repurchase.value.repurchaseDate,
            reReason: repurchase.value.reReason,
            type: repurchaseType.value,
        };

        if (repurchaseType.value === 'existingProduct') {
            payload.custId = repurchase.value.custId;
            payload.productIds = repurchase.value.productIds;
        } else if (repurchaseType.value === 'newGold') {
            payload.newCustomer = repurchase.value.newCustomer.id ? { id: repurchase.value.newCustomer.id } : {
                name: repurchase.value.newCustomer.name,
                phone: repurchase.value.newCustomer.phone,
                address: repurchase.value.newCustomer.address,
            };
            payload.newProduct = {
                Pd_ID: repurchase.value.newProduct.Pd_ID,
                Pd_Name: repurchase.value.newProduct.Pd_Name,
                Type_Name: repurchase.value.newProduct.Type_Name,
                Weight: repurchase.value.newProduct.Weight,
                Pattern_Value: repurchase.value.newProduct.Pattern_Value,
            };
        }

        await api.post('/repurchases', payload);
        showSnackbar('ບັນທຶກຂໍ້ມູນການຊື້ຄືນສຳເລັດ', 'success');
    router.push('/buy/returns');
  } catch (error) {
        showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ', 'error');
        console.error('Error saving repurchase:', error);
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

onMounted(() => {
    // No initial fetch, wait for user to select repurchaseType
});
</script>

<style scoped>
.page-background {
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 20px;
}
</style> 