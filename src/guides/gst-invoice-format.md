---
title: GST invoice format: every field your bill must have
description: The mandatory details on a GST tax invoice, when to issue a bill of supply instead, numbering rules, HSN requirements and the copies you need, with a sample layout.
category: GST & tax
updated: 2026-11-12
tools: invoice-generator, gst-calculator, amount-in-words, gstin-validator
cta: gst
---

A GST invoice is not just a bill. It is the document your customer uses to claim input tax credit and the document tax officers check first. A missing field can cost your customer their credit and cost you the customer.

You can make a compliant invoice in a minute with our free [invoice generator]({{root}}tools/invoice-generator/). Here is what goes into it and why.

## Tax invoice or bill of supply?

- Issue a **tax invoice** when you are a regular GST-registered business selling taxable goods or services.
- Issue a **bill of supply** when you are under the composition scheme, or when you sell only exempt goods or services. A bill of supply shows no GST.
- A **receipt voucher** is issued when you receive an advance, and a **credit note** or **debit note** adjusts an invoice already issued.

## The mandatory fields on a tax invoice

1. Your name, address and GSTIN.
2. An invoice number: consecutive, unique for the financial year, up to 16 characters, using letters, numbers, hyphens or slashes. For example `BK/26-27/0145`.
3. Date of issue.
4. Customer's name and address.
5. Customer's GSTIN, if they are registered.
6. For an unregistered customer with a value of ₹50,000 or more, the delivery address with state name and state code.
7. HSN code for goods or SAC code for services.
8. Description of the goods or services.
9. Quantity and unit, such as kg, pcs or box.
10. Total value of the supply.
11. Taxable value after any discount.
12. GST rate and amount, split into CGST and SGST, or shown as IGST.
13. Place of supply, with the state name, for inter-state supplies.
14. Whether tax is payable on reverse charge.
15. Signature or digital signature of the supplier or authorised person.

## How many HSN digits?

| Your aggregate turnover in the previous year | HSN digits on invoices |
|---|---|
| Up to ₹5 crore | 4 digits (mandatory for B2B; optional for B2C) |
| Above ₹5 crore | 6 digits on all invoices |

## A sample layout

| | |
|---|---|
| **Tax invoice** | Invoice no. BK/26-27/0145, dated 12 Nov 2026 |
| **From** | Shree Ganesh Traders, Main Bazar, Jaipur, Rajasthan, GSTIN 08XXXXX... |
| **To** | Mehta Stores, Ajmer, Rajasthan, GSTIN 08YYYYY... |
| **Place of supply** | Rajasthan (08) |

| Item | HSN | Qty | Rate | Taxable value | CGST 9% | SGST 9% | Total |
|---|---|---|---|---|---|---|---|
| Steel utensils set | 7323 | 10 pcs | ₹850 | ₹8,500 | ₹765 | ₹765 | ₹10,030 |

Amount in words: Rupees Ten Thousand Thirty only. Our [amount-in-words tool]({{root}}tools/amount-in-words/) writes this line for any figure in the Indian lakh and crore system.

## Copies of the invoice

For goods, prepare three copies: the original for the buyer, the duplicate for the transporter, and the triplicate for your own records. For services, two copies: original for the customer, duplicate for you.

## When to issue the invoice

- **Goods:** on or before removal of goods for delivery, or delivery itself.
- **Services:** within 30 days of providing the service. Banks and some financial services have longer periods.

## If your turnover is above ₹5 crore

B2B invoices must be reported on the government's Invoice Registration Portal to get an IRN and a signed QR code. This is **e-invoicing**. Below that threshold, a well-prepared invoice from any tool, including ours, is enough.

## Mistakes that cost customers their input tax credit

- Wrong or missing customer GSTIN.
- CGST and SGST charged on an inter-state sale instead of IGST.
- Invoice numbers that repeat or skip in the same year.
- Rate not matching the HSN code.
- Invoice not reported in your GSTR-1, so it never reaches the customer's GSTR-2B.

Check a customer's GSTIN format before billing with our [GSTIN checker]({{root}}tools/gstin-validator/).

## Common questions

<details class="faq"><summary>Is a signature mandatory on a GST invoice?</summary><p>Yes, the invoice must be signed by the supplier or an authorised representative, either physically or digitally. E-invoices with an IRN carry the portal's digital signature.</p></details>

<details class="faq"><summary>Can I restart invoice numbers every year?</summary><p>Yes. Numbers must be unique within a financial year, so most businesses add the year to the series, such as 26-27, and restart at 1 each April.</p></details>
