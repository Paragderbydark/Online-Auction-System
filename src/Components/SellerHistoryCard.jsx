import '../Styles/History.css'

function SellerHistorycard({ transactions }) {
    return (
        <div>
            {transactions.map((item, index) => (
                <div 
                    key={item.id || index}
                    className="bg-[#393f4d] rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#feda6a]/20 hover:-translate-y-1 m-4 sm:m-6"
                >
                
                    <div className="flex-1 text-[#d4d4dc]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Auction ID:</strong>
                                    <span className="text-[#d4d4dc] text-l">{item.auctionId}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Product ID:</strong>
                                    <span className="text-[#d4d4dc] text-l">{item.productId}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Buyer:</strong>
                                    <span className="text-[#d4d4dc] text-l">{item.buyerId}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Final Price:</strong>
                                    <span className="text-[#d4d4dc] font-semibold text-l">₹{item.finalAmount}</span>
                                </div>
                                
                            </div>

                            <div className="space-y-4">
                                {item.transactionStatus!='Pending' &&(<div className="flex items-start gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px] flex-shrink-0">Transaction ID:</strong>
                                    <span className="text-[#d4d4dc] break-all text-l font-mono">{item.transactionId}</span>
                                </div>)}
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Date:</strong>
                                    <span className="text-[#d4d4dc] text-l">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Time:</strong>
                                    <span className="text-[#d4d4dc] text-l">
                                        {new Date(item.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <strong className="text-[#feda6a] font-semibold text-l min-w-[100px]">Status:</strong>
                                    <span className={`px-3 py-1 rounded-lg border font-semibold transition-all duration-300 text-l ${
                                        item.transactionStatus.toLowerCase() === 'succesful' 
                                            ? 'text-green-400 border-green-400 bg-[#1d1e22]' 
                                            : item.transactionStatus.toLowerCase() === 'pending'
                                            ? 'text-[#feda6a] border-[#feda6a] bg-[#1d1e22]'
                                            : 'text-red-400 border-red-400 bg-[#1d1e22]'
                                    }`}>
                                        {item.transactionStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default SellerHistorycard;