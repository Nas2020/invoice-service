import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceData } from "../services/pdf.service";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#1a237e",
  },
  section: {
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  fromSection: {
    marginBottom: 30,
  },
  label: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  value: {
    fontSize: 11,
    marginBottom: 4,
  },
  role: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 8,
  },
  table: {
    marginTop: 30,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 12,
  },
  // Updated column widths to accommodate date
  date: { width: "15%" },
  description: { width: "60%" },
  quantity: { width: "5%", textAlign: "right" },
  price: { width: "10%", textAlign: "right" },
  amount: { width: "10%", textAlign: "right" },
  // ... rest of the styles remain the same ...
  summarySection: {
    marginLeft: "auto",
    width: "40%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: "#1a237e",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a237e",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a237e",
  },
  notes: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#666666",
    fontSize: 9,
    fontStyle: "italic",
  },
});

interface WaveInvoiceProps {
  data: InvoiceData;
}

export const WaveInvoice = React.memo(({ data }: WaveInvoiceProps) => {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.headerTitle}>INVOICE</Text>

      <View style={styles.rowBetween}>
        {/* From Section */}
        <View style={styles.fromSection}>
          <Text style={styles.value}>{data?.from?.name}</Text>
          <Text style={styles.role}>{data?.from?.role}</Text>
          <Text style={styles.value}>{data?.from?.address}</Text>
          <Text style={styles.value}>{data?.from?.city}</Text>
          <Text style={styles.value}>Phone: {data?.from?.phone}</Text>
          <Text style={styles.value}>GST/HST: {data?.from?.gst}</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.column}>
          <View style={styles.section}>
            <Text style={styles.label}>INVOICE #</Text>
            <Text style={styles.value}>{data.info.number}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{data.info.date}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>DUE DATE</Text>
            <Text style={styles.value}>{data.info.dueDate}</Text>
          </View>
        </View>
      </View>

      {/* Bill To Section */}
      <View style={styles.section}>
        <Text style={styles.label}>BILL TO</Text>
        <Text style={styles.value}>{data.to.company}</Text>
        <Text style={styles.value}>{data.to.address}</Text>
        <Text style={styles.value}>{data.to.city}</Text>
        <Text style={styles.value}>{data.to.postalCode}</Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <Text style={styles.label}>ITEMS</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.date}>DATE</Text>
          <Text style={styles.description}>DESCRIPTION</Text>
          <Text style={styles.quantity}>HOURS</Text>
          <Text style={styles.price}>RATE (CAD)</Text>
          <Text style={styles.amount}>AMOUNT</Text>
        </View>

        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.quantity}>{item.hours}</Text>
            <Text style={styles.price}>${item.rate.toFixed(2)}</Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text>SUBTOTAL</Text>
          <Text>${data.totals.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>GST/HST RATE</Text>
          <Text>{data.totals.taxRate}%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>GST/HST</Text>
          <Text>${data.totals.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DUE</Text>
          <Text style={styles.totalAmount}>
            ${data.totals.total.toFixed(2)} CAD
          </Text>
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.notes}>
        <Text style={styles.label}>NOTES</Text>
        <Text style={styles.value}>{data.notes}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          This invoice was created By Nas Til
        </Text>
      </View>
    </Page>
  );
});