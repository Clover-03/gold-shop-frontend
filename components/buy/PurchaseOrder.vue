<template>
  <div class="purchase-order-container" ref="printableContent">
    <div class="header">
      <div class="shop-info">
        <h1 class="shop-name">ຮ້ານຄຳ ດາລາວົງ</h1>
        <p>ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ</p>
        <p>ໂທ: 020 1234 5678</p>
      </div>
      <h2 class="document-title">ໃບສັ່ງຊື້ / Purchase Order</h2>
    </div>

    <div class="meta-info">
      <div class="supplier-info">
        <h3>ຂໍ້ມູນຜູ້ສະໜອງ (Supplier)</h3>
        <p><strong>ຊື່:</strong> {{ order.Tb_Supplier?.Sup_name || 'N/A' }}</p>
        <p><strong>ໂທ:</strong> {{ order.Tb_Supplier?.Phone || 'N/A' }}</p>
        <p><strong>ທີ່ຢູ່:</strong> {{ order.Tb_Supplier?.Address || 'N/A' }}</p>
      </div>
      <div class="order-details">
        <h3>ລາຍລະອຽດການສັ່ງຊື້</h3>
        <p><strong>ເລກທີ:</strong> #{{ order.Order_ID || 'N/A' }}</p>
        <p><strong>ວັນທີ:</strong> {{ formatDate(order.Order_Date) || 'N/A' }}</p>
      </div>
    </div>

    <div class="items-table">
      <table>
        <thead>
          <tr>
            <th>ລຳດັບ</th>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ຈຳນວນ</th>
            <th>ລາຄາຕໍ່ໜ່ວຍ</th>
            <th>ລວມ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in order.products" :key="item.Pd_ID">
            <td>{{ index + 1 }}</td>
            <td>{{ item.Pd_name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.buyPrice) }}</td>
            <td>{{ formatCurrency(item.quantity * item.buyPrice) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="grand-total-label">ລວມທັງໝົດ</td>
            <td class="grand-total-value">{{ formatCurrency(grandTotal) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      <div class="signature">
        <p>_________________________</p>
        <p>ຜູ້ສັ່ງຊື້ (Authorized Signature)</p>
      </div>
      <div class="signature">
        <p>_________________________</p>
        <p>ຜູ້ຮັບຄຳສັ່ງ (Supplier Signature)</p>
      </div>
    </div>
  </div>

  <div class="actions-bar">
    <v-btn color="primary" @click="handlePrint" prepend-icon="mdi-printer">
      ພິມໃບສັ່ງຊື້
    </v-btn>
    <v-btn color="grey" @click="$emit('close')" prepend-icon="mdi-close">
      ປິດ
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const printableContent = ref(null);

const grandTotal = computed(() => {
  if (!props.order || !props.order.products) return 0;
  return props.order.products.reduce((sum, item) => sum + (item.quantity * item.buyPrice), 0);
});

const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('lo-LA').format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('lo-LA', options);
};

const handlePrint = () => {
  const content = printableContent.value;
  if (!content) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write('<html><head><title>Purchase Order</title>');
  
  // Injecting styles
  printWindow.document.write(`
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap');
      body { 
        font-family: 'Phetsarath OT', sans-serif; 
        margin: 20px;
        color: #333;
      }
      .purchase-order-container { max-width: 800px; margin: auto; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; }
      .shop-info h1 { margin: 0; color: #000; font-size: 24px; }
      .shop-info p { margin: 2px 0; font-size: 12px; }
      .document-title { margin: 0; font-size: 20px; text-align: right; }
      .meta-info { display: flex; justify-content: space-between; margin-top: 20px; font-size: 14px; }
      .items-table { margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
      thead { background-color: #f2f2f2; }
      tfoot .grand-total-label { text-align: right; font-weight: bold; }
      tfoot .grand-total-value { font-weight: bold; }
      .footer { display: flex; justify-content: space-around; margin-top: 50px; text-align: center; font-size: 14px; }
      .signature p { margin: 5px 0; }
    </style>
  `);
  
  printWindow.document.write('</head><body>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  printWindow.focus();
  
  // Use a timeout to ensure content is loaded before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap');

.purchase-order-container {
  font-family: 'Phetsarath OT', sans-serif;
  padding: 24px;
  background: white;
  color: #333;
  border: 1px solid #eee;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 3px solid #365a76;
}

.shop-name {
  font-weight: bold;
  color: #365a76;
  font-size: 2rem;
  margin: 0;
}

.shop-info p {
  margin: 2px 0;
  font-size: 0.9rem;
  color: #555;
}

.document-title {
  text-align: right;
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 0.95rem;
}

.supplier-info h3, .order-details h3 {
  font-size: 1rem;
  font-weight: bold;
  color: #365a76;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.items-table {
  margin-top: 25px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: #365a76;
  color: white;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

tfoot {
  font-weight: bold;
}

.grand-total-label {
  text-align: right;
}

.grand-total-value {
  font-size: 1.2rem;
  color: #365a76;
}

.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px 24px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
}
</style> 