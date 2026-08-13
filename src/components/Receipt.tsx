import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Download, Printer, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface ReceiptData {
  receiptId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  planDuration: string;
  amount: number;
  currency: string;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  paymentProvider: string;
  transactionId: string;
  paymentStatus: string;
  purchaseDate: string;
  purchaseTimestamp: string;
}

export function Receipt() {
  const { receiptId } = useParams<{ receiptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false); // In a real app we might fetch this from the backend or the receipt data itself

  useEffect(() => {
    if (!user || !receiptId) {
      if (!user) {
        setError("You must be logged in to view receipts.");
        setLoading(false);
      }
      return;
    }

    const fetchReceipt = async () => {
      try {
        const response = await fetch(`/api/receipts/${receiptId}`, {
          headers: {
            "x-user-id": user.uid,
            "x-user-email": user.email || "",
            "x-user-name": user.displayName || ""
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to load receipt or unauthorized.");
        }
        
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error("Invalid response format");
        }
        
        const data = await response.json();
        setReceipt(data);
        
        // Simple test mode check based on transaction ID
        if (data.transactionId?.includes("TEST")) {
          setIsTestMode(true);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReceipt();
  }, [user, receiptId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 64, 175); // Blue
    doc.text("BUYWISE", 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Premium Purchase Receipt", 20, 30);
    
    if (isTestMode) {
      doc.setTextColor(220, 38, 38);
      doc.text("TEST RECEIPT - NOT A REAL PAYMENT", 20, 40);
      doc.setTextColor(0, 0, 0);
    }
    
    // Customer Info
    doc.setFontSize(12);
    doc.text(`Receipt ID: ${receipt.receiptId}`, 20, 50);
    doc.text(`Customer Name: ${receipt.customerName}`, 20, 60);
    doc.text(`Customer Email: ${receipt.customerEmail}`, 20, 70);
    doc.text(`Date: ${receipt.purchaseDate}`, 20, 80);
    
    // Purchase Details Table
    doc.line(20, 90, 190, 90);
    
    doc.text("Purchase Details", 20, 100);
    
    doc.text("Plan:", 20, 115);
    doc.text(`${receipt.planName} (${receipt.planDuration})`, 80, 115);
    
    doc.text("Transaction ID:", 20, 125);
    doc.text(receipt.transactionId || "N/A", 80, 125);
    
    doc.text("Payment Method:", 20, 135);
    doc.text(receipt.paymentMethod, 80, 135);
    
    doc.text("Status:", 20, 145);
    doc.text(receipt.paymentStatus, 80, 145);
    
    doc.line(20, 155, 190, 155);
    
    // Amount
    doc.text("Amount Details", 20, 165);
    
    doc.text("Subtotal:", 20, 180);
    doc.text(`${receipt.currency} ${receipt.amount.toLocaleString()}`, 150, 180, { align: "right" });
    
    doc.text("Tax (18% GST):", 20, 190);
    doc.text(`${receipt.currency} ${receipt.tax.toLocaleString()}`, 150, 190, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 20, 205);
    doc.text(`${receipt.currency} ${receipt.totalAmount.toLocaleString()}`, 150, 205, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing BuyWise.", 105, 250, { align: "center" });
    doc.text("buywise.in", 105, 260, { align: "center" });
    
    doc.save(`BuyWise-Receipt-${receipt.receiptId}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-24">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Receipt</h2>
          <p className="text-gray-600 mb-6">{error || "Receipt not found."}</p>
          <button 
            onClick={() => navigate('/premium')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-24 pb-12 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/premium')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to BuyWise
        </button>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3 mb-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
        
        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              {receipt.paymentStatus === 'PAID' ? (
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">{receipt.paymentStatus}</span>
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-1 tracking-tight">BUYWISE</h1>
              <p className="text-blue-100 font-medium">Premium Purchase Receipt</p>
              
              {isTestMode && (
                <div className="mt-4 inline-block bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Test Receipt — Not A Real Payment
                </div>
              )}
            </div>
            
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none">
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-white fill-current">
                 <polygon points="0,100 100,0 100,100" />
               </svg>
            </div>
          </div>
          
          <div className="p-8">
            {/* Customer & General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                <p className="font-medium text-gray-900">{receipt.customerName}</p>
                <p className="text-gray-600">{receipt.customerEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Receipt Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Receipt ID:</span>
                  <span className="font-medium text-gray-900 text-right">{receipt.receiptId}</span>
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900 text-right">{receipt.purchaseDate}</span>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-100 mb-8" />
            
            {/* Purchase Details */}
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Purchase Details</h3>
            <div className="bg-gray-50 rounded-xl p-5 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">{receipt.planName} Plan</span>
                <span className="font-medium text-gray-900">{receipt.currency} {receipt.amount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Duration: {receipt.planDuration}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="block text-gray-500 mb-1">Transaction ID</span>
                  <span className="font-medium font-mono text-gray-900 break-all">{receipt.transactionId || 'Pending'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Payment Method</span>
                  <span className="font-medium text-gray-900">{receipt.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{receipt.currency} {receipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>{receipt.currency} {receipt.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Paid</span>
                  <span className="text-2xl font-bold text-gray-900">{receipt.currency} {receipt.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-gray-500 text-sm">
            <p>Thank you for choosing BuyWise Premium!</p>
            <p className="mt-1">For any support, contact us at support@buywise.in</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
