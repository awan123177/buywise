import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Receipt as ReceiptIcon, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReceiptData {
  receiptId: string;
  planName: string;
  amount: number;
  currency: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export function MyReceipts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchReceipts = async () => {
      try {
        const response = await fetch('/api/receipts', {
          headers: {
            "x-user-id": user.uid,
            "x-user-email": user.email || "",
            "x-user-name": user.displayName || ""
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch receipts");
        }
        
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error("Invalid response format");
        }
        
        const data = await response.json();
        setReceipts(data);
      } catch (err: any) {
        toast.error("Could not load receipts.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ReceiptIcon className="w-6 h-6 text-blue-600" />
              My Purchase Receipts
            </h1>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                You do not have any purchase receipts yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Receipt ID</th>
                      <th className="px-6 py-4 font-medium">Plan</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipts.map((receipt) => (
                      <tr key={receipt.receiptId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {receipt.receiptId}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {receipt.planName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(receipt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {receipt.currency} {receipt.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            receipt.paymentStatus === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {receipt.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <button
                            onClick={() => navigate(`/receipt/${receipt.receiptId}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
