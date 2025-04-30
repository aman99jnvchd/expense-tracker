import { useEffect, useState } from "react";
import { addExpense, getExpenses, updateExpense, deleteExpense } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Expense } from "../types/expense";
import SummarySection from '../components/SummarySection';

const ExpensePage = () => {
  const { token, logout } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedExpense, setEditedExpense] = useState<Partial<Expense>>({});
  const [editingCategoryMode, setEditingCategoryMode] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ amount: 0, category: "", description: "" });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [addExpenseError, setAddExpenseError] = useState("");
  const emptyErrors: any = { amount: "", category: "", description: "" };
  const [updateExpenseError, setUpdateExpenseError] = useState(emptyErrors);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    document.title = "Expenses | Expense Tracker";
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const fetchExpenses = async () => {
    try {
      const fetchedExpenses = await getExpenses(token);
      setExpenses(fetchedExpenses);
      const uniqueCategories : string[] = Array.from(new Set(fetchedExpenses.map((e: Expense) => e.category)));
      setCategories(uniqueCategories);
    } catch (err: any) {
        if (err.response?.data?.detail) {
            console.error(err.response.data.detail);
        } else if (typeof err.response?.data === "string") {
            console.error(err.response.data);
        } else {
            console.error("Something went wrong. Retry");
        }
    }
  };

  const saveExpense = async () => {
    if ([newExpense.amount, newExpense.category, newExpense.description].some(field => !field)) {
        setAddExpenseError("All fields are required");
    } else {
        try {
            await addExpense(newExpense, token);
            setNewExpense({ amount: 0, category: "", description: "" });
            setIsCustomCategory(false);
            setShowAddForm(false);
            await fetchExpenses();
        } catch (err) {
            console.error("Error adding expense:", err);
        }
    }
  };

  const cancelAdd = () => {
    setAddExpenseError("");
    setShowAddForm(false);
    setNewExpense({ amount: 0, category: "", description: "" });
    setIsCustomCategory(false);
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditedExpense(expense);
    setEditingCategoryMode(false);
  };

  const saveEdit = async () => {
    if ([editedExpense.amount, editedExpense.category, editedExpense.description].some(field => !field)) {
        const errors = {
            amount: editedExpense.amount ? "" : "Amount is required",
            category: editedExpense.category ? "" : "Category is required",
            description: editedExpense.description ? "" : "Description is required",
        };
                
        setUpdateExpenseError(errors);
        return;
    }

    try {
        await updateExpense(editingId, editedExpense, token);
        setEditingId(null);
        setEditedExpense({});
        await fetchExpenses();
        setUpdateExpenseError(emptyErrors);
    } catch (err) {
        console.error("Error updating expense:", err);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedExpense({});
    setEditingCategoryMode(false);
    setUpdateExpenseError(emptyErrors);
  };

  const removeExpense = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete this expense?");
    if (!confirm) return;

    try {
      await deleteExpense(id, token);
      await fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const getMonthOptions = () => {
    const months = Array.from(new Set(expenses.map(exp => {
      const date = new Date(exp.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })));
    return months;
  };

  useEffect(() => {
    applyFilters();
  }, [expenses, selectedCategory, selectedMonth]);

  const applyFilters = () => {
    let temp = [...expenses];
    if (selectedCategory) {
      temp = temp.filter(exp => exp.category === selectedCategory);
    }
    if (selectedMonth) {
      temp = temp.filter(exp => {
        const date = new Date(exp.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthYear === selectedMonth;
      });
    }
    setFilteredExpenses(temp);
  };

  return (
    <div>
        <h2 className="text-center">Expense Tracker</h2>
        <button onClick={logout} className="absolute top-[10px] right-[8px] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]">
            Sign out
        </button>

        <SummarySection />
        <div className="mb-[13px] flex flex-row justify-between items-center">
            <div className="flex flex-row justify-start">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-[7px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                >
                    <option value="">All Months</option>
                    {getMonthOptions().map(month => (
                        <option key={month} value={month}>
                            {new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </option>
                    ))}
                </select>

                {(selectedCategory || selectedMonth) && (
                    <button
                        onClick={() => { setSelectedCategory(""); setSelectedMonth(""); }}
                        className="ml-[7px] bg-[#c82333] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#c82333] focus-visible:border-[#c82333] hover:bg-[#dc3545] hover:border-transparent"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
            <div className="">
                {showAddForm &&
                    <button
                        className="mr-[10px] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]"
                        onClick={saveExpense}
                    >
                        Save
                    </button>
                }

                <button
                    className="rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]"
                    onClick={() => {
                        setShowAddForm(!showAddForm)
                        showAddForm && cancelAdd()
                    }}
                >
                    {showAddForm ? "Cancel" : "Add New Expense"}
                </button>
            </div>
        </div>

        {showAddForm && (
            <div className="p-[20px_20px] bg-[#1a1a1a]">
                <div className="flex flex-row items-start justify-center">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={newExpense.amount || ""}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                        className="mr-[4px] min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                    />

                    <div className="flex flex-col">
                        <select
                            value={isCustomCategory ? "__custom__" : newExpense.category || ""}
                            onChange={(e) => {
                                if (e.target.value === "__custom__") {
                                    setIsCustomCategory(true);
                                    setNewExpense({ ...newExpense, category: "" });
                                } else {
                                    setIsCustomCategory(false);
                                    setNewExpense({ ...newExpense, category: e.target.value });
                                }
                            }}
                            className="min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                            <option value="__custom__">Add New Category</option>
                        </select>

                        {isCustomCategory && (
                            <input
                                type="text"
                                placeholder="New Category"
                                value={newExpense.category || ""}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="mt-[5px] min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                            />
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Description"
                        value={newExpense.description || ""}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="ml-[4px] min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                    />
                </div>
                {addExpenseError &&
                    <div className="mt-[5px] flex justify-center">
                        <label className="text-[#dc3545]">{addExpenseError}</label>
                    </div>
                }
            </div>
        )}

        <div className="overflow-x-auto mt-[10px]">
            <table className="min-w-[750px] bg-[#202020] border-collapse">
                <thead className="bg-[#1a1a1a]">
                    <tr className="text-center">
                        <th className="border border-none p-[15px_20px] text-[14px]">Amount</th>
                        <th className="border border-none p-[15px_20px] text-[14px]">Category</th>
                        <th className="border border-none p-[15px_20px] text-[14px]">Description</th>
                        <th className="border border-none p-[15px_20px] text-[14px]">Date</th>
                        <th className="border border-none p-[15px_20px] text-[14px]">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExpenses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="pt-[20px] pb-[20px] text-center">No Expenses Found</td>
                        </tr>
                    ) : (
                        filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="text-center">
                                {editingId === expense.id ? (
                                    <>
                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            <input
                                                type="number"
                                                value={editedExpense.amount || ""}
                                                onChange={(e) =>
                                                setEditedExpense({ ...editedExpense, amount: parseFloat(e.target.value) })
                                                }
                                                className="min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                                            />
                                            { updateExpenseError.amount &&
                                                <div className="mt-[5px] mb-[-25px] flex justify-center">
                                                    <label className="text-[#dc3545]">{updateExpenseError.amount}</label>
                                                </div>
                                            }
                                        </td>

                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            <div className="flex flex-col">
                                                <select
                                                    value={editingCategoryMode ? "__custom__" : editedExpense.category || ""}
                                                    onChange={(e) => {
                                                        if (e.target.value === "__custom__") {
                                                            setEditingCategoryMode(true);
                                                            setEditedExpense({ ...editedExpense, category: "" });
                                                        } else {
                                                            setEditingCategoryMode(false);
                                                            setEditedExpense({ ...editedExpense, category: e.target.value });
                                                        }
                                                    }}
                                                    className="min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                                                >
                                                    <option value="">Select</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                                    <option value="__custom__">Add New Category</option>
                                                </select>

                                                {editingCategoryMode && (
                                                    <input
                                                        type="text"
                                                        placeholder="New Category"
                                                        value={editedExpense.category || ""}
                                                        onChange={(e) =>
                                                            setEditedExpense({ ...editedExpense, category: e.target.value })
                                                        }
                                                        className="mt-[5px] min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                                                    />
                                                )}
                                            </div>
                                            { updateExpenseError.category &&
                                                <div className="mt-[5px] mb-[-25px] flex justify-center">
                                                    <label className="text-[#dc3545]">{updateExpenseError.category}</label>
                                                </div>
                                            }
                                        </td>

                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            <input
                                                type="text"
                                                value={editedExpense.description || ""}
                                                onChange={(e) =>
                                                setEditedExpense({ ...editedExpense, description: e.target.value })
                                                }
                                                className="min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
                                            />
                                            { updateExpenseError.description &&
                                                <div className="mt-[5px] mb-[-25px] flex justify-center">
                                                    <label className="text-[#dc3545]">{updateExpenseError.description}</label>
                                                </div>
                                            }
                                        </td>

                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            {expense.date.split("T")[0]}
                                        </td>
                                        
                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            <button
                                                className="bg-[#0069d9] mr-[5px] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-transparent focus-visible:border-transparent hover:border-transparent"
                                                onClick={saveEdit}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className="bg-[#c82333] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-transparent focus-visible:border-transparent hover:border-transparent"
                                                onClick={cancelEditing}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border border-none p-[15px_20px] text-[14px]">₹{expense.amount.toFixed(2)}</td>
                                        <td className="border border-none p-[15px_20px] text-[14px]">{expense.category}</td>
                                        <td className="border border-none p-[15px_20px] text-[14px]">{expense.description}</td>
                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                        {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="border border-none p-[15px_20px] text-[14px]">
                                            <button
                                                className="hover:border-[#0069d9] mr-[5px] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#0069d9] focus-visible:border-[#0069d9]"
                                                onClick={() => startEditing(expense)}
                                            >
                                                Edit
                                            </button>
                                            
                                            <button
                                                className="hover:border-[#c82333] rounded-[4px] transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#c82333] focus-visible:border-[#c82333]"
                                                onClick={() => removeExpense(expense.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ExpensePage;
