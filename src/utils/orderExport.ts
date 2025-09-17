import OrderService from '@/services/OrderService';

export interface ExportOrderData {
  'Order ID': string;
  'Payment Type': string;
  'COD Collectable Amount': number;
  'Tags': string;
  'First Name': string;
  'Last Name': string;
  'Address 1': string;
  'Address 2': string;
  'Phone': string;
  'Alternate phone': string;
  'City': string;
  'State': string;
  'Pincode': string;
  'Weight(gm)': number;
  'Length(cm)': number;
  'Height(cm)': number;
  'Breadth(cm)': number;
  'Shipping Charges': number;
  'COD Charges': number;
  'Discount': number;
  // Product columns (up to 10 products)
  [key: `SKU(${number})`]: string;
  [key: `Product(${number})`]: string;
  [key: `Quantity(${number})`]: number;
  [key: `Per Product Price(${number})`]: number;
  [key: `Total Price(${number})`]: number;
}

/**
 * Transform order data to match the export schema
 */
export function transformOrderForExport(order: any): ExportOrderData {
  const shippingAddress = order.shipping_address;
  const profile = order.profiles;
  const items = order.items || order.order_items || [];
  
  // Base export data
  const isCOD = (order.payment_method || 'COD') === 'COD';
  const totalAmount = order.total || order.total_amount || 0;
  const shippingAmount = order.shipping_amount || order.shippingAmount || 0;
  
  console.log(`📊 Order ${order.order_number}: Payment Method=${order.payment_method}, Total=${totalAmount}, IsCOD=${isCOD}`);
  
  const exportData: ExportOrderData = {
    'Order ID': order.order_number || order.id?.toString() || '',
    'Payment Type': order.payment_method || 'COD',
    'COD Collectable Amount': isCOD ? totalAmount : 0,
    'Tags': order.status || '',
    'First Name': shippingAddress?.first_name || profile?.first_name || '',
    'Last Name': '', // Leave last name blank as requested
    'Address 1': shippingAddress?.address_line_1 || '',
    'Address 2': shippingAddress?.address_line_2 || '',
    'Phone': shippingAddress?.phone || profile?.phone || '',
    'Alternate phone': '',
    'City': shippingAddress?.city || '',
    'State': shippingAddress?.state || '',
    'Pincode': shippingAddress?.postal_code || '',
    'Weight(gm)': 500, // Fixed dummy weight
    'Length(cm)': 10, // Fixed dummy length
    'Height(cm)': 10, // Fixed dummy height
    'Breadth(cm)': 10, // Fixed dummy breadth
    'Shipping Charges': shippingAmount,
    'COD Charges': isCOD ? (totalAmount * 0.02) : 0, // 2% COD charges
    'Discount': order.discount_amount || order.discountAmount || 0,
  };

  // Add product data (up to 10 products)
  for (let i = 1; i <= 10; i++) {
    const item = items[i - 1];
    if (item) {
      // Modify SKU to include variant display name if available
      let sku = item.productSku || '';
      if (item.size || item.color) {
        const variantParts = [];
        if (item.color) variantParts.push(item.color);
        if (item.size) variantParts.push(item.size);
        if (variantParts.length > 0) {
          sku = `${sku} - ${variantParts.join(' - ')}`;
        }
      }
      
      exportData[`SKU(${i})`] = sku;
      exportData[`Product(${i})`] = item.productName || '';
      exportData[`Quantity(${i})`] = item.quantity || 0;
      exportData[`Per Product Price(${i})`] = item.unitPrice || 0;
      exportData[`Total Price(${i})`] = item.totalPrice || 0;
    } else {
      exportData[`SKU(${i})`] = '';
      exportData[`Product(${i})`] = '';
      exportData[`Quantity(${i})`] = 0;
      exportData[`Per Product Price(${i})`] = 0;
      exportData[`Total Price(${i})`] = 0;
    }
  }

  return exportData;
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: ExportOrderData[]): string {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header as keyof ExportOrderData];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export orders to CSV following the specified schema
 */
export async function exportOrdersToCSV(
  orders?: any[], 
  filename: string = `orders_export_${new Date().toISOString().split('T')[0]}.csv`
): Promise<void> {
  try {
    // If no orders provided, fetch all orders
    let ordersToExport = orders;
    if (!ordersToExport) {
      console.log('📦 Fetching all orders for export...');
      const { orders: fetchedOrders } = await OrderService.getAllOrdersForAdmin(1, 1000); // Fetch up to 1000 orders
      ordersToExport = fetchedOrders;
    }

    if (!ordersToExport || ordersToExport.length === 0) {
      throw new Error('No orders found to export');
    }

    console.log(`🔄 Transforming ${ordersToExport.length} orders for export...`);
    
    // Transform orders to export format
    const exportData = ordersToExport.map(transformOrderForExport);
    
    // Convert to CSV
    const csvContent = convertToCSV(exportData);
    
    // Download the file
    downloadCSV(csvContent, filename);
    
    console.log(`✅ Successfully exported ${ordersToExport.length} orders to ${filename}`);
    
  } catch (error) {
    console.error('❌ Error exporting orders:', error);
    throw error;
  }
}

/**
 * Export selected orders to CSV
 */
export async function exportSelectedOrdersToCSV(
  selectedOrderIds: number[],
  filename: string = `selected_orders_export_${new Date().toISOString().split('T')[0]}.csv`
): Promise<void> {
  try {
    if (selectedOrderIds.length === 0) {
      throw new Error('No orders selected for export');
    }

    console.log(`📦 Fetching ${selectedOrderIds.length} selected orders for export...`);
    
    // Fetch all orders and filter by selected IDs
    const { orders: allOrders } = await OrderService.getAllOrdersForAdmin(1, 1000);
    const selectedOrders = allOrders.filter(order => selectedOrderIds.includes(order.id));

    if (selectedOrders.length === 0) {
      throw new Error('No matching orders found for the selected IDs');
    }

    console.log(`🔄 Transforming ${selectedOrders.length} selected orders for export...`);
    
    // Transform orders to export format
    const exportData = selectedOrders.map(transformOrderForExport);
    
    // Convert to CSV
    const csvContent = convertToCSV(exportData);
    
    // Download the file
    downloadCSV(csvContent, filename);
    
    console.log(`✅ Successfully exported ${selectedOrders.length} selected orders to ${filename}`);
    
  } catch (error) {
    console.error('❌ Error exporting selected orders:', error);
    throw error;
  }
}
