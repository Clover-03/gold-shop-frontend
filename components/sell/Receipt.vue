<template>
  <div class="receipt-container pa-4" ref="receiptContent">
    <div class="header-section text-center mb-6">
        <v-img src="/logo.png" alt="Logo" class="mx-auto" max-width="120px"></v-img>
        <h1 class="mt-4">ຮ້ານຄຳ ດາລາວົງ</h1>
        <p class="mb-0">ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ</p>
        <p>ໂທ: 020 1234 5678</p>
    </div>
    
    <div class="title-section d-flex justify-space-between align-center mb-4 pb-2 border-b">
      <h2 class="receipt-title">ໃບຮັບເງິນ</h2>
      <div>
        <p class="mb-0"><strong>DATE:</strong> {{ formatDate(sale.Sell_Date) }}</p>
        <p class="mb-0"><strong>ເລກບິນ:</strong> {{ sale.Sell_ID.toString().padStart(8, '0') }}</p>
      </div>
    </div>

    <div class="customer-info mb-6">
        <v-row>
            <v-col cols="6">
                <p class="mb-1"><strong>ລະຫັດລູກຄ້າ:</strong> {{ sale.Tb_Customer.Cust_ID }}</p>
                <p class="mb-1"><strong>ຊື່ລູກຄ້າ:</strong> {{ sale.Tb_Customer.Cust_name }}</p>
                <p><strong>ເບີໂທ:</strong> {{ sale.Tb_Customer.Phone }}</p>
            </v-col>
            <v-col cols="6" class="text-right">
                <p class="mb-1"><strong>ພະນັກງານຂາຍ:</strong> {{ sale.Tb_User?.username || 'N/A' }}</p>
            </v-col>
        </v-row>
    </div>

    <v-table class="receipt-table mb-6">
      <thead>
        <tr>
          <th class="text-left" style="width: 10%;">ລ/ດ</th>
          <th class="text-left" style="width: 25%;">ລະຫັດສິນຄ້າ</th>
          <th class="text-left">ລາຍການ</th>
          <th class="text-right" style="width: 15%;">ນ້ຳໜັກ</th>
          <th class="text-right" style="width: 20%;">ລາຄາ</th>
          <th class="text-right" style="width: 20%;">ລວມ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>{{ sale.Tb_Product.Pd_ID }}</td>
          <td>
            <div>{{ sale.Tb_Product.Pd_name }}</div>
            <div class="text-grey-darken-1">{{ sale.Tb_Product.Type }}</div>
          </td>
          <td class="text-right">{{ sale.Tb_Product.Weight }}</td>
          <td class="text-right">{{ formatCurrency(sale.Price_At_Sale) }}</td>
          <td class="text-right">{{ formatCurrency(sale.Total) }}</td>
        </tr>
      </tbody>
    </v-table>

    <div class="footer-section">
        <v-row>
            <v-col cols="6" class="text-center">
                <p class="mb-8">..............................</p>
                <p>(ລາຍເຊັນຜູ້ຊື້)</p>
            </v-col>
            <v-col cols="6" class="text-center">
                <p class="mb-8">..............................</p>
                <p>(ລາຍເຊັນຜູ້ຂາຍ)</p>
            </v-col>
        </v-row>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  sale: {
    type: Object,
    required: true,
  },
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = Number(value) || 0;
  }
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK',
    minimumFractionDigits: 0,
  }).format(value);
};
</script>

<style scoped>
.receipt-container {
  font-family: 'Noto Sans Lao', sans-serif;
  background-color: #fff;
  color: #000;
  width: 210mm; /* A4 width */
  min-height: 297mm; /* A4 height */
  margin: auto;
}
.receipt-title {
    font-size: 2rem;
    font-weight: bold;
}
.border-b {
    border-bottom: 2px solid #000;
}
.receipt-table {
    border: 1px solid #ccc;
}
.receipt-table th, .receipt-table td {
    border-bottom: 1px solid #ccc;
    padding: 8px 12px;
}
.receipt-table thead {
    background-color: #f2f2f2;
}
</style> 