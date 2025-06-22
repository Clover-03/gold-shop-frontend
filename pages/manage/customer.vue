<template>
  <v-container fluid>
    <h2 class="text-h6 font-weight-bold mb-4"
        style="font-family: 'NotoSansLao-SemiCondensed'; color: #1e1e1e">
      ຈັດການຂໍ້ມູນລູກຄ້າ
    </h2>

    <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Search + Add -->
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
              cover
              class="cursor-pointer"
            />
          </template>
        </v-text-field>
      </v-col>
      <v-spacer />
      <v-btn color="green" class="text-white" rounded @click="onOpenAddDialog">
        ເພີ່ມ
      </v-btn>
    </v-row>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="customers.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey-lighten-2">mdi-account-group-outline</v-icon>
      <p class="mt-4 text-h6 text-grey-lighten-1">ບໍ່ມີຂໍ້ມູນລູກຄ້າ</p>
      <p class="text-body-1 text-grey-lighten-1">ລອງກົດປຸ່ມ "ເພີ່ມ" ເພື່ອສ້າງລູກຄ້າໃໝ່.</p>
    </div>

    <!-- Table -->
    <v-table v-else class="custom-table">
      <thead>
        <tr>
          <th @click="sortBy('code')" class="cursor-pointer">
            ລະຫັດລູກຄ້າ <v-icon>{{ getSortIcon('code') }}</v-icon>
          </th>
          <th @click="sortBy('name')" class="cursor-pointer">
            ຊື່ລູກຄ້າ <v-icon>{{ getSortIcon('name') }}</v-icon>
          </th>
          <th>ເບີໂທ</th>
          <th>ທີ່ຢູ່</th>
          <th class="text-center">Option</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedCustomers" :key="item.id">
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.address }}</td>
          <td class="text-center">
            <v-btn icon variant="text" density="comfortable" @click="onEdit(item)">
              <v-img src="/icons/Edit.png" width="20" height="20" />
            </v-btn>
            <v-btn icon variant="text" density="comfortable" @click="onDelete(item)">
              <v-img src="/icons/Delete.png" width="20" height="20" />
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <div v-if="!isLoading && customers.length > 0" class="d-flex justify-center align-center mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredCustomers.length / itemsPerPage)"
        :total-visible="7"
      >
        <template #prev="{ props }">
          <v-btn variant="text" v-bind="props" class="px-0" @click="goToPreviousPage">
            <v-img src="/icons/Arrow.png" width="20" height="20" style="transform: rotate(90deg);" />
          </v-btn>
        </template>
        <template #next="{ props }">
          <v-btn variant="text" v-bind="props" class="px-0" @click="goToNextPage">
            <v-img src="/icons/Arrow.png" width="20" height="20" style="transform: rotate(270deg);" />
          </v-btn>
        </template>
      </v-pagination>
      <v-menu v-model="pageMenu" :close-on-content-click="true" location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-img src="/icons/more.png" width="24" height="24" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="n in Math.ceil(filteredCustomers.length / itemsPerPage)" :key="n" :value="n" @click="page = n">
            <v-list-item-title>ໜ້າ {{ n }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ isEditMode ? 'ແກ້ໄຂລູກຄ້າ' : 'ເພີ່ມລູກຄ້າ' }}
        </v-card-title>
        <v-form ref="formRef" @submit.prevent="save" v-model="formValid">
          <v-card-text>
            <v-text-field
              v-model="form.code"
              :rules="[rules.required]"
              label="ລະຫັດລູກຄ້າ"
              dense outlined
              :disabled="isEditMode"
            />
            <v-text-field
              v-model="form.name"
              :rules="[rules.required]"
              label="ຊື່ລູກຄ້າ"
              dense outlined
            />
            <v-text-field
              v-model="form.phone"
              :rules="[rules.required, rules.phone]"
              label="ເບີໂທ"
              dense outlined
            />
            <v-text-field
              v-model="form.address"
              :rules="[rules.required]"
              label="ທີ່ຢູ່"
              dense outlined
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="btn-cancel" @click="dialog = false" :disabled="isSaving">ຍົກເລີກ</v-btn>
            <v-btn class="btn-save" type="submit" :disabled="!formValid" :loading="isSaving">ບັນທຶກ</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="dialog-title">ຢືນຢັນການລຶບ</v-card-title>
        <v-card-text>
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລູກຄ້າ "{{ itemToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-cancel" @click="deleteDialog = false" :disabled="isSaving">ບໍ່</v-btn>
          <v-btn class="btn-save" @click="confirmDelete" :loading="isSaving">ແມ່ນ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchCustomers as apiFetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '~/services/customerApi';

const isLoading = ref(true);
const isSaving = ref(false); // For save/delete loading state

const search = ref('')
const page = ref(1)
const itemsPerPage = ref(8)
const sortKey = ref('name') // Default sort key
const sortDesc = ref(false) // Default sort order (ascending)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const customers = ref([])

const dialog = ref(false)
const deleteDialog = ref(false)
const form = ref({})
const itemToDelete = ref(null)
const formValid = ref(false)
const formRef = ref(null)
const isEditMode = ref(false)
const pageMenu = ref(false)

const rules = {
  required: v => !!v || 'ຈຳເປັນຕ້ອງປ້ອນ',
  phone: v => /^\d{8,15}$/.test(v) || 'ເບີໂທບໍ່ຖືກຕ້ອງ'
}

const sortedCustomers = computed(() => {
  const key = sortKey.value;
  const order = sortDesc.value ? -1 : 1;
  // Make a shallow copy before sorting to avoid mutating the original array
  return [...customers.value].sort((a, b) => {
    const valA = a[key]?.toLowerCase() || '';
    const valB = b[key]?.toLowerCase() || '';
    if (valA < valB) return -1 * order;
    if (valA > valB) return 1 * order;
    return 0;
  });
});

const filteredCustomers = computed(() => {
  let data = sortedCustomers.value;
  if (search.value) {
    const lowerSearch = search.value.toLowerCase();
    data = data.filter(c => 
      c.code.toLowerCase().includes(lowerSearch) || 
      c.name.toLowerCase().includes(lowerSearch)
    );
  }
  return data;
})

const paginatedCustomers = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCustomers.value.slice(start, end)
})

const getToken = () => localStorage.getItem('token');

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const fetchCustomers = async () => {
  isLoading.value = true;
  try {
    customers.value = await apiFetchCustomers();
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCustomers);

const resetForm = () => {
  form.value = { code: '', name: '', phone: '', address: '' }
  formRef.value?.resetValidation()
  formValid.value = false
}

const onOpenAddDialog = () => {
  resetForm()
  isEditMode.value = false
  dialog.value = true
}

const onEdit = (item) => {
  form.value = { ...item }
  isEditMode.value = true
  dialog.value = true
  formRef.value?.resetValidation()
  formValid.value = true
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSaving.value = true;
  try {
    if (isEditMode.value) {
      await updateCustomer(form.value.id, form.value);
    } else {
      await createCustomer(form.value);
    }

    await fetchCustomers();
    dialog.value = false;
    showSnackbar(isEditMode.value ? 'ແກ້ໄຂລູກຄ້າສຳເລັດ' : 'ເພີ່ມລູກຄ້າສຳເລັດ');
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

const onDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  isSaving.value = true;
  try {
    await deleteCustomer(itemToDelete.value.id);
    await fetchCustomers();
    deleteDialog.value = false;
    itemToDelete.value = null;
    showSnackbar('ລຶບລູກຄ້າສຳເລັດ');
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

function goToPreviousPage() {
  if (page.value > 1) page.value--
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredCustomers.value.length / itemsPerPage.value)
  if (page.value < totalPages) page.value++
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortKey.value = key;
    sortDesc.value = false;
  }
  page.value = 1; // Reset to first page after sorting
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) {
    return 'mdi-sort';
  }
  return sortDesc.value ? 'mdi-sort-descending' : 'mdi-sort-ascending';
};
</script>

<style scoped>
th {
  font-weight: bold;
}
.gap-2 {
  gap: 8px;
}
.custom-table td, .custom-table th {
  vertical-align: middle;
  padding: 10px;
}
.dialog-title {
  background-color: #365a76;
  color: white;
  font-weight: bold;
}
.btn-cancel {
  background-color: #f44336 !important;
  color: white !important;
}
.btn-save {
  background-color: #4caf50 !important;
  color: white !important;
}
.cursor-pointer {
  cursor: pointer;
}
.text-center {
  text-align: center;
}
th.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
th.cursor-pointer:hover {
  background-color: rgba(0,0,0,0.05);
}
</style>
