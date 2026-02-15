import SellerNavbar from "../../Components/SellerNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/BuyerPaymentPage.css";
import SellerHistorycard from "../../Components/SellerHistoryCard";
import { IoMdArrowBack } from "react-icons/io";
import { getAuthToken, getUserData } from "../../Utils/auth";
import { PAYMENT_SERVICE_URL, PRODUCT_SERVICE_URL, SERVER_URL } from "../../Utils/config";
import axios from "axios";

export default function SellerPaymentsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [transactions,setTransactions] = useState([])

  useEffect(() => {
    fetchTransactions();
  }, []);


  const fetchTransactions = async () => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // const response = await axios.get(`${SERVER_URL}/payments/seller/${userId}`, {
      const response = await axios.get(`${PAYMENT_SERVICE_URL}/seller/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched transactions:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'all') return true;
    return tx.transactionStatus?.toUpperCase() === activeFilter.toUpperCase();
  });

  const filterOptions = [
    { key: 'all', label: 'All Transactions', count: transactions.length },
    { key: 'SUCCESFUL', label: 'Successful', count: transactions.filter(t => t.transactionStatus === 'SUCCESFUL').length },
    { key: 'PENDING', label: 'Pending', count: transactions.filter(t => t.transactionStatus === 'PENDING').length },
    { key: 'FAILED', label: 'Failed', count: transactions.filter(t => t.transactionStatus === 'FAILED').length }
  ];

  return (
    <div className="payments-page">
      <SellerNavbar />
      <div className="payments-header">
        <div className="header-content">
          <div className="header-left">
            <IoMdArrowBack 
              onClick={() => navigate('/seller')} 
              style={{
                fontSize: '40px',
                cursor: 'pointer',
                padding: '8px',
                backgroundColor: '#393f4d',
                borderRadius: '50%',
                color: '#feda6a'
              }}
            />
            <h1 className="page-title">Payment History</h1>
            <p className="page-subtitle">Track all your auction transactions and payment details</p>
          </div>
          <div className="header-right">
            <div className="total-stats">
              <div className="stat-item">
                <span className="stat-value">{`$${(transactions.reduce((acc, tx) => acc + tx.finalAmount, 0)).toLocaleString()}`}</span>
                <span className="stat-label">Total Spent</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{transactions.length}</span>
                <span className="stat-label">Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="payments-controls">
        <div className="controls-content">
          <div className="filter-tabs">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                className={`filter-tab ${activeFilter === option.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(option.key)}
              >
                {option.label}
                <span className="filter-count">{option.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="payments-content">
        <SellerHistorycard transactions={filteredTransactions} />
      </div>
    </div>
  );
}
