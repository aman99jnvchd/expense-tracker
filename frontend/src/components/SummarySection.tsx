import { useState, useEffect } from 'react';
import { getSummaryByCategory, getSummaryByMonth } from '../services/api';
import { useAuth } from "../context/AuthContext";

const SummarySection = () => {
    const { token } = useAuth();
    const [activeButton, setActiveButton] = useState<'category' | 'month'>('category');
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, [activeButton]);

    const fetchSummary = async () => {
        try {
            if (activeButton === 'category') {
                const data = await getSummaryByCategory(token);
                setSummaryData(data);
            } else {
                const data = await getSummaryByMonth(token);
                setSummaryData(data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    return (
        <div className="mb-[10px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-[4px] flex flex-row items-center justify-between w-full focus:outline-none focus:border-transparent active:outline-none active:border-transparent hover:outline-none hover:border-transparent"
            >
                <h2 className="m-[0px]">Summary</h2>
                <span>
                    { isOpen ? '▼' : '▲'}
                </span>
            </button>

            { isOpen && (
                <div className="flex flex-col mt-[10px] bg-[#202020] p-[20px]">
                    <div className="flex flex-row">
                        <button
                            onClick={() => setActiveButton('category')}
                            className={`mr-[5px] ${activeButton === 'category' ? 'border-[#646cff]' : 'border-transparent'} rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]`}
                        >
                            Category
                        </button>
                        <button
                            onClick={() => setActiveButton('month')}
                            className={`${activeButton === 'month' ? 'border-[#646cff]' : 'border-transparent'} rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]`}
                        >
                            Month
                        </button>
                    </div>

                    <div className="mt-[10px] bg-[#1a1a1a] p-[20px_20px] ">
                        <table className="w-full text-left">
                            <thead className='bg-[#1a1a1a]'>
                                <tr>
                                    <th className="border-b p-[5px]">{activeButton === 'category' ? 'Category' : 'Month'}</th>
                                    <th className="border-b p-[5px]">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="pt-[20px] pb-[20px] text-center">
                                            { activeButton === 'category' ? 'Category' : 'Month' } Summary Not Available
                                        </td>
                                    </tr>
                                ) : (
                                    summaryData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border-b p-[2px_5px]">{activeButton === 'category' ? item.category : item.month}</td>
                                            <td className="border-b p-[2px_5px]">₹{item.total}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummarySection;
