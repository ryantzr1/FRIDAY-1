import { useState } from "react";

function RequestContainer({ log, onCategoryChange, userInfo }) {
  const { _id, question, answer, success, name, mobile, category } = log;
  const successColor = success ? "text-green-500" : "text-red-500";
  const [selectedCategory, setSelectedCategory] = useState(category);
  const categoryList = userInfo.questionCategories;

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    onCategoryChange(_id, newCategory);
  };

  return (
    <div className="border border-green-500 rounded-lg p-4 flex items-center justify-between mb-4 shadow-sm">
      <div>
        <div className="mb-2">
          <span className="font-bold mr-2">Name:</span>
          <span>{name}</span>
        </div>
        {/* <div className="mb-2">
          <span className="font-bold mr-2">Mobile Number:</span>
          <span>{mobile}</span>
        </div> */}
        <div className="mb-2">
          <span className="font-bold mr-2">Question:</span>
          <span>{question}</span>
        </div>
        <div className="mb-2">
          <span className="font-bold mr-2">Answer:</span>
          <span className={`font-bold ${successColor}`}>{answer}</span>
        </div>
        <div>
          <label
            htmlFor={`category-${_id}`}
            className="font-bold mr-2 text-gray-900 dark:text-white"
          >
            Category:
          </label>
          <select
            id={`category-${_id}`}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 mr-2 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categoryList.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
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
