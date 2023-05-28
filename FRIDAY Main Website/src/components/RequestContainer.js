import { useState } from "react";

function RequestContainer({ log, onCategoryChange }) {
  const { _id, question, answer, success, name, mobile, category } = log;
  const successColor = success ? "text-green-500" : "text-red-500";
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    onCategoryChange(_id, newCategory);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-4">
      <div>
        <div>
          <span className="font-bold">Name: </span>
          {name}
        </div>
        <div>
          <span className="font-bold">Mobile Number: </span>
          {mobile}
        </div>
        <div>
          <span className="font-bold">Question: </span>
          {question}
        </div>
        <div className="font-bold">
          Answer: <span className={`text-sm ${successColor}`}>{answer}</span>
        </div>
        <div>
          <label htmlFor={`category-${_id}`} className="mb-2 font-bold text-gray-900 dark:text-white">
            Category:{" "}
          </label>
          <select
            id={`category-${_id}`}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 m-2 w-fit dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="Product">Product</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Price List">Price List</option>
          </select>
        </div>
      </div>
      <div className={`bg-gray-200 rounded-full px-2 py-1 ${successColor}`}>
        {success ? "Answered" : "Unanswered"}
      </div>
    </div>
  );
}

export default RequestContainer;