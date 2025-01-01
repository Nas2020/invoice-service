// //src/components/pdf/WaveInvoice.tsx
import React from "react";
import { Page, Text, View, StyleSheet, Document } from "@react-pdf/renderer";
import { InvoiceDataForPDF } from "../../services/pdf";

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
    width: "100%",
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
    minHeight: 40,
    // Prevent splitting
    pageBreakInside: "avoid",
  },
  date: {
    width: "15%",
  },
  description: {
    width: "60%",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  quantity: {
    width: "5%",
    textAlign: "right",
  },
  price: {
    width: "10%",
    textAlign: "right",
  },
  amount: {
    width: "10%",
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  notes: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  summarySection: {
    marginLeft: "auto",
    width: "40%",
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
  tableFooter: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 12,
    backgroundColor: "#fafafa",
    fontWeight: "bold",
  },
  formNumber: {
    position: "absolute",
    top: 40,
    right: 40,
    fontSize: 8,
    color: "#666666",
  },
  footerContainer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#666666",
  },
});

interface WaveInvoiceProps {
  data: InvoiceDataForPDF;
}

export const WaveInvoice: React.FC<WaveInvoiceProps> = ({ data }) => {
  const totalHours = data.items.reduce((sum, item) => sum + item.hours, 0);
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <Document>
      {/*
        We rely on React PDF to create additional pages 
        automatically if the content doesn't fit on one.
      */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.headerTitle}>INVOICE</Text>
        <Text style={styles.formNumber}>
          {data.info.formNumber} Rev:-{data.info.revision}
        </Text>

        {/* From & Invoice Info */}
        <View style={styles.rowBetween}>
          <View style={styles.fromSection}>
            <Text style={styles.value}>{data.from?.name}</Text>
            <Text style={styles.role}>{data.from?.role}</Text>
            <Text style={styles.value}>{data.from?.addressLine1}</Text>
            <Text style={styles.value}>{data.from?.addressLine2}</Text>
            <Text style={styles.value}>{data.from?.country}</Text>
            <Text style={styles.value}>Phone: {data.from?.phone}</Text>
            <Text style={styles.value}>GST/HST: {data.from?.gst}</Text>
          </View>

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

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.label}>BILL TO</Text>
          <Text style={styles.value}>{data.to.company}</Text>
          <Text style={styles.value}>{data.to.addressLine1}</Text>
          <Text style={styles.value}>{data.to.addressLine2}</Text>
          <Text style={styles.value}>{data.to.country}</Text>
          <Text style={styles.value}>Email: {data.to?.email}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.label}>ITEMS</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.date}>DATE</Text>
            <Text style={styles.description}>DESCRIPTION</Text>
            <Text style={styles.quantity}>HOURS</Text>
            <Text style={styles.price}>RATE</Text>
            <Text style={styles.amount}>AMOUNT</Text>
          </View>

          {data.items.map((item, index) => (
            // wrap={false} + pageBreakInside: 'avoid' => no row splitting
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.quantity}>{item.hours}</Text>
              <Text style={styles.price}>{formatCurrency(item.rate ?? 0)}</Text>
              <Text style={styles.amount}>
                {formatCurrency(item.amount ?? 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Row with total hours */}
        <View style={styles.tableFooter}>
          <Text style={styles.date} />
          <Text style={styles.description}>Total Hours</Text>
          <Text style={styles.quantity}>{totalHours.toFixed(2)}</Text>
          <Text style={styles.price} />
          <Text style={styles.amount} />
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text>SUBTOTAL</Text>
            <Text>{formatCurrency(data.totals.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>GST/HST RATE</Text>
            <Text>{data.totals.taxRate}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>GST/HST</Text>
            <Text>{formatCurrency(data.totals.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DUE</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(data.totals.total)} {data.info.currency}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notes}>
          <Text style={styles.label}>NOTES</Text>
          <Text style={styles.value}>{data.notes}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer} fixed>
          {/* Your existing footer text or other footer content */}
          <Text style={styles.footerText}>
            {data.info.formNumber} Rev:-{data.info.revision} Generated by Nas
            Til
          </Text>

          {/* Dynamic page numbers */}
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default WaveInvoice;
