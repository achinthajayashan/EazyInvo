import React, { useState, ChangeEvent } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Item {
  description: string;
  price: number;
  qty: number;
}

interface InvoiceData {
  businessName: string;
  businessAddress: string;
  recipientName: string;
  recipientAddress: string;
  items: Item[];
  logo: string;
  date: string;
  totalAmount: number;
}

const App: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    businessName: '',
    businessAddress: '',
    recipientName: '',
    recipientAddress: '',
    items: [{ description: '', price: 0, qty: 1 }],
    logo: '',
    date: new Date().toLocaleDateString(),
    totalAmount: 0,
  });

  const [logoPreview, setLogoPreview] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const items = [...invoiceData.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };
    setInvoiceData({ ...invoiceData, items });
  };

  const addItem = () => {
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { description: '', price: 0, qty: 1 }] });
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData({ ...invoiceData, logo: reader.result as string });
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Business Logo
    if (invoiceData.logo) {
      doc.addImage(invoiceData.logo, 'PNG', 10, 10, 50, 20);
    }

    // INVOICE at top right
    doc.setFontSize(24);
    doc.text('INVOICE', doc.internal.pageSize.width - 10, 15, { align: 'right' });

    // Business Details
    doc.setFontSize(12);
    doc.text(`Bill From:`, 10, 40);
    doc.text(`Business Name: ${invoiceData.businessName}`, 10, 45);
    doc.text(`Business Address: ${invoiceData.businessAddress}`, 10, 50);

    // Recipient Details
    doc.text(`Bill To:`, 100, 40);
    doc.text(`Recipient Name: ${invoiceData.recipientName}`, 100, 45);
    doc.text(`Recipient Address: ${invoiceData.recipientAddress}`, 100, 50);

    // Define table column headers
    const tableColumn = ['Description', 'Price', 'Quantity', 'Total'];
    const tableRows: any[][] = [];

    // Add table rows
    invoiceData.items.forEach((item) => {
      const itemTotal = item.qty * item.price;
      const rowData = [item.description, `Rs.${item.price.toFixed(2)}`, item.qty, `Rs.${itemTotal.toFixed(2)}`];
      tableRows.push(rowData);
    });

    // Add table to PDF
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'grid',
    });

    // Calculate total amount
    const total = invoiceData.items.reduce((acc, item) => acc + item.qty * item.price, 0);

    // Add total amount
    doc.text(`Total: Rs.${total.toFixed(2)}`, (doc as any).lastAutoTable.finalY + 10, doc.internal.pageSize.width - 10, { align: 'right' });


    // Thank You
    doc.text('Thank you for your business!', 10, 280);

    // Powered by
    doc.setFontSize(8);
    doc.text('Powered by Techverse Digital Solution', 10, 290);

    // Save the PDF
    doc.save('invoice.pdf');
  };

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>
        <form className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">
              Business Logo:
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logoInput"
              />
              <label
                  htmlFor="logoInput"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md border border-gray-300 focus:outline-none transition duration-300"
              >
                Upload Logo
              </label>
            </label>
            {logoPreview && (
                <div className="mt-2">
                  <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-w-64 h-auto"
                      style={{maxWidth: '100%', maxHeight: '150px'}}
                  />
                </div>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name:
                <input
                    type="text"
                    name="businessName"
                    value={invoiceData.businessName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Address:
                <textarea
                    name="businessAddress"
                    value={invoiceData.businessAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipient Name:
                <input
                    type="text"
                    name="recipientName"
                    value={invoiceData.recipientName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipient Address:
                <textarea
                    name="recipientAddress"
                    value={invoiceData.recipientAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm leading-normal">
                <th className="py-3 px-6 text-center">Description</th>
                <th className="py-3 px-6 text-center">Price</th>
                <th className="py-3 px-6 text-center">Quantity</th>
                <th className="py-3 px-6 text-center">Total</th>
              </tr>
              </thead>
              <tbody>
              {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <input
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <input
                          type="number"
                          name="price"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                          className="text-right mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <input
                          type="number"
                          name="qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                          className="text-right mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <input readOnly className="border-0 text-right focus:border-0 outline-0 active:border-0 ring-0"
                             type="number"
                             name="total"
                             value={item.price * item.qty}
                      />
                    </td>

                  </tr>
              ))}
              </tbody>
            </table>
            <button type="button" onClick={addItem} className="mt-4 py-2 px-4 bg-blue-500 text-white rounded">
              Add Item
            </button>
          </div>
          <button
              type="button"
              onClick={generatePDF}
              className="py-2 px-4 bg-green-500 text-white rounded shadow-md hover:bg-green-600"
          >
            Generate PDF
          </button>
        </form>
      </div>
  );
};

export default App;
